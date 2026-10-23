#!/usr/bin/env node
/**
 * Cyberlife — Voice Sample Pack Generator (Stage A Review)
 *
 * Generates 6 representative Episode 01 voice clips in 2 distinct settings:
 *   - Variant A: Crisp Cadence & Tight Gaps (target sentence gap ~140ms, baseline prosody)
 *   - Variant B: Brisk Tempo & Natural Flow (target sentence gap ~180ms, +3% rate)
 *
 * Saves clips to docs/audio/samples/ and writes docs/audio/samples/index.html.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { normalizeTextForSpeech, CHARACTER_VOICE_CASTING, DELIVERY_PROSODY_TABLE } from '../src/content/audio/pronunciationDictionary.ts';
import { processAudioClip, auditClip } from './voice_audio_processor.mjs';

const PROJECT_ROOT = process.cwd();
const SAMPLES_DIR = path.join(PROJECT_ROOT, 'docs/audio/samples');
fs.mkdirSync(SAMPLES_DIR, { recursive: true });

const SAMPLE_SPECS = [
  {
    id: 'sample_1_blessing_calm',
    title: '1. Blessing — Calm Briefing',
    speakerId: 'npc_amina',
    speakerName: 'Blessing',
    delivery: 'calm',
    displayText: 'The ticket is ALT-2026-1012. Michael doesn’t know yet—the alert was suppressed from the morning digest. We need to know if payroll leaked.',
    speechText: "The ticket is alert twenty twenty-six, ten twelve. Michael doesn't know yet, the alert was suppressed from the morning digest. We need to know if payroll leaked.",
  },
  {
    id: 'sample_2_barry_nervous',
    title: '2. Barry — Nervous Encounter',
    speakerId: 'npc_marcus',
    speakerName: 'Barry',
    delivery: 'anxious',
    displayText: 'Protector! Please tell me you haven’t escalated the Aster ticket yet. I swear I was only servicing the cooling racks on Saturday!',
    speechText: "Protector! Please tell me you haven't escalated the Aster ticket yet. I swear I was only servicing the cooling racks on Saturday!",
  },
  {
    id: 'sample_3_michael_pressure',
    title: '3. Michael — Executive Pressure Call',
    speakerId: 'npc_femi',
    speakerName: 'Michael',
    delivery: 'urgent',
    displayText: 'Protector. Blessing tells me you’re leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?',
    speechText: "Protector. Blessing tells me you're leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?",
  },
  {
    id: 'sample_4_tsharp_casual',
    title: '4. Tsharp — Casual Night Recon',
    speakerId: 'npc_tunde',
    speakerName: 'Tsharp',
    delivery: 'neutral',
    displayText: 'Yo Protector. Off-grid telemetry caught offshore scanners hitting 8080. If you probe that port actively, Cedarline’s SOC will trip. Keep it quiet.',
    speechText: "Yo Protector. Off-grid telemetry caught offshore scanners hitting eighty eighty. If you probe that port actively, Cedarline's sock will trip. Keep it quiet.",
  },
  {
    id: 'sample_5_phone_call',
    title: '5. Phone Call Exchange — Sequential Lines',
    isPhoneExchange: true,
    speakerId: 'npc_amina',
    speakerName: 'Blessing',
    delivery: 'urgent',
    lines: [
      {
        displayText: 'Protector, good morning. Don’t waste time with breakfast. Get to Marina Tower now; svc-aster is pulling files it shouldn’t touch.',
        speechText: "Protector, good morning. Don't waste time with breakfast. Get to Marina Tower now, service aster is pulling files it shouldn't touch.",
      },
      {
        displayText: 'I’ve suppressed the automated alert from the executive dashboard for now, but Michael is already asking questions. Hurry up.',
        speechText: "I've suppressed the automated alert from the executive dashboard for now, but Michael is already asking questions. Hurry up.",
      },
    ],
  },
  {
    id: 'sample_6_long_multisentence',
    title: '6. Long Multi-Sentence Line — Technical Debrief',
    speakerId: 'npc_amina',
    speakerName: 'Blessing',
    delivery: 'calm',
    displayText: 'Let me review the SHA-256 hash. Incredible forensic work, Protector. This configuration snapshot is irrefutable: svc-aster was given corporate-admin with wildcard scopes. This wasn’t a bug; someone intentionally bypassed policy. We can contain it quietly to protect Cedarline’s commercial standing, or escalate it formally to CRCII regulators.',
    speechText: "Let me review the SHA-256 hash. Incredible forensic work, Protector. This configuration snapshot is irrefutable: service aster was given corporate-admin with wildcard scopes. This wasn't a bug, someone intentionally bypassed policy. We can contain it quietly to protect Cedarline's commercial standing, or escalate it formally to C R C I I regulators.",
  },
];

async function synthesizeWithEdgeTts(text, voice, rateStr, pitchStr, outPath) {
  const tmpJson = path.join('/tmp', `batch_${Math.random().toString(36).slice(2)}.json`);
  const payload = [{
    id: path.basename(outPath),
    file: outPath,
    text,
    voice,
    rate: rateStr,
    pitch: pitchStr,
  }];
  fs.writeFileSync(tmpJson, JSON.stringify(payload), 'utf8');
  try {
    execSync(`UV_CACHE_DIR=/tmp/uv-cache uv run --with edge-tts python3 scripts/edge_tts_batch.py "${tmpJson}"`, {
      stdio: ['pipe', 'pipe', 'inherit'],
    });
  } finally {
    try { fs.unlinkSync(tmpJson); } catch {}
  }
}

async function generateAll() {
  console.log('Generating Stage A Sample Pack...');

  const results = [];

  for (const spec of SAMPLE_SPECS) {
    const casting = CHARACTER_VOICE_CASTING[spec.speakerId];
    const delivery = DELIVERY_PROSODY_TABLE[spec.delivery || 'neutral'];

    // Variant A: target internal gap 140ms, baseline rate
    const rateAVal = casting.baseRatePercent + delivery.rateDeltaPercent;
    const rateA = rateAVal >= 0 ? `+${rateAVal}%` : `${rateAVal}%`;
    const pitchAVal = casting.basePitchHz + Math.round((delivery.pitchDeltaPercent / 100) * 10);
    const pitchA = pitchAVal >= 0 ? `+${pitchAVal}Hz` : `${pitchAVal}Hz`;

    // Variant B: target internal gap 185ms, +3% faster delivery rate
    const rateBVal = rateAVal + 3;
    const rateB = rateBVal >= 0 ? `+${rateBVal}%` : `${rateBVal}%`;
    const pitchB = pitchA;

    console.log(`\nRendering ${spec.id} (${spec.speakerName})...`);

    if (spec.isPhoneExchange) {
      // Handle phone exchange with two sequential lines joined by 200ms pause
      const rawA1 = path.join('/tmp', `${spec.id}_raw_A1.mp3`);
      const rawA2 = path.join('/tmp', `${spec.id}_raw_A2.mp3`);
      const procA1 = path.join('/tmp', `${spec.id}_proc_A1.mp3`);
      const procA2 = path.join('/tmp', `${spec.id}_proc_A2.mp3`);
      const finalA = path.join(SAMPLES_DIR, `${spec.id}_A.mp3`);

      const clean1 = normalizeTextForSpeech(spec.lines[0].displayText, { speechOverride: spec.lines[0].speechText });
      const clean2 = normalizeTextForSpeech(spec.lines[1].displayText, { speechOverride: spec.lines[1].speechText });

      await synthesizeWithEdgeTts(clean1, casting.voice, rateA, pitchA, rawA1);
      await synthesizeWithEdgeTts(clean2, casting.voice, rateA, pitchA, rawA2);
      processAudioClip(rawA1, procA1, { targetInternalSilenceMs: 140 });
      processAudioClip(rawA2, procA2, { targetInternalSilenceMs: 140 });

      // Join with 200ms inter-clip phone call gap
      execSync(`ffmpeg -y -v error -i "${procA1}" -i "${procA2}" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[out]" -map "[out]" -ac 1 -b:a 64k "${finalA}"`);

      // Variant B
      const rawB1 = path.join('/tmp', `${spec.id}_raw_B1.mp3`);
      const rawB2 = path.join('/tmp', `${spec.id}_raw_B2.mp3`);
      const procB1 = path.join('/tmp', `${spec.id}_proc_B1.mp3`);
      const procB2 = path.join('/tmp', `${spec.id}_proc_B2.mp3`);
      const finalB = path.join(SAMPLES_DIR, `${spec.id}_B.mp3`);

      await synthesizeWithEdgeTts(clean1, casting.voice, rateB, pitchB, rawB1);
      await synthesizeWithEdgeTts(clean2, casting.voice, rateB, pitchB, rawB2);
      processAudioClip(rawB1, procB1, { targetInternalSilenceMs: 185 });
      processAudioClip(rawB2, procB2, { targetInternalSilenceMs: 185 });

      execSync(`ffmpeg -y -v error -i "${procB1}" -i "${procB2}" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[out]" -map "[out]" -ac 1 -b:a 64k "${finalB}"`);

      const auditA = auditClip(finalA, `${clean1} ${clean2}`);
      const auditB = auditClip(finalB, `${clean1} ${clean2}`);

      results.push({
        spec,
        cleanText: `${clean1} ${clean2}`,
        variantA: { file: `${spec.id}_A.mp3`, rate: rateA, targetGap: 140, audit: auditA },
        variantB: { file: `${spec.id}_B.mp3`, rate: rateB, targetGap: 185, audit: auditB },
      });
    } else {
      const clean = normalizeTextForSpeech(spec.displayText, { speechOverride: spec.speechText });

      // Variant A
      const rawA = path.join('/tmp', `${spec.id}_raw_A.mp3`);
      const finalA = path.join(SAMPLES_DIR, `${spec.id}_A.mp3`);
      await synthesizeWithEdgeTts(clean, casting.voice, rateA, pitchA, rawA);
      processAudioClip(rawA, finalA, { targetInternalSilenceMs: 140 });

      // Variant B
      const rawB = path.join('/tmp', `${spec.id}_raw_B.mp3`);
      const finalB = path.join(SAMPLES_DIR, `${spec.id}_B.mp3`);
      await synthesizeWithEdgeTts(clean, casting.voice, rateB, pitchB, rawB);
      processAudioClip(rawB, finalB, { targetInternalSilenceMs: 185 });

      const auditA = auditClip(finalA, clean);
      const auditB = auditClip(finalB, clean);

      results.push({
        spec,
        cleanText: clean,
        variantA: { file: `${spec.id}_A.mp3`, rate: rateA, targetGap: 140, audit: auditA },
        variantB: { file: `${spec.id}_B.mp3`, rate: rateB, targetGap: 185, audit: auditB },
      });
    }
  }

  // Generate HTML comparison index.html
  generateHtmlIndex(results);

  console.log('\n======================================================');
  console.log('Stage A Sample Pack generation complete!');
  console.log(`Directory: ${SAMPLES_DIR}`);
  console.log(`Preview:   ${path.join(SAMPLES_DIR, 'index.html')}`);
  console.log('======================================================\n');

  return results;
}

function generateHtmlIndex(results) {
  const htmlPath = path.join(SAMPLES_DIR, 'index.html');

  const rows = results.map((r, idx) => `
    <div class="sample-card">
      <div class="sample-header">
        <span class="sample-badge">#${idx + 1}</span>
        <h3>${r.spec.title}</h3>
        <span class="sample-speaker">${r.spec.speakerName} (${CHARACTER_VOICE_CASTING[r.spec.speakerId]?.voice})</span>
      </div>

      <div class="sample-text">
        <p class="display-text"><strong>Written:</strong> "${r.spec.isPhoneExchange ? r.spec.lines.map(l => l.displayText).join(' | ') : r.spec.displayText}"</p>
        <p class="spoken-text"><strong>Spoken:</strong> "${r.cleanText}"</p>
      </div>

      <div class="variants-grid">
        <!-- Variant A -->
        <div class="variant-col variant-a">
          <div class="variant-header">
            <h4>Variant A (Crisp & Natural)</h4>
            <span class="tag">Target Gap: 140ms | Rate: ${r.variantA.rate}</span>
          </div>
          <audio controls preload="auto" src="./${r.variantA.file}"></audio>
          <div class="metrics-box">
            <div class="metric"><span class="lbl">Duration</span><span class="val">${r.variantA.audit.metrics.totalDurationSec}s</span></div>
            <div class="metric"><span class="lbl">Lead / Trail</span><span class="val">${r.variantA.audit.metrics.leadingSilenceMs}ms / ${r.variantA.audit.metrics.trailingSilenceMs}ms</span></div>
            <div class="metric"><span class="lbl">Internal Gaps</span><span class="val">${r.variantA.audit.metrics.internalGapsMs.join(', ') || 'none'} ms</span></div>
            <div class="metric"><span class="lbl">Loudness</span><span class="val">${r.variantA.audit.metrics.integratedLoudnessLUFS} LUFS</span></div>
            <div class="metric"><span class="lbl">True Peak</span><span class="val">${r.variantA.audit.metrics.truePeakDbFs} dBFS</span></div>
            <div class="metric"><span class="lbl">Speed</span><span class="val">${r.variantA.audit.metrics.charsPerSec} cps</span></div>
          </div>
        </div>

        <!-- Variant B -->
        <div class="variant-col variant-b">
          <div class="variant-header">
            <h4>Variant B (Brisk & Flowing)</h4>
            <span class="tag">Target Gap: 185ms | Rate: ${r.variantB.rate}</span>
          </div>
          <audio controls preload="auto" src="./${r.variantB.file}"></audio>
          <div class="metrics-box">
            <div class="metric"><span class="lbl">Duration</span><span class="val">${r.variantB.audit.metrics.totalDurationSec}s</span></div>
            <div class="metric"><span class="lbl">Lead / Trail</span><span class="val">${r.variantB.audit.metrics.leadingSilenceMs}ms / ${r.variantB.audit.metrics.trailingSilenceMs}ms</span></div>
            <div class="metric"><span class="lbl">Internal Gaps</span><span class="val">${r.variantB.audit.metrics.internalGapsMs.join(', ') || 'none'} ms</span></div>
            <div class="metric"><span class="lbl">Loudness</span><span class="val">${r.variantB.audit.metrics.integratedLoudnessLUFS} LUFS</span></div>
            <div class="metric"><span class="lbl">True Peak</span><span class="val">${r.variantB.audit.metrics.truePeakDbFs} dBFS</span></div>
            <div class="metric"><span class="lbl">Speed</span><span class="val">${r.variantB.audit.metrics.charsPerSec} cps</span></div>
          </div>
        </div>
      </div>
    </div>
  `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberlife — Voice Prosody & Sentence Gap Review (Stage A)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111726;
      --border: #1e293b;
      --accent: #00e5ff;
      --accent-b: #10b981;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --mono: 'JetBrains Mono', monospace;
      --sans: 'Outfit', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      padding: 2.5rem 1.5rem;
      line-height: 1.5;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    h1 span {
      color: var(--accent);
      font-family: var(--mono);
      font-size: 1.25rem;
      background: rgba(0, 229, 255, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      border: 1px solid rgba(0, 229, 255, 0.3);
    }
    p.subtitle {
      color: var(--text-muted);
      margin-top: 0.5rem;
      font-size: 1.05rem;
    }
    .sample-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .sample-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .sample-badge {
      font-family: var(--mono);
      background: rgba(255, 255, 255, 0.08);
      color: var(--accent);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .sample-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      flex-grow: 1;
    }
    .sample-speaker {
      font-family: var(--mono);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .sample-text {
      background: rgba(0, 0, 0, 0.3);
      border-left: 3px solid var(--accent);
      padding: 0.75rem 1rem;
      border-radius: 0 4px 4px 0;
      margin-bottom: 1.25rem;
      font-size: 0.95rem;
    }
    .sample-text p { margin-bottom: 0.35rem; }
    .sample-text p:last-child { margin-bottom: 0; }
    .spoken-text { color: #38bdf8; }
    .variants-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .variant-col {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 6px;
      padding: 1rem;
    }
    .variant-a { border-top: 3px solid var(--accent); }
    .variant-b { border-top: 3px solid var(--accent-b); }
    .variant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .variant-header h4 {
      font-size: 1rem;
      font-weight: 600;
    }
    .tag {
      font-family: var(--mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.15rem 0.5rem;
      border-radius: 3px;
    }
    audio {
      width: 100%;
      height: 38px;
      margin-bottom: 0.75rem;
      border-radius: 4px;
    }
    .metrics-box {
      font-family: var(--mono);
      font-size: 0.8rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem 0.8rem;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.6rem 0.8rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .metric {
      display: flex;
      justify-content: space-between;
    }
    .metric .lbl { color: var(--text-muted); }
    .metric .val { color: #f8fafc; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Cyberlife <span>Audio Pipeline Stage A</span></h1>
      <p class="subtitle">Side-by-side listening review for Nigerian English natural voice audio. Choose <strong>Variant A</strong> (Crisp Cadence, 140ms gaps) or <strong>Variant B</strong> (Brisk Flow, 185ms gaps, +3% rate).</p>
    </header>

    ${rows}
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf8');
}

generateAll().catch(err => {
  console.error('[Error] Generating sample pack:', err);
  process.exit(1);
});
