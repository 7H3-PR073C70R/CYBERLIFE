# Cyberlife — Episode & Beat Authoring Guide

This document defines how narrative designers and engineers author deterministic story episodes for Cyberlife Season 1.

---

## 1. Episode Schema (`EpisodeDefinition`)

Episodes are defined strictly as pure data structures (not code) in `src/simulation/narrative/episodeData.ts` and validated by `validateEpisodeDefinition` in `src/simulation/narrative/narrativeValidator.ts`.

```typescript
export interface EpisodeDefinition {
  readonly id: string;               // e.g. 'ep01_triage_init'
  readonly season: number;           // 1
  readonly episodeNumber: number;    // 1..10
  readonly title: string;            // File-style title: 'ep01_triage_init.pcap'
  readonly subtitle?: string;        // 'The Aster Anomaly & The Midnight Query'
  readonly episodeHash: string;      // 64-character hexadecimal SHA-256 hash
  readonly logLine: string;          // Episode premise summary
  readonly beats: readonly EpisodeBeat[];
}
```

### Invariants & Rules
1. **File-Style Titles**: Titles must follow authentic forensic file formats (`.pcap`, `.vmem`, `.bin`, `.evtx`, `.tar.gz`, `.sqlite`, `.dd`).
2. **SHA-256 Hash**: Must be a valid 64-character lowercase hexadecimal hash.
3. **Save-Safe Invariant**: All episode definitions must be pure immutable data. Game state only saves references (`activeEpisodeId`, `activeBeatId`, `completedBeatIds`).

---

## 2. Beat Types & Triggers

Episodes progress through an ordered list of beats:

| Beat Type | Description | Trigger Example |
| :--- | :--- | :--- |
| `titleCard` | Cinematic terminal bootloader with kernel banner and hash | `coldOpen: true` (at episode start) |
| `incidentTicket` | Dispatches internal SecOps dispatch ticket to `IncidentApp` | `onBeatComplete: 'ep01_beat_01_title'` |
| `onionMessage` | Encrypted peer-to-peer ping delivered to `OnionChatApp` | `onBeatComplete: 'ep01_beat_02_ticket'` |
| `hackerCall` | High-urgency VoIP incoming ring with interactive dialogue | `onBeatComplete: 'ep01_beat_03_onion'` |
| `journalUnlock` | Decrypts an entry in `~/.vault/journal.enc` | `onBeatComplete: 'ep01_beat_04_call'` |
| `fileDrop` | Injects evidence file into virtual filesystem with desktop toast | `onBeatComplete: 'ep01_beat_05_daycase'` |
| `blackout` | Loss of municipal power (LEDCo trip), clock jump, brownout flicker | `onBeatComplete: 'ep01_beat_05_daycase'` |
| `investigationObjective`| Hooks into M6 investigative case objectives | `onWorldFlag: { flag: 'aster_triage_begun', value: true }` |
| `mentorHint` | Contextual hint delivered diegetically via Onion Chat | `onGuidanceMode: 'Immersive'` |
| `choiceDialogue` | Non-blocking narrative branching point | `onEvidenceFound: 'EVD-2026-001'` |

---

## 3. Diegetic Message Delivery

### A. SecOps Incident Tickets (`IncidentApp`)
Delivered to the internal operations console. Displayed in the **Dispatch & Tickets** tab:
```typescript
{
  type: 'incidentTicket',
  ticket: {
    ticketId: 'TKT-2026-1012',
    title: 'URGENT: Aster Staging Anomalous SMB Reads',
    severity: 'CRITICAL',
    category: 'INCIDENT_TRIAGE',
    requester: 'Blessing Okafor (Lead SecOps Analyst)',
    summary: 'Autonomous service svc-aster generated 4,120 SMB read requests against filesrv-01.',
  }
}
```

### B. Onion Chat Encrypted Pings (`OnionChatApp`)
Delivered over decentralized darknet channels to existing or new contacts:
```typescript
{
  type: 'onionMessage',
  message: {
    contactId: 'tsharp',
    contactName: 'Taribo "tsharp" (0xLagos Peer)',
    text: 'Check the pcap in /tmp/traffic. You will notice the source MAC is spoofed.',
  }
}
```

### C. Urgent VoIP Hacker Calls (`HackerCallOverlay`)
Forces an immediate audio ring and caller modal requiring player response:
```typescript
{
  type: 'hackerCall',
  call: {
    callerId: 'blessing-okafor',
    callerName: 'Blessing Okafor (Cedarline SOC)',
    callerHandle: 'b_okafor_soc',
    organization: 'Cedarline Health',
    urgency: 'CRITICAL',
    dialogueTreeId: 'ep01_call_blessing_triage',
  }
}
```

---

## 4. Encrypted Journal & Claims (`JournalApp`)

Located at `~/.vault/journal.enc` in the player's home directory.

1. **Decrypted Entry**:
   - `id`: Unique identifier (e.g. `ep01_journal_01`).
   - `title`: Reflective entry title.
   - `timestampString`: Diegetic timestamp.
   - `text`: Internal monologue addressed to the player ("you") in a gender-neutral voice ("Protector").
2. **Forensic Claims**:
   - `claimId`: e.g. `ep01_claim_01`.
   - `statement`: Direct factual assertion.
   - `truthfulness`: `'TRUE'` | `'CONTRADICTED'` | `'FALSE'` | `'UNKNOWN'`.
   - `evidenceRef`: Optional file reference (e.g. `EVD-2026-001.pcap`).

---

## 5. The Blackout Beat ("Up NEPA!")

Simulates a sudden municipal grid failure across Lagos Island:
1. **Brownout Phase**: Screen opacity flickers with voltage warning.
2. **Web Audio Synthesis**: 1 kHz square-wave inverter warning beep (`audioManager.synthesizeInverterAlarm`).
3. **Lost Time Clock Skip**: `state.time.simulationTimeSeconds` advances by `clockSkipSeconds` (e.g. 5,400s / 90 minutes).
4. **State & File Mutations**:
   - Volatile buffers reset.
   - Physical flags updated (`ledco_grid_active = false`, `inverter_active = true`).
   - Surprise artifacts dropped into `/tmp/` or inbox during the darkness.
5. **Accessibility**: Respects `reduceMotion` by disabling strobe/flicker and using static battery reserve telemetry.

---

## 6. Guidance Modes (`Guided` vs `Immersive`)

Players choose their narrative experience in Settings:
- **Guided**: Displays structured HUD objective tracker with step-by-step checklist.
- **Immersive**: Suppresses the HUD checklist. Objectives are communicated purely through diegetic channels (incident tickets, Onion chats, mentor hints).
