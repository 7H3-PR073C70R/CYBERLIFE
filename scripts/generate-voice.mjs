#!/usr/bin/env node
/**
 * Cyberlife — Dynamic Pre-rendered Dialogue Voice Generator
 *
 * Scans all spoken dialogue lines from:
 *   - npcDialogueData.ts (NPC dialogue graphs)
 *   - chatData.ts (VoIP phone call dialogues)
 *   - ep01VoiceManifest.ts (Episode 01 spoken lines)
 *   - episodeData.ts (Episode 01 beat calls)
 *
 * Applies:
 *   - Centralized pronunciation dictionary and speech normalization
 *   - Character-appropriate Nigerian English voice casting (en-NG-EzinneNeural, en-NG-AbeoNeural)
 *   - Delivery prosody tags (neutral, calm, anxious, urgent, tired, tense) + per-line deterministic variation
 *   - Azure Cognitive Services Speech SSML with silence parameters
 *   - Edge TTS neural synthesis
 *   - Audio post-processing (silence trimming to <=60ms, internal silence compression to ~140ms with crossfade, EBU R128 -16 LUFS)
 *   - Automated Quality Gate validation
 *
 * Outputs to public/assets/audio/voice/ and writes manifest.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import ts from 'typescript';
import { processAudioClip, auditClip } from './voice_audio_processor.mjs';

const PROJECT_ROOT = process.cwd();
const VOICE_OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/assets/audio/voice');
const MANIFEST_PATH = path.join(VOICE_OUTPUT_DIR, 'manifest.json');
const ENV_LOCAL_PATH = path.join(PROJECT_ROOT, '.env.local');

// 1. Parse Command Line Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const isYes = args.includes('--yes') || args.includes('-y');
const isCleanUnused = args.includes('--clean-unused');

let backend = 'edge';
const backendArgIdx = args.findIndex(a => a === '--backend');
if (backendArgIdx !== -1 && args[backendArgIdx + 1]) {
  backend = args[backendArgIdx + 1].toLowerCase();
} else if (args.some(a => a.startsWith('--backend='))) {
  backend = args.find(a => a.startsWith('--backend=')).split('=')[1].toLowerCase();
}

let speakerFilter = null;
const filterArg = args.find(a => a.startsWith('--filter=') || a.startsWith('--speaker='));
if (filterArg) {
  speakerFilter = filterArg.split('=')[1].trim();
}

let adHocText = null;
const textArg = args.find(a => a.startsWith('--text='));
if (textArg) {
  adHocText = textArg.split('=').slice(1).join('=').replace(/^['"]|['"]$/g, '').trim();
}

// 2. Load .env.local if present
let azureKey = process.env.AZURE_SPEECH_KEY || '';
let azureRegion = process.env.AZURE_SPEECH_REGION || '';

if (fs.existsSync(ENV_LOCAL_PATH)) {
  const envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const k = match[1].trim();
      const v = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (k === 'AZURE_SPEECH_KEY') azureKey = v;
      if (k === 'AZURE_SPEECH_REGION') azureRegion = v;
    }
  }
}

if (backend === 'azure' && (!azureKey || !azureRegion)) {
  console.error('[Error] Azure backend requested but AZURE_SPEECH_KEY or AZURE_SPEECH_REGION not found.');
  console.error('Add your Azure credentials to .env.local or run with --backend edge.');
  process.exit(1);
}

if (backend === 'edge') {
  console.warn('\n================================================================================');
  console.warn('[WARNING] Using unofficial "edge" TTS backend (edge-tts).');
  console.warn('This connects to Microsoft Edge online TTS and is for development/testing ONLY.');
  console.warn('It is NOT officially licensed or supported for a shipped release.');
  console.warn('For production builds, provide licensed credentials and use --backend azure.');
  console.warn('================================================================================\n');
}

// 3. In-Memory TypeScript Module Transpiler & Loader
function loadTsModule(relativeFilePath) {
  const fullPath = path.join(PROJECT_ROOT, relativeFilePath);
  if (!fs.existsSync(fullPath)) return {};
  let code = fs.readFileSync(fullPath, 'utf8');
  code = code.replace(/import\s+type\s+[^;]+;/g, '');
  code = code.replace(/import\s+\{[^}]+\}\s+from\s+[^;]+;/g, '');
  code = code.replace(/import\s+[^;]+from\s+[^;]+;/g, '');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const moduleObj = { exports: {} };
  const fn = new Function('module', 'exports', 'require', transpiled);
  fn(moduleObj, moduleObj.exports, () => ({}));
  return moduleObj.exports;
}

// Load centralized pronunciation dictionary and casting
console.log('Loading pronunciation dictionary and character casting...');
const dictModule = loadTsModule('src/content/audio/pronunciationDictionary.ts');
const {
  normalizeTextForSpeech,
  CHARACTER_VOICE_CASTING = {},
  DELIVERY_PROSODY_TABLE = {},
} = dictModule;

// Load character profiles and chat threads
const npcProfilesModule = loadTsModule('src/simulation/actors/npcProfiles.ts');
const npcProfilesMap = new Map();
if (npcProfilesModule.NPC_PROFILES && Array.isArray(npcProfilesModule.NPC_PROFILES)) {
  for (const p of npcProfilesModule.NPC_PROFILES) {
    npcProfilesMap.set(p.id, p);
  }
}

const chatDataModule = loadTsModule('src/simulation/cyber/chat/chatData.ts');
const chatThreadsMap = new Map();
if (chatDataModule.INITIAL_CHAT_THREADS && Array.isArray(chatDataModule.INITIAL_CHAT_THREADS)) {
  for (const t of chatDataModule.INITIAL_CHAT_THREADS) {
    chatThreadsMap.set(t.contactId, t);
  }
}

/**
 * Resolves character voice settings dynamically.
 */
function resolveVoiceConfig(speakerId, delivery = 'neutral', lineSeed = '') {
  const casting = CHARACTER_VOICE_CASTING[speakerId] || {};
  const profile = npcProfilesMap.get(speakerId);
  const thread = chatThreadsMap.get(speakerId);
  const deliveryMod = DELIVERY_PROSODY_TABLE[delivery] || DELIVERY_PROSODY_TABLE.neutral;

  const speakerName =
    casting.displayName ||
    profile?.name ||
    thread?.contactName ||
    (speakerId === 'cipher' ? 'Cipher' : speakerId);

  const voice =
    casting.voice ||
    (profile?.voice?.gender === 'female' ? 'en-NG-EzinneNeural' : 'en-NG-AbeoNeural');

  // Compute deterministic per-line rate variation (+/- 2%)
  let deterministicDelta = 0;
  if (lineSeed) {
    let hash = 0;
    for (let i = 0; i < lineSeed.length; i++) {
      hash = (hash << 5) - hash + lineSeed.charCodeAt(i);
      hash |= 0;
    }
    deterministicDelta = ((Math.abs(hash) % 5) - 2); // -2, -1, 0, +1, +2%
  }

  const baseRate = casting.baseRatePercent ?? 0;
  const projectRateBoost = casting.isSynthetic ? 0 : 3; // Variant B project default +3% rate boost
  const totalRatePercent = baseRate + deliveryMod.rateDeltaPercent + deterministicDelta + projectRateBoost;
  const rateStr = totalRatePercent >= 0 ? `+${totalRatePercent}%` : `${totalRatePercent}%`;

  const basePitch = casting.basePitchHz ?? 0;
  const pitchDelta = Math.round((deliveryMod.pitchDeltaPercent / 100) * 10);
  const totalPitchHz = basePitch + pitchDelta;
  const pitchStr = totalPitchHz >= 0 ? `+${totalPitchHz}Hz` : `${totalPitchHz}Hz`;

  const isPidgin = Boolean(
    speakerId === 'npc_nkechi' ||
    profile?.voiceTone?.toLowerCase().includes('pidgin')
  );

  return {
    speaker: speakerName,
    voice,
    rate: rateStr,
    pitch: pitchStr,
    delivery,
    isPidgin,
    needsHumanRecording: isPidgin,
  };
}

// 4. Collect Dialogue Items
console.log('Collecting spoken dialogue items across all modules...');
const rawDialogueItems = [];

if (adHocText) {
  const speakerId = speakerFilter || 'npc_amina';
  const config = resolveVoiceConfig(speakerId, 'neutral', 'adhoc');
  const cleanText = normalizeTextForSpeech(adHocText, { isPidgin: config.isPidgin });
  rawDialogueItems.push({
    id: `${speakerId}:adhoc`,
    nodeId: 'adhoc',
    speakerId,
    speakerName: config.speaker,
    rawText: adHocText,
    cleanText,
    config,
  });
} else {
  // 1. NPC Dialogue Graphs
  const npcDialogueModule = loadTsModule('src/content/dialogue/npcDialogueData.ts');
  if (npcDialogueModule.ALL_DIALOGUE_GRAPHS) {
    for (const graph of npcDialogueModule.ALL_DIALOGUE_GRAPHS) {
      for (const [nodeId, node] of Object.entries(graph.nodes)) {
        if (node.text && typeof node.text === 'string') {
          const speakerId = node.speakerId || graph.npcId;
          if (speakerFilter && speakerId !== speakerFilter) continue;

          const delivery = node.delivery || 'neutral';
          const config = resolveVoiceConfig(speakerId, delivery, nodeId);
          const cleanText = normalizeTextForSpeech(node.text, {
            speechOverride: node.speech,
            isPidgin: config.isPidgin,
          });

          if (cleanText.length > 0) {
            rawDialogueItems.push({
              id: `${speakerId}:${nodeId}`,
              nodeId,
              speakerId,
              speakerName: config.speaker,
              rawText: node.text,
              speechText: node.speech,
              cleanText,
              config,
            });
          }
        }
      }
    }
  }

  // 2. Chat VoIP Call Dialogues
  if (chatDataModule.INITIAL_CHAT_THREADS) {
    for (const thread of chatDataModule.INITIAL_CHAT_THREADS) {
      if (thread.callDialogue && Array.isArray(thread.callDialogue)) {
        const speakerId = thread.contactId;
        if (speakerFilter && speakerId !== speakerFilter) continue;

        thread.callDialogue.forEach((cd, idx) => {
          const nodeId = `call_${idx}`;
          const delivery = cd.delivery || 'neutral';
          const config = resolveVoiceConfig(speakerId, delivery, `${speakerId}_${nodeId}`);
          const cleanText = normalizeTextForSpeech(cd.text, {
            speechOverride: cd.speech,
            isPidgin: config.isPidgin,
          });

          if (cleanText.length > 0) {
            rawDialogueItems.push({
              id: `${speakerId}:${nodeId}`,
              nodeId,
              speakerId,
              speakerName: config.speaker,
              rawText: cd.text,
              speechText: cd.speech,
              cleanText,
              config,
            });
          }
        });
      }
    }
  }

  // 3. Episode 01 Authored Voice Manifest
  const ep01ManifestModule = loadTsModule('src/simulation/narrative/ep01VoiceManifest.ts');
  if (ep01ManifestModule.EPISODE_01_VOICE_MANIFEST) {
    for (const entry of ep01ManifestModule.EPISODE_01_VOICE_MANIFEST) {
      let speakerId = 'npc_amina';
      if (entry.characterName === 'Barry') speakerId = 'npc_marcus';
      if (entry.characterName === 'Michael') speakerId = 'npc_femi';
      if (entry.characterName === 'Tsharp') speakerId = 'npc_tunde';
      if (entry.characterName === 'Mama Esther') speakerId = 'npc_nkechi';

      if (speakerFilter && speakerId !== speakerFilter) continue;

      const delivery = entry.delivery || 'neutral';
      const config = resolveVoiceConfig(speakerId, delivery, entry.id);
      const cleanText = normalizeTextForSpeech(entry.dialogueText, {
        speechOverride: entry.speech,
        isPidgin: config.isPidgin,
      });

      if (cleanText.length > 0) {
        rawDialogueItems.push({
          id: `${speakerId}:${entry.id}`,
          nodeId: entry.id,
          speakerId,
          speakerName: config.speaker,
          rawText: entry.dialogueText,
          speechText: entry.speech,
          cleanText,
          config,
        });
      }
    }
  }

  // 4. Episode 01 Beats (Calls & Narrative Dialogue)
  const episodeDataModule = loadTsModule('src/simulation/narrative/episodeData.ts');
  if (episodeDataModule.EPISODE_01_DATA && episodeDataModule.EPISODE_01_DATA.beats) {
    for (const beat of episodeDataModule.EPISODE_01_DATA.beats) {
      if (beat.effects && beat.effects.call && Array.isArray(beat.effects.call.dialogue)) {
        const call = beat.effects.call;
        const speakerId = call.callerId;
        if (speakerFilter && speakerId !== speakerFilter) continue;

        call.dialogue.forEach((cd, idx) => {
          const nodeId = `${call.id}_${idx}`;
          const delivery = cd.delivery || 'neutral';
          const config = resolveVoiceConfig(speakerId, delivery, nodeId);
          const cleanText = normalizeTextForSpeech(cd.text, {
            speechOverride: cd.speech,
            isPidgin: config.isPidgin,
          });

          if (cleanText.length > 0) {
            rawDialogueItems.push({
              id: `${speakerId}:${nodeId}`,
              nodeId,
              speakerId,
              speakerName: config.speaker,
              rawText: cd.text,
              speechText: cd.speech,
              cleanText,
              config,
            });
          }
        });
      }
    }
  }
}

// Deduplicate dialogue items by (speakerId, cleanText) so shared lines share clips
const seenDialogueKeys = new Map();
const dialogueItems = [];
for (const item of rawDialogueItems) {
  const key = `${item.speakerId}:${item.cleanText}`;
  if (!seenDialogueKeys.has(key)) {
    seenDialogueKeys.set(key, item);
    dialogueItems.push(item);
  }
}

console.log(`Discovered ${dialogueItems.length} spoken dialogue lines.`);

if (!fs.existsSync(VOICE_OUTPUT_DIR)) {
  fs.mkdirSync(VOICE_OUTPUT_DIR, { recursive: true });
}

// 5. Compute Hashes and Check Existence
let totalCharsToSend = 0;
const processedItems = [];
const pidginLines = [];

for (const item of dialogueItems) {
  const { voice, rate, pitch, isPidgin, needsHumanRecording, delivery } = item.config;
  const hashPayload = `${voice}|${rate}|${pitch}|${delivery}|${item.cleanText}`;
  const fileHash = crypto.createHash('sha256').update(hashPayload).digest('hex').slice(0, 16);
  const textHash = crypto.createHash('sha256').update(item.cleanText).digest('hex').slice(0, 16);
  const fileName = `${fileHash}.mp3`;
  const filePath = path.join(VOICE_OUTPUT_DIR, fileName);

  const exists = !isForce && fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  if (!exists) {
    totalCharsToSend += item.cleanText.length;
  }

  if (isPidgin || needsHumanRecording) {
    pidginLines.push({
      speaker: item.speakerName,
      speakerId: item.speakerId,
      nodeId: item.nodeId,
      rawText: item.rawText,
      cleanText: item.cleanText,
      fileHash,
      fileName,
    });
  }

  processedItems.push({
    ...item,
    fileHash,
    textHash,
    fileName,
    filePath,
    exists,
  });
}

const existingCount = processedItems.filter(i => i.exists).length;
const toGenerateCount = processedItems.filter(i => !i.exists).length;

console.log(`\nSummary:`);
console.log(`  Total lines in scope: ${processedItems.length}`);
console.log(`  Already generated (cached on disk): ${existingCount}`);
console.log(`  Lines to generate: ${toGenerateCount}`);
console.log(`  Total characters to send: ${totalCharsToSend}`);
console.log(`  Pidgin lines identified: ${pidginLines.length}\n`);

if (isDryRun && !isCleanUnused) {
  console.log('[Dry Run] Exiting without generating audio.');
  process.exit(0);
}

// 6. Generation Backends
async function generateAzure(item, targetPath) {
  const { voice, rate, pitch } = item.config;
  const escapedText = item.cleanText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Attempt standard SSML with mstts:silence
  const ssmlWithSilence = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${voice}">
    <mstts:silence type="Sentenceboundary-exact" value="185ms"/>
    <mstts:silence type="Comma-exact" value="85ms"/>
    <mstts:silence type="Leading-exact" value="25ms"/>
    <mstts:silence type="Tailing-exact" value="35ms"/>
    <prosody rate="${rate}" pitch="${pitch}">
      ${escapedText}
    </prosody>
  </voice>
</speak>`;

  const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': azureKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'CyberlifeVoiceGenerator',
    },
    body: ssmlWithSilence,
  });

  if (!response.ok) {
    // Fallback without mstts:silence
    const ssmlPlain = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voice}">
    <prosody rate="${rate}" pitch="${pitch}">
      ${escapedText}
    </prosody>
  </voice>
</speak>`;

    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'CyberlifeVoiceGenerator',
      },
      body: ssmlPlain,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Azure TTS failed: ${err}`);
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
}

function generateEdgeBatch(itemsToGenerate, tmpOutputDir) {
  const batchPayload = itemsToGenerate.map(i => ({
    id: i.id,
    file: path.join(tmpOutputDir, `${i.fileHash}_raw.mp3`),
    voice: i.config.voice,
    rate: i.config.rate,
    pitch: i.config.pitch,
    text: i.cleanText,
  }));

  const tmpBatchFile = path.join(PROJECT_ROOT, `.tmp_voice_batch_${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(tmpBatchFile, JSON.stringify(batchPayload), 'utf8');

  const helperScript = path.join(PROJECT_ROOT, 'scripts/edge_tts_batch.py');

  try {
    try {
      execSync(`UV_CACHE_DIR=/tmp/uv-cache uv run --with edge-tts python3 "${helperScript}" "${tmpBatchFile}"`, {
        stdio: 'inherit',
      });
    } catch {
      execSync(`python3 "${helperScript}" "${tmpBatchFile}"`, {
        stdio: 'inherit',
      });
    }
  } finally {
    try {
      fs.unlinkSync(tmpBatchFile);
    } catch {}
  }
}

// 7. Run Generation Loop with Post-Processing & Quality Gate
if (toGenerateCount > 0 && !isDryRun) {
  console.log(`Generating ${toGenerateCount} clips via backend '${backend}'...`);
  const ungenerated = processedItems.filter(i => !i.exists);
  const tmpOutputDir = path.join(PROJECT_ROOT, '.tmp_voice_raw');
  fs.mkdirSync(tmpOutputDir, { recursive: true });

  try {
    if (backend === 'edge') {
      generateEdgeBatch(ungenerated, tmpOutputDir);

      // Post-process all generated items
      console.log('\nPost-processing and normalizing audio clips...');
      for (const item of ungenerated) {
        const rawFile = path.join(tmpOutputDir, `${item.fileHash}_raw.mp3`);
        if (fs.existsSync(rawFile)) {
          processAudioClip(rawFile, item.filePath, { targetInternalSilenceMs: 185 });
        }
      }
    } else {
      let doneCount = 0;
      for (const item of ungenerated) {
        const rawFile = path.join(tmpOutputDir, `${item.fileHash}_raw.mp3`);
        await generateAzure(item, rawFile);
        processAudioClip(rawFile, item.filePath, { targetInternalSilenceMs: 185 });
        doneCount++;
        process.stdout.write(`\rProgress: ${doneCount} / ${toGenerateCount} [${item.speakerName}: ${item.fileName}]`);
      }
      console.log('');
    }
  } finally {
    try {
      fs.rmSync(tmpOutputDir, { recursive: true, force: true });
    } catch {}
  }
  console.log('Audio generation and post-processing complete!');
}

// 8. Quality Gate Audit
console.log('\nRunning Automated Quality Gate Audit across all active clips...');
const allAudits = [];
const qualityFailures = [];

for (const item of processedItems) {
  if (fs.existsSync(item.filePath)) {
    const audit = auditClip(item.filePath, item.cleanText);
    allAudits.push({ item, audit });
    if (!audit.pass) {
      qualityFailures.push({ item, audit });
    }
  }
}

console.log('\n================================================================================');
console.log('                      AUTOMATED AUDIO QUALITY GATE REPORT                       ');
console.log('================================================================================');
console.log(`Audited clips: ${allAudits.length} | Passing: ${allAudits.length - qualityFailures.length} | Failing: ${qualityFailures.length}`);

function printWorstFive(title, valueExtractor, unit, sorter, thresholdDesc) {
  console.log(`\nTop 5 Worst Offenders: ${title} (${thresholdDesc})`);
  const sorted = [...allAudits].sort(sorter).slice(0, 5);
  console.log(`| Rank | Clip File | Character | Measured Value | Status |`);
  console.log(`| :--- | :--- | :--- | :--- | :--- |`);
  sorted.forEach((e, idx) => {
    const val = valueExtractor(e.audit.metrics);
    const pass = e.audit.pass ? '✓ PASS' : '✗ FAIL';
    console.log(`| ${idx + 1} | ${e.item.fileName} | ${e.item.speakerName} | ${val}${unit} | ${pass} |`);
  });
}

if (allAudits.length > 0) {
  printWorstFive('Max Internal Silence', m => m.maxInternalGapMs, ' ms', (a, b) => b.audit.metrics.maxInternalGapMs - a.audit.metrics.maxInternalGapMs, 'max allowed: 260 ms');
  printWorstFive('Leading Silence', m => m.leadingSilenceMs, ' ms', (a, b) => b.audit.metrics.leadingSilenceMs - a.audit.metrics.leadingSilenceMs, 'max allowed: 80 ms');
  printWorstFive('Trailing Silence', m => m.trailingSilenceMs, ' ms', (a, b) => b.audit.metrics.trailingSilenceMs - a.audit.metrics.trailingSilenceMs, 'max allowed: 80 ms');
  printWorstFive('Speaking Rate Outlier', m => m.charsPerSec, ' cps', (a, b) => Math.abs(b.audit.metrics.charsPerSec - 14.5) - Math.abs(a.audit.metrics.charsPerSec - 14.5), 'plausible: 10.0-20.0 cps');
  printWorstFive('True Peak (Clipping)', m => m.truePeakDbFs, ' dBFS', (a, b) => b.audit.metrics.truePeakDbFs - a.audit.metrics.truePeakDbFs, 'clipping threshold: -0.5 dBFS');
  printWorstFive('Loudness Deviation', m => m.integratedLoudnessLUFS, ' LUFS', (a, b) => Math.abs(b.audit.metrics.integratedLoudnessLUFS - (-16.0)) - Math.abs(a.audit.metrics.integratedLoudnessLUFS - (-16.0)), 'target: -16.0 LUFS ± 1.5 LU');
}

if (qualityFailures.length > 0) {
  console.error(`\n[FATAL] ${qualityFailures.length} clip(s) failed Quality Gate!`);
  for (const { item, audit } of qualityFailures) {
    console.error(`  - ${item.fileName} (${item.speakerName}): ${audit.errors.join('; ')}`);
  }
  process.exit(1);
} else {
  console.log('\n✓ ALL AUDIO CLIPS PASSED 100% OF QUALITY GATE CRITERIA.');
}

// 9. Build Manifest
if (!adHocText) {
  console.log('\nCompiling manifest.json...');
  const manifestClips = {};
  const bySpeakerAndHash = {};
  let totalSizeBytes = 0;

  for (const item of processedItems) {
    let duration = 2.5;
    let fileSize = 0;

    if (fs.existsSync(item.filePath)) {
      const probe = execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${item.filePath}"`,
        { encoding: 'utf8' }
      );
      duration = Math.round(parseFloat(probe.trim()) * 1000) / 1000;
      fileSize = fs.statSync(item.filePath).size;
      totalSizeBytes += fileSize;
    }

    const entry = {
      file: `/assets/audio/voice/${item.fileName}`,
      fileName: item.fileName,
      speaker: item.speakerName,
      speakerId: item.speakerId,
      nodeId: item.nodeId,
      text: item.rawText,
      cleanText: item.cleanText,
      textHash: item.textHash,
      fileHash: item.fileHash,
      duration,
      sizeBytes: fileSize,
      voice: item.config.voice,
      delivery: item.config.delivery,
      prosody: {
        rate: item.config.rate,
        pitch: item.config.pitch,
      },
      isPidgin: Boolean(item.config.isPidgin),
      needsHumanRecording: Boolean(item.config.needsHumanRecording),
    };

    manifestClips[item.fileHash] = entry;
    bySpeakerAndHash[`${item.speakerId}:${item.textHash}`] = entry;
  }

  const manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    backend,
    totalClips: processedItems.length,
    totalSizeBytes,
    clips: manifestClips,
    bySpeakerAndHash,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Manifest saved with ${processedItems.length} clips (${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB).`);

  if (isCleanUnused) {
    console.log('\nScanning for orphaned audio clips...');
    const allDiskFiles = fs.readdirSync(VOICE_OUTPUT_DIR);
    const activeFiles = new Set(Object.values(manifestClips).map(c => c.fileName));
    let removed = 0;

    for (const f of allDiskFiles) {
      if (f.endsWith('.mp3') && !activeFiles.has(f)) {
        const orphanPath = path.join(VOICE_OUTPUT_DIR, f);
        if (isDryRun) {
          console.log(`[Dry Run Clean] Would remove orphaned file: ${f}`);
        } else {
          fs.unlinkSync(orphanPath);
          console.log(`[Clean] Removed orphaned file: ${f}`);
        }
        removed++;
      }
    }
    console.log(`Clean complete: ${removed} orphaned file(s) pruned.`);
  }
}
