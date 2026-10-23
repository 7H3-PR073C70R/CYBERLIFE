# Cyberlife Voice Dialogue & Audio Synthesis Guide

This guide explains how spoken dialogue audio is generated, structured, cached, and played within the **Cyberlife** presentation layer.

---

## 1. Architecture Overview

```
                                  [Dialogue Content]
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
  src/content/dialogue/npcDialogueData.ts   src/simulation/cyber/chat/chatData.ts
  src/simulation/actors/npcProfiles.ts      src/simulation/cyber/chat/chatData.ts
                     │                                       │
                     └───────────────────┬───────────────────┘
                                         ▼
                             scripts/generate-voice.mjs
                          (Text normalizer & SHA-256)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
          [Azure Speech REST]                        [scripts/edge_tts_batch.py]
      (--backend azure, production)                   (--backend edge, dev/test)
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                           public/assets/audio/voice/
                               ├── *.mp3 (SHA-256 clips)
                               └── manifest.json
                                         │
                                         ▼
                            src/presentation/audio/VoicePlayer.ts
                                         │
             ┌───────────────────────────┼───────────────────────────┐
             ▼                           ▼                           ▼
    [Voice Audio Bus]          [PhoneFilterChain]           [AnalyserNode]
   (AudioManager ducking)   (Bandpass + Saturation)    (Oscilloscope PCM Waveform)
```

---

## 2. Quick Command Reference

| Command | Description |
|---|---|
| `npm run voice:dry-run` | Inspect all dialogue lines, check what is cached on disk vs new, and review character counts without generating files. |
| `npm run voice:generate` | Incrementally generates any new or modified dialogue lines using Microsoft Edge online neural TTS (Python `edge_tts_batch.py`). |
| `npm run voice:force` | Forces re-generation of all audio clips even if cached on disk. |
| `npm run voice:clean` | Scans `public/assets/audio/voice/` and removes obsolete `.mp3` files not referenced by active dialogue. |
| `npm run voice:azure` | Generates clips using official Azure Cognitive Services Speech REST API (requires credentials in `.env.local`). |
| `npm run voice:samples` | Generates side-by-side Stage A prosody review sample pack (Variant A vs B) to `docs/audio/samples/`. |

---

## 3. How to Update or Add Dialogue Lines

### A. Adding or Editing a Dialogue Line
1. Open [src/content/dialogue/npcDialogueData.ts](file:///Users/protector/Documents/projects/cyberlife/src/content/dialogue/npcDialogueData.ts) or [src/simulation/cyber/chat/chatData.ts](file:///Users/protector/Documents/projects/cyberlife/src/simulation/cyber/chat/chatData.ts).
2. Set `text` for the written subtitle / typewriter display.
3. *(Optional)* Set `speech` if the spoken version needs to differ from written text (e.g. rephrasing technical IDs or providing natural cadence):
   ```ts
   {
     text: "Check ALT-2026-1012 and MITRE T1021.002 on filesrv-01.",
     speech: "Check alert twenty twenty-six, ten twelve and SMB shares on file server 01.",
     delivery: "urgent"
   }
   ```
4. *(Optional)* Set `delivery` tag to adjust character prosody:
   - `neutral`: Baseline pacing
   - `calm`: Slightly slower (-2%), lower pitch (-1%)
   - `anxious`: Fast (+5%), higher pitch (+2.5%)
   - `urgent`: Rapid (+7%), higher pitch (+3%)
   - `tired`: Slower (-4%), lower pitch (-2%)
   - `tense`: Brisk (+4%), tight pitch (+1%)
5. *(Optional)* Insert `[beat]` for an author-intended dramatic pause (300-450 ms).

### B. Pronunciation Dictionary
All acronyms, technical IDs, and Nigerian proper nouns are managed centrally in [src/content/audio/pronunciationDictionary.ts](file:///Users/protector/Documents/projects/cyberlife/src/content/audio/pronunciationDictionary.ts).
- Expands acronyms (e.g. `SMB` -> `S M B`, `SIEM` -> `seem`, `Sysmon` -> `sis-mon`, `PCAP` -> `pee-cap`).
- Normalizes Nigerian names and locations (e.g. `Tsharp` -> `Tee-sharp`, `Eko` -> `Eh-ko`, `Lagos` -> `Lay-gos`).
- Automatically eliminates long ellipses (`...`), em-dashes (`—`), and semicolons (` ; `) to prevent robotic pauses.
- Preserves contractions (`don't`, `I'm`, `haven't`) for natural human delivery.
- Protects Nigerian Pidgin phrases from corrupted English phonetic respelling.

### C. Character Casting & Voice Prosody
Character presets are defined in `CHARACTER_VOICE_CASTING` in `pronunciationDictionary.ts` and automatically receive the **Variant B project default rate boost (+3%)** for brisk, conversational flow:
- **Blessing** (`npc_amina`): `en-NG-EzinneNeural`, base rate: -2% (effective +1%), pitch: -6Hz (confident, steady, slightly lower)
- **Barry** (`npc_marcus`): `en-NG-AbeoNeural`, base rate: +5% (effective +8%), pitch: +7Hz (younger, faster, nervous)
- **Michael** (`npc_femi`): `en-NG-AbeoNeural`, base rate: -5% (effective -2%), pitch: -10Hz (slower, deeper, controlled)
- **Tsharp** (`npc_tunde`): `en-NG-AbeoNeural`, base rate: +3% (effective +6%), pitch: -2Hz (relaxed, quicker, casual)
- **Mama Esther** (`npc_nkechi`): `en-NG-EzinneNeural`, base rate: -4% (effective -1%), pitch: +2Hz (older, warm matriarch)
- **Choker**: `en-NG-AbeoNeural`, base rate: -6% (effective -3%), pitch: -12Hz (low, deliberate)
- **Mercy** (`npc_elena`): `en-NG-EzinneNeural`, base rate: 0% (effective +3%), pitch: +3Hz
- **Goodness** (`npc_folake`): `en-NG-EzinneNeural`, base rate: +2% (effective +5%), pitch: +4Hz
- **Uncle Segun** (`npc_segun`): `en-NG-AbeoNeural`, base rate: -8% (effective -5%), pitch: -8Hz
- **Aster SIEM Bot**: `en-US-ChristopherNeural`, rate: 0%, pitch: 0Hz (synthetic/flat, unboosted)

### D. Audio Post-Processing & Quality Gate (Variant B Defaults)
All episodes inherit the project defaults codified in `VOICE_PROJECT_DEFAULTS`:
- **Target internal sentence gap**: **185 ms** (shortens pauses > 220 ms down to 185 ms with 10 ms crossfade; natural pauses ~85 ms at commas and ~185 ms at sentences)
- **Author `[beat]` duration**: **300-450 ms** (exact author-intended pause)
- **Leading silence**: Trimmed to **20-30 ms** (max allowable: 60 ms)
- **Trailing silence**: Trimmed to **30-40 ms** (max allowable: 60 ms)
- **Sequential call spacing**: **200 ms** between consecutive call speakers (150-300 ms range)
- **Skip fadeout**: **70 ms** smooth gain rampdown when skipping or interrupting lines
- **Loudness**: Normalized to **-16.0 LUFS** (±1.5 LU tolerance) with true-peak limited to **-1.5 dBFS**
- **Automated Quality Gate**: Checks every clip; fails if internal silence > 260 ms outside author beats, leading/trailing > 80 ms, loudness outside [-17.5, -14.5] LUFS, clipping > -0.5 dBFS, or speaking rate outside 10.0-20.0 chars/sec. Prints top 5 worst offenders per check.

---

## 4. Regeneration Workflow
```bash
# 1. Preview changes without generating
npm run voice:dry-run

# 2. Generate side-by-side A/B sample pack for listen review
npm run voice:samples

# 3. Generate all new or modified dialogue clips
npm run voice:generate

# 4. Clean obsolete audio files
npm run voice:clean
```
