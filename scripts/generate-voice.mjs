#!/usr/bin/env node
/**
 * Cyberlife — Dynamic Pre-rendered Dialogue Voice Generator
 *
 * Scans all spoken dialogue lines from npcDialogueData.ts and chatData.ts,
 * dynamically loads NPC profiles from npcProfiles.ts and chat threads from chatData.ts,
 * normalises text, applies character-appropriate Nigerian/specialized prosody,
 * computes deterministic SHA-256 hashes, and renders .mp3 audio clips via:
 *   1. Azure Cognitive Services Speech REST API (--backend azure)
 *   2. Microsoft Edge TTS Python wrapper (--backend edge, for dev/testing)
 *
 * Outputs to public/assets/audio/voice/ and writes manifest.json.
 *
 * Features:
 * - Dynamic character profile syncing: names, roles, pitch, rate, and gender
 *   are automatically loaded from npcProfiles.ts and chatData.ts.
 * - Incremental caching: SHA-256 hashes mean existing audio files are never re-rendered.
 * - Nigerian Pidgin guard: lines in Nigerian Pidgin are flagged 'needsHumanRecording'.
 * - Clean unused mode: `--clean-unused` removes orphaned .mp3 files when lines are deleted.
 * - Filter mode: `--filter=<speakerId>` generates for a single character only.
 * - Ad-hoc mode: `--text="<phrase>" --speaker="<id>"` synthesizes a single custom line.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import ts from 'typescript';

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

// Optional filter by speaker ID
let speakerFilter = null;
const filterArg = args.find(a => a.startsWith('--filter=') || a.startsWith('--speaker='));
if (filterArg) {
  speakerFilter = filterArg.split('=')[1].trim();
}

// Optional ad-hoc text generation
let adHocText = null;
const textArg = args.find(a => a.startsWith('--text='));
if (textArg) {
  adHocText = textArg.split('=').slice(1).join('=').replace(/^['"]|['"]$/g, '').trim();
}

// 2. Load .env.local if present (Never print secrets!)
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
  console.error('[Error] Azure backend requested but AZURE_SPEECH_KEY or AZURE_SPEECH_REGION not found in .env.local or environment.');
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

// 3. Text Normalization Rules (aligned with VoiceDialogueService)
function cleanTextForSpeech(rawText, isPidgin = false) {
  if (!rawText) return '';
  const trimmed = rawText.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return '';
  }

  let text = rawText
    // Remove sound effects inside asterisks (*electronic audio static*, etc.)
    .replace(/\*[^*]+\*/g, '')
    // Remove square bracket directions ([E], [Info], [Call encrypted line...])
    .replace(/\[[^\]]+\]/g, '');

  // For Nigerian Pidgin, do NOT respell words for English phonetics
  if (!isPidgin) {
    text = text
      .replace(/\bCVE-(\d{4})-(\d+)\b/gi, 'C V E $1, $2')
      .replace(/\bCVE\b/g, 'C V E')
      .replace(/\bSOC\b/g, 'sock')
      .replace(/\bIoC\b/gi, 'I o C')
      .replace(/\bIoCs\b/gi, "I o C's")
      .replace(/\bZRTP\b/gi, 'Z R T P')
      .replace(/\bAES\b/gi, 'A E S')
      .replace(/\bSMB\b/gi, 'S M B')
      .replace(/\bIP\b/g, 'I P')
      .replace(/\bIAM\b/gi, 'I A M')
      .replace(/\bRCE\b/gi, 'R C E')
      .replace(/\bSIEM\b/gi, 'seem')
      .replace(/\bASAP\b/gi, 'as soon as possible')
      .replace(/\bfilesrv-01\b/gi, 'file server 0 1')
      .replace(/\bapp-portal-01\b/gi, 'app portal 0 1')
      .replace(/\bsvc-aster\b/gi, 'service aster');
  }

  return text.replace(/\s+/g, ' ').trim();
}

// 4. In-Memory TypeScript Module Transpiler & Loader
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

// 5. Load Real Character Data from Simulation Models
console.log('Synchronizing character profiles and chat contacts...');
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

// Tuned character voice & prosody presets (within 0.9 - 1.1x / -7Hz to +4Hz)
const DEFAULT_CHARACTER_VOICE_PROSODY = {
  npc_amina: {
    voice: 'en-NG-EzinneNeural',
    rate: '+0%',
    pitch: '+2Hz',
    isPidgin: false,
  },
  'amina-okonjo': {
    voice: 'en-NG-EzinneNeural',
    rate: '+0%',
    pitch: '+2Hz',
    isPidgin: false,
  },
  npc_marcus: {
    voice: 'en-NG-AbeoNeural',
    rate: '+4%',
    pitch: '+3Hz',
    isPidgin: false,
  },
  npc_elena: {
    voice: 'en-US-JennyNeural',
    rate: '-2%',
    pitch: '-1Hz',
    isPidgin: false,
  },
  npc_femi: {
    voice: 'en-NG-AbeoNeural',
    rate: '+2%',
    pitch: '-3Hz',
    isPidgin: false,
  },
  npc_nkechi: {
    voice: 'en-NG-EzinneNeural',
    rate: '+3%',
    pitch: '+4Hz',
    isPidgin: true,
    needsHumanRecording: true,
  },
  npc_segun: {
    voice: 'en-NG-AbeoNeural',
    rate: '-7%',
    pitch: '-5Hz',
    isPidgin: false,
  },
  npc_folake: {
    voice: 'en-NG-EzinneNeural',
    rate: '+0%',
    pitch: '-1Hz',
    isPidgin: false,
  },
  npc_tunde: {
    voice: 'en-NG-AbeoNeural',
    rate: '+5%',
    pitch: '+1Hz',
    isPidgin: false,
  },
  cipher: {
    voice: 'en-NG-AbeoNeural',
    rate: '-6%',
    pitch: '-7Hz',
    isPidgin: false,
  },
  'aster-watchdog': {
    voice: 'en-US-ChristopherNeural',
    rate: '+5%',
    pitch: '-4Hz',
    isPidgin: false,
  },
};

/**
 * Resolves character voice settings dynamically.
 * If names change in npcProfiles.ts or chatData.ts, or new characters are added,
 * this automatically detects their profile, gender, pitch, and rate.
 */
function resolveVoiceConfig(speakerId) {
  const profile = npcProfilesMap.get(speakerId);
  const thread = chatThreadsMap.get(speakerId);
  const preset = DEFAULT_CHARACTER_VOICE_PROSODY[speakerId] || {};

  // Resolve Speaker Display Name dynamically from real simulation models
  const speakerName =
    profile?.name ||
    thread?.contactName ||
    (speakerId === 'cipher' ? 'Cipher' : speakerId);

  // Resolve Gender dynamically
  const gender =
    preset.gender ||
    profile?.voice?.gender ||
    thread?.voice?.gender ||
    (speakerId === 'npc_amina' || speakerId === 'amina-okonjo' || speakerId === 'npc_folake' || speakerId === 'npc_nkechi' || speakerId === 'npc_elena' ? 'female' : 'male');

  // Resolve Voice Identifier (defaulting to Nigerian voices unless specialized)
  let voice = preset.voice;
  if (!voice) {
    if (profile?.voice?.voiceHints?.some(h => h.includes('us') || h.includes('jenny'))) {
      voice = 'en-US-JennyNeural';
    } else if (profile?.voice?.voiceHints?.some(h => h.includes('christopher') || h.includes('synthetic'))) {
      voice = 'en-US-ChristopherNeural';
    } else {
      voice = gender === 'female' ? 'en-NG-EzinneNeural' : 'en-NG-AbeoNeural';
    }
  }

  // Resolve Prosody Rate
  let rate = preset.rate;
  if (!rate) {
    const rawRate = profile?.voice?.rate ?? thread?.voice?.rate ?? 1.0;
    const diff = Math.round((rawRate - 1.0) * 100);
    rate = diff >= 0 ? `+${diff}%` : `${diff}%`;
  }

  // Resolve Prosody Pitch
  let pitch = preset.pitch;
  if (!pitch) {
    const rawPitch = profile?.voice?.pitch ?? thread?.voice?.pitch ?? 1.0;
    const diff = Math.round((rawPitch - 1.0) * 100);
    pitch = diff >= 0 ? `+${diff}Hz` : `${diff}Hz`;
  }

  // Detect Pidgin lines
  const isPidgin = Boolean(
    preset.isPidgin ||
    speakerId === 'npc_nkechi' ||
    profile?.voiceTone?.toLowerCase().includes('pidgin')
  );

  const needsHumanRecording = Boolean(
    preset.needsHumanRecording ||
    isPidgin
  );

  return {
    speaker: speakerName,
    voice,
    rate,
    pitch,
    isPidgin,
    needsHumanRecording,
  };
}

// 6. Audio Duration Helper (Uses ffprobe / afinfo)
function probeAudioDuration(filePath) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const dur = parseFloat(out.trim());
    if (!isNaN(dur) && dur > 0) return Math.round(dur * 1000) / 1000;
  } catch {}

  try {
    const out = execSync(`afinfo "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = out.match(/estimated duration:\s*([\d.]+)\s*sec/i);
    if (match && match[1]) {
      return Math.round(parseFloat(match[1]) * 1000) / 1000;
    }
  } catch {}

  try {
    const stats = fs.statSync(filePath);
    return Math.round((stats.size / 6000) * 10) / 10;
  } catch {
    return 2.5;
  }
}

// 7. Extract Spoken Dialogue Items
console.log('Collecting spoken dialogue items...');
const npcDialogueModule = loadTsModule('src/content/dialogue/npcDialogueData.ts');

const dialogueItems = [];

// Ad-hoc single text mode
if (adHocText) {
  const speakerId = speakerFilter || 'npc_amina';
  const config = resolveVoiceConfig(speakerId);
  const cleanText = cleanTextForSpeech(adHocText, config.isPidgin);
  dialogueItems.push({
    id: `${speakerId}:adhoc`,
    nodeId: 'adhoc',
    speakerId,
    speakerName: config.speaker,
    rawText: adHocText,
    cleanText,
    config,
  });
} else {
  // From NPC Dialogue graphs
  if (npcDialogueModule.ALL_DIALOGUE_GRAPHS) {
    for (const graph of npcDialogueModule.ALL_DIALOGUE_GRAPHS) {
      for (const [nodeId, node] of Object.entries(graph.nodes)) {
        if (node.text && typeof node.text === 'string') {
          const speakerId = node.speakerId || graph.npcId;
          if (speakerFilter && speakerId !== speakerFilter) continue;

          const config = resolveVoiceConfig(speakerId);
          const cleanText = cleanTextForSpeech(node.text, config.isPidgin);

          if (cleanText.length > 0) {
            dialogueItems.push({
              id: `${speakerId}:${nodeId}`,
              nodeId,
              speakerId,
              speakerName: config.speaker,
              rawText: node.text,
              cleanText,
              config,
            });
          }
        }
      }
    }
  }

  // From Phone Call Dialogue
  if (chatDataModule.INITIAL_CHAT_THREADS) {
    for (const thread of chatDataModule.INITIAL_CHAT_THREADS) {
      if (thread.callDialogue && Array.isArray(thread.callDialogue)) {
        const speakerId = thread.contactId;
        if (speakerFilter && speakerId !== speakerFilter) continue;

        const config = resolveVoiceConfig(speakerId);

        thread.callDialogue.forEach((cd, idx) => {
          const cleanText = cleanTextForSpeech(cd.text, config.isPidgin);
          if (cleanText.length > 0) {
            dialogueItems.push({
              id: `${speakerId}:call_${idx}`,
              nodeId: `call_${idx}`,
              speakerId,
              speakerName: config.speaker,
              rawText: cd.text,
              cleanText,
              config,
            });
          }
        });
      }
    }
  }
}

console.log(`Discovered ${dialogueItems.length} spoken dialogue lines.`);

if (!fs.existsSync(VOICE_OUTPUT_DIR)) {
  fs.mkdirSync(VOICE_OUTPUT_DIR, { recursive: true });
}

// 8. Compute Hashes and Check Existence
let totalCharsToSend = 0;
const processedItems = [];
const pidginLines = [];

for (const item of dialogueItems) {
  const { voice, rate, pitch, isPidgin, needsHumanRecording } = item.config;
  const hashPayload = `${voice}|${rate}|${pitch}|${item.cleanText}`;
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
console.log(`  Pidgin lines identified: ${pidginLines.length} (marked 'needs human recording')\n`);

// Free tier guard
if (totalCharsToSend > 100000 && !isYes) {
  console.error(`[Guard] Total characters to send (${totalCharsToSend}) exceeds 100,000 threshold.`);
  console.error('Run with --yes if you deliberately wish to proceed.');
  process.exit(1);
}

if (isDryRun && !isCleanUnused) {
  console.log('[Dry Run] Exiting without generating audio.');
  process.exit(0);
}

// 9. Audio Generation Backends
async function generateAzure(item) {
  const { voice, rate, pitch } = item.config;
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voice}">
    <prosody rate="${rate}" pitch="${pitch}">
      ${item.cleanText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </prosody>
  </voice>
</speak>`;

  const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': azureKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'CyberlifeVoiceGenerator',
    },
    body: ssml,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure TTS returned ${response.status}: ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(item.filePath, Buffer.from(arrayBuffer));
}

function generateEdgeBatch(itemsToGenerate) {
  const batchPayload = itemsToGenerate.map(i => ({
    id: i.id,
    file: i.filePath,
    voice: i.config.voice,
    rate: i.config.rate,
    pitch: i.config.pitch,
    text: i.cleanText,
  }));

  const tmpBatchFile = path.join(PROJECT_ROOT, '.tmp_voice_batch.json');
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

// 10. Run Generation Loop
if (toGenerateCount > 0 && !isDryRun) {
  console.log(`Generating ${toGenerateCount} clips via backend '${backend}'...`);

  const ungenerated = processedItems.filter(i => !i.exists);

  if (backend === 'edge') {
    generateEdgeBatch(ungenerated);
  } else {
    let doneCount = 0;
    for (const item of ungenerated) {
      if (item.cleanText.length > 3000) {
        console.warn(`[Warning] Line exceeds 3000 chars: ${item.id}`);
      }
      try {
        await generateAzure(item);
        doneCount++;
        process.stdout.write(`\rProgress: ${doneCount} / ${toGenerateCount} [${item.speakerName}: ${item.fileName}]`);
      } catch (err) {
        console.error(`\n[Failed] Generating ${item.id}:`, err.message || err);
      }
    }
  }
  console.log('\nGeneration complete!');
} else if (!isDryRun) {
  console.log('All audio clips already exist on disk. Skipping generation.');
}

// 11. Compile & Write Manifest
if (!adHocText) {
  console.log('Building public/assets/audio/voice/manifest.json...');
  const manifestClips = {};
  const bySpeakerAndHash = {};

  let totalSizeBytes = 0;

  for (const item of processedItems) {
    let duration = 2.5;
    let fileSize = 0;

    if (fs.existsSync(item.filePath)) {
      duration = probeAudioDuration(item.filePath);
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
    version: '1.0',
    generatedAt: new Date().toISOString(),
    backend,
    totalClips: processedItems.length,
    totalSizeBytes,
    clips: manifestClips,
    bySpeakerAndHash,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Manifest saved to ${MANIFEST_PATH} with ${processedItems.length} clips (${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB).`);

  // 12. Clean Unused Audio Files if requested
  if (isCleanUnused) {
    console.log('\nScanning for orphaned audio clips not referenced in active dialogue...');
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
    console.log(isDryRun ? `[Dry Run] ${removed} orphaned file(s) identified.` : `Clean complete: ${removed} orphaned file(s) pruned.`);
  }
}
