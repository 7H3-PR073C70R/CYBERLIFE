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

---

## 3. How to Update or Add Dialogue Lines

### A. Editing Existing Text
1. Open [src/content/dialogue/npcDialogueData.ts](file:///Users/protector/Documents/projects/cyberlife/src/content/dialogue/npcDialogueData.ts) or [src/simulation/cyber/chat/chatData.ts](file:///Users/protector/Documents/projects/cyberlife/src/simulation/cyber/chat/chatData.ts).
2. Edit the dialogue `text`.
3. Run:
   ```bash
   npm run voice:dry-run
   ```
   You will see that the edited line is identified as "Lines to generate: 1" because the new text produces a new SHA-256 hash.
4. Run:
   ```bash
   npm run voice:generate
   ```
   This generates the new `.mp3` clip and updates `manifest.json`.
5. *(Optional)* Run `npm run voice:clean` to remove the old, unreferenced `.mp3` file.

### B. Adding a New Character or Changing a Name
1. Character profiles are defined in [src/simulation/actors/npcProfiles.ts](file:///Users/protector/Documents/projects/cyberlife/src/simulation/actors/npcProfiles.ts).
2. Chat contacts are defined in [src/simulation/cyber/chat/chatData.ts](file:///Users/protector/Documents/projects/cyberlife/src/simulation/cyber/chat/chatData.ts).
3. The generator dynamically loads these modules:
   - **Speaker Name**: Pulled directly from `profile.name` or `thread.contactName`.
   - **Gender**: Pulled from `profile.voice.gender` (female maps to `en-NG-EzinneNeural`, male maps to `en-NG-AbeoNeural`).
   - **Rate & Pitch**: Computed from `profile.voice.rate` and `profile.voice.pitch` (e.g. rate `1.04` maps to `+4%`).
4. If you rename a character (e.g., from `"Barry"` to `"Barry Adeleke"`), simply rerun `npm run voice:generate`. The manifest metadata will update automatically without needing to re-synthesize audio if the voice parameters and text remain identical.

---

## 4. Standalone Python Tool (`scripts/edge_tts_batch.py`)

The repository includes a dedicated, zero-config Python tool at [scripts/edge_tts_batch.py](file:///Users/protector/Documents/projects/cyberlife/scripts/edge_tts_batch.py).

### Running via `uv` (Recommended - No Global Installs Needed)
If you have `uv` installed:
```bash
# List available Nigerian voices
uv run --with edge-tts python3 scripts/edge_tts_batch.py --list-voices --lang en-NG

# Synthesize a single custom line
uv run --with edge-tts python3 scripts/edge_tts_batch.py \
  --text "Analyst, we have incoming traffic on port 443." \
  --voice en-NG-EzinneNeural \
  --rate "+2%" \
  --out /tmp/sample.mp3
```

### Running via standard `python3`
Ensure `edge-tts` is installed:
```bash
pip install edge-tts
python3 scripts/edge_tts_batch.py --help
```

---

## 5. Production Voice Generation (Azure Cognitive Services)

For official production builds and distribution:
1. Create a `.env.local` file in the project root:
   ```bash
   AZURE_SPEECH_KEY=your_azure_cognitive_services_key
   AZURE_SPEECH_REGION=your_azure_region # e.g. eastus
   ```
2. Run:
   ```bash
   npm run voice:azure
   ```
3. The generator calls the Azure Cognitive Services Speech REST API directly via HTTPS `fetch` with SSML payloads.

---

## 6. Runtime Fallback & Nigerian Pidgin Handling

- **Missing Audio Fallback**: If an audio file is ever missing from `manifest.json`, [src/presentation/audio/VoicePlayer.ts](file:///Users/protector/Documents/projects/cyberlife/src/presentation/audio/VoicePlayer.ts) automatically falls back to browser `SpeechSynthesis` (`VoiceDialogueService`) so dialogue never breaks or halts.
- **Nigerian Pidgin Lines**: Dialogue lines containing Nigerian Pidgin (e.g., Mama Esther's stall dialogues) are marked with `"needsHumanRecording": true` in `manifest.json`. When live voice actors record human takes, replace the corresponding `.mp3` files in `public/assets/audio/voice/` or update the file pointers in `manifest.json`.
