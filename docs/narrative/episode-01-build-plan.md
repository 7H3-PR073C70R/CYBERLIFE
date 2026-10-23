# Cyberlife — Episode 01 Build Plan
## "The Aster Anomaly & The Midnight Query" (`ep01_triage_init.pcap`)

> **Document Type**: Technical Implementation Specification & Narrative Execution Blueprint  
> **Status**: Approved Architectural Plan  
> **Target Path**: `docs/narrative/episode-01-build-plan.md`  
> **Target Slice**: Episode 01 Full Vertical Slice (Cold Open to Cliffhanger)  
> **Estimated Playthrough Length**: 45 to 60 Minutes (First Playthrough)  

---

## 1. Executive Overview & Slice Objectives

Episode 01 serves as the **definitive playable vertical slice** for Cyberlife Season 1. It proves that the three foundational architectural layers operate in complete harmony:
1. **The Narrative Episode Framework** (Step C): Deterministic beat sequencing, multi-channel diegetic delivery (bootloader title cards, incident portal tickets, encrypted Onion Chat pings, VoIP calls, encrypted journal entries, and blackout lost-time mutators).
2. **The Trace & Legal Exposure Engine** (Step D): Data-driven action noise modeling, short-term trace decay, OPSEC countermeasure attenuation (Tor/VPN/log wiping), deterministic defender response thresholds, and purple-team Defender View debriefs.
3. **The Core Cybersecurity Teaching Loop**: NIST SP 800-61r2 incident triage, SMB2/DNS display filter mastery in Packet Lens, SIEM CEF alert correlation, Sysmon process/network telemetry inspection, and ethical corporate escalation vs. containment dilemmas.

### Architectural Invariants
- **Simulation Layer Owns All State & Rules**: Pure deterministic functions, save-safe serialization, and replayability.
- **Presentation Layer Renders Only**: React components, Three.js world viewports, and Web Audio synthesis respond strictly to simulation events and dispatch typed commands.
- **Zero New Dependencies**: Built entirely with existing React, Vite, Three.js, and Web Audio APIs.
- **100% Simulated Sandbox**: Fictional hosts (`app-portal-01`, `filesrv-01`, `vault-core-01.transit.internal`), fictional entities (Cedarline, LEDCo, 0xLagos, Eko Nexus), zero real exploits, and zero live external network sockets.
- **Protagonist Specification**: The player character is **Protector** (strictly gender-neutral, never referred to with gendered terms).

---

## 2. Beat-by-Beat Timeline & System Integration

The complete slice takes place across the three existing spatial locations:
1. `apartment_interior`: Fourth-floor tenement loft, Odunlami Street (Morning reflection, late-night research, cliffhanger).
2. `neighborhood`: Broad Street / Marina commercial corridor (Commute, street chatter, planting Barry's distress).
3. `cedarline_interior`: Floor 14 Security Operations Center & Workstation (Authorized daytime enterprise incident triage).

```
[07:00] Cold Open: Title Card & Kernel Banner (ep01_beat_01_title)
   │
   ▼
[07:15] Apartment Morning: Encrypted Journal & Blessing SMS (ep01_beat_02_morning)
   │
   ▼
[07:45] Commute: Broad Street NPCs & Barry Encounter (ep01_beat_03_commute)
   │
   ▼
[08:15] Cedarline SOC: Blessing Briefing & Ticket ALT-2026-1012 (ep01_beat_04_ticket)
   │
   ▼
[08:30] Reconnaissance: netmap, svcscan & CEF SIEM Triage (ep01_beat_05_recon)
   │
   ▼
[09:15] Packet Lens: SMB2 Tree Connect & Eko Nexus Anomaly (ep01_beat_06_packetlens)
   │
   ▼
[10:30] Containment: Evidence Preservation & aster-admin (ep01_beat_07_containment)
   │
   ▼
[11:15] Human Pressure: VP Michael Call & The Incident Choice (ep01_beat_08_choice)
   │
   ▼
[12:00] Enterprise Day Case Debrief Screen (ep01_beat_09_day_debrief)
   │
   ▼
[21:30] Night Job: Tsharp Onion Tip & Gray-Zone Scan (ep01_beat_10_night_recon)
   │
   ▼
[23:45] Encrypted Journal: Second Reflection & Contradiction (ep01_beat_11_journal_night)
   │
   ▼
[01:14] Cliffhanger: Blackout Beat & Nexus Handshake Drop (ep01_beat_12_cliffhanger)
```

---

### Detailed Beat Breakdown

| Beat ID | Title & Premise | Location | Active Apps & Systems | Simulated Artefacts & Actions | Est. Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ep01_beat_01_title`** | **Cold Open Bootloader**<br>System boot sequence with kernel banner, UTC+1 timestamp, and SHA-256 hash. | System Overlay | `TitleCardOverlay` | SHA-256: `c7b9148d2f5a6b0981e4c7310df0b968c9284218a5e82110c7104bfa3513a011`. Dismissed into apartment. | 2 min |
| **`ep01_beat_02_morning`** | **Odunlami Morning**<br>Wake up to silent fan (11.8V inverter). Review finances and first journal reflection. | `apartment_interior` | `JournalApp`<br>`ContactsApp`<br>`journal` CLI | Unlocks `ep01_journal_01` (`~/.vault/journal.enc`). Two claims: `ep01_claim_01` (TRUE) and `ep01_claim_02` (FALLIBLE / CONTRADICTED). SMS from Blessing. | 4 min |
| **`ep01_beat_03_commute`** | **Marina Transit Walk**<br>Walk down Odunlami Street past Broad Street vendors to Marina Tower. | `neighborhood` | Dialogue Engine<br>3D World Viewport | Ambient lines from Mama Esther and Uncle Segun. Brief encounter with Barry sweating outside, claiming he was fixing AC units all weekend. | 5 min |
| **`ep01_beat_04_ticket`** | **Cedarline Dispatch**<br>Blessing assigns ticket `ALT-2026-1012`. Notes ticket was suppressed from executive view. | `cedarline_interior` | `IncidentApp`<br>`TopPanel`<br>Dialogue Engine | Official ticket `ALT-2026-1012`. Authorised RoE scope set (`10.0.4.0/24`: `app-portal-01`, `filesrv-01`). Blessing dialogue in Nigerian English. | 5 min |
| **`ep01_beat_05_recon`** | **Service & Log Triage**<br>Enumerate subnet hosts, inspect Aster listening ports, and review SIEM alerts. | `cedarline_interior` | `TerminalApp`<br>`IncidentApp` (`logview`, `netmap`, `svcscan`) | `netmap hosts`: finds 10.0.4.15 and 10.0.4.20.<br>`svcscan inspect app-portal-01`: port 8080 active.<br>`logview`: CEF alerts from `mon-siem-01`, Sysmon Event 1 (`aster-agent-worker`) & Event 3. | 8 min |
| **`ep01_beat_06_packetlens`** | **SMB2 Deep Dissection**<br>Filter capture for SMB2 commands and isolate anomalous Tree Connect. | `cedarline_interior` | `PacketLensApp`<br>`trafficAnalyzer` | Filter: `smb2.cmd == 5 && ip.addr == 10.0.4.15`. Dissects `\\filesrv-01\confidential$`. Uncovers embedded outbound TLS handshake to `vault-core-01.transit.internal`. | 10 min |
| **`ep01_beat_07_containment`**| **Least-Privilege Lock**<br>Preserve cryptographic evidence, isolate routes, and demote service role. | `cedarline_interior` | `TerminalApp`<br>`IncidentApp` (`evidence`, `aster-admin`) | Preserve `EVD-2026-004` (IAM snapshot) & `EVD-2026-001` (PCAP). Run `aster-admin contain`, `aster-admin remediate --role=kb-assistant`, `aster-admin verify`. | 6 min |
| **`ep01_beat_08_choice`** | **The Corporate Dilemma**<br>VP Michael calls with pressure. Confronted with Barry's lie, player decides escalation. | `cedarline_interior` | `HackerCallOverlay`<br>`IncidentApp` | Michael VoIP call. Choice modal:<br>• **Choice A**: Escalate pipeline staging to executive board (+10 SecOps).<br>• **Choice B**: Log as internal IAM misconfiguration (-5 SecOps, protects team). | 5 min |
| **`ep01_beat_09_day_debrief`**| **Enterprise Debrief**<br>Post-incident analysis, ATT&CK mapping, and triage score. | `cedarline_interior` | `EnterpriseDebriefModal` | Displays filters used, evidence preserved, ATT&CK T1021.002/T1071.001, proxy correlation best practices, NIST SP 800-61r2 review, and letter grade (A-S). | 4 min |
| **`ep01_beat_10_night_recon`**| **The Midnight Query**<br>Gray-zone probe of external offshore scans against `app-portal-01:8080`. | `apartment_interior` | `OnionChatApp`<br>`TerminalApp`<br>`TraceMeterApplet` | Tsharp encrypted tip. Passive OSINT stays quiet (Trace < 15%). Optional active scan raises Trace to 60%, triggers WAF 429 rate-limiting. Ends with Defender View modal. | 8 min |
| **`ep01_beat_11_journal_night`**| **Night Reflection**<br>Protector logs second encrypted journal entry with seeds of contradiction. | `apartment_interior` | `JournalApp`<br>`journal` CLI | Unlocks `ep01_journal_02`. New claim asserting Mercy had no role in external staging (sets up Episode 07 contradiction). Reflects on the choice made. | 3 min |
| **`ep01_beat_12_cliffhanger`**| **The Disconnect & Dump**<br>Municipal grid trip, inverter scream, 90-min clock jump, and Nexus dump drop. | `apartment_interior` | `BlackoutOverlay`<br>`virtualFilesystem`<br>`OnionChatApp` | Brownout flicker, 1 kHz inverter tone, clock skips 90 min. File `/tmp/nexus_handshake_dump.pcap` created. Anonymous Onion ping: *"You saw the Nexus address. Walk away."* | 3 min |

---

## 3. Reusing & Wrapping the Existing Aster Mission

The existing Aster Incident mission (`act_story_aster_investigation`) and its 9-step checklist (`obj-briefing-01` to `obj-reporting-01`) are **fully preserved and mapped 1:1 into Episode 01 beats**. No steps are duplicated; Episode 01 acts as the authoritative narrative wrapper.

```
┌───────────────────────────────────────────────┬────────────────────────────────────────────────┐
│ Legacy Aster Objective (Guided Checklist)    │ Episode 01 Narrative Beat & Diegetic Wrapper   │
├───────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ 1. obj-briefing-01 (Review Case #2026-AST-01) │ Beat 4: Cedarline Dispatch Ticket ALT-2026-1012│
│ 2. obj-assess-01 (netmap hosts)               │ Beat 5: Reconnaissance & Subnet Discovery      │
│ 3. obj-investigate-01 (svcscan app-portal-01) │ Beat 5: Service Enumeration on Port 8080       │
│ 4. obj-investigate-02 (logview filter WARN)   │ Beat 5: CEF SIEM & Sysmon Log Triage           │
│ 5. obj-evidence-01 (evidence EVD-2026-004)    │ Beat 7: Cryptographic Evidence Preservation    │
│ 6. obj-containment-01 (aster-admin contain)   │ Beat 7: Automated Network Boundary Isolation   │
│ 7. obj-remediation-01 (aster-admin remediate) │ Beat 7: Role Demotion to least-privilege       │
│ 8. obj-verification-01 (aster-admin verify)   │ Beat 7: Positive/Negative Test Verification    │
│ 9. obj-reporting-01 (Submit Incident Report)  │ Beat 8: The Incident Choice & Report Sign-Off  │
└───────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

### Guidance Mode Divergence
- **Guided Mode**: The `ObjectiveTrackerHUD` displays the 9-step checklist step-by-step with command paste buttons.
- **Immersive Mode**: The `ObjectiveTrackerHUD` is completely hidden. The player relies on:
  1. The incident ticket instructions in `IncidentApp`.
  2. In-terminal tool command feedback and help.
  3. **Blessing's 3-Tier Mentor Hint Ladder**: If the player is idle for > 45 seconds on a beat, Blessing sends a subtle diegetic message via Onion Chat:
     - *Nudge (Tier 1)*: High-level tactical observation (*"Protector, filesrv-01 is still answering SMB queries on the internal interface."*).
     - *Direction (Tier 2)*: Specific tool recommendation (*"Filter the mirror traffic in Packet Lens for SMB2 command type 5."*).
     - *Answer (Tier 3)*: Concrete command or parameter (*"Run `smb2.cmd == 5 && ip.addr == 10.0.4.15` in Packet Lens to isolate the Tree Connect."*).
  4. Non-blocking "What To Do Now" guidance available on-demand in the Workstation Help Center.

---

## 4. Technical Artefacts Specification

### 4.1 Synthetic PCAP Stream (`ep01_triage_init.pcap`)
Generated deterministically inside `src/simulation/cyber/network/ep01TrafficFixtures.ts`:
- **Total Packets**: 48 packets representing a 15-minute capture window.
- **Baseline Traffic**:
  - Routine PostgreSQL batch sync between `app-portal-01` and `db-core-01` (`TCP 5432`).
  - Internal DNS lookups (`UDP 53`) for `filesrv-01.cedarline.internal` and `auth-ldap-01.cedarline.internal`.
  - Normal SMB2 workstation keep-alives and administrative shares (`C$`, `IPC$`).
  - Internal NTP synchronization (`UDP 123`).
- **Red Herrings**:
  - Failed Kerberos pre-authentication from Barry's workstation (`10.0.4.45`) due to clock drift.
  - Periodic HTTPS health check probe from AWS staging load balancer (`TCP 443`).
- **The Core Anomaly (Packets 24–32)**:
  - `Sequence 24`: SMB2 Negotiate Protocol Request (`10.0.4.15 -> 10.0.4.20`).
  - `Sequence 26`: SMB2 Session Setup Request, NTLMSSP auth (`userPrincipal: svc-aster`).
  - `Sequence 28`: SMB2 `Tree Connect Request` (`smb2.cmd == 5`) to `\\filesrv-01.cedarline.internal\confidential$` (`STATUS_SUCCESS`).
  - `Sequence 30`: SMB2 Create Request for `payroll_2026_q3_draft.xlsx`.
  - `Sequence 32`: Embedded outbound TLS Client Hello from `10.0.4.15` destined for `vault-core-01.transit.internal` (`196.220.10.5:8443`), SNI `vault-core-01.transit.internal`, JA3 `72c6499890bace0f12d8a011a0098f9a`.

### 4.2 SIEM CEF Alert Records (`mon-siem-01`)
Accessible via `logview` and `IncidentApp`:
```
CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_SMB_TRAVERSAL|Unauthorized SMB Tree Connect to Confidential Share|7|src=10.0.4.15 dst=10.0.4.20 spt=51204 dpt=445 suser=svc-aster msg=Tree connect to \\filesrv-01\confidential$ granted under corporate-admin role
CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_OUTBOUND_TLS_ANOMALY|Unexpected TLS Egress from Application Tier|8|src=10.0.4.15 dst=196.220.10.5 spt=49812 dpt=8443 cs1=vault-core-01.transit.internal cs2=JA3:72c6499890ba msg=Outbound connection to unclassified external transit node
```

### 4.3 Sysmon Logs (Windows Event Records)
- **Event ID 1 (Process Creation)**:
  - Image: `C:\Cedarline\Aster\bin\aster-agent-worker.exe`
  - CommandLine: `aster-agent-worker.exe --task=retrieve --target=\\filesrv-01\confidential$\payroll_2026_q3_draft.xlsx`
  - User: `CEDARLINE\svc-aster`
  - ParentImage: `C:\Windows\System32\services.exe`
- **Event ID 3 (Network Connection)**:
  - Image: `C:\Cedarline\Aster\bin\aster-agent-worker.exe`
  - SourceIp: `10.0.4.15`, SourcePort: `49812`
  - DestinationIp: `196.220.10.5`, DestinationPort: `8443`
  - Protocol: `tcp`

### 4.4 Cliffhanger PCAP (`/tmp/nexus_handshake_dump.pcap`)
A valid binary/synthetic capture file generated during the blackout lost-time mutation containing the full TLS Client/Server Hello handshake between `app-portal-01` and `vault-core-01.transit.internal`.

---

## 5. Generic Reusable Engines vs. Episode 01 Specific Content

To ensure Episodes 02 through 08 can be authored cleanly via pure data, the following engine components are decoupled:

| Reusable Generic Architecture | Episode 01 Specific Data Files |
| :--- | :--- |
| **`pcapBuilder.ts`**: Generic synthetic PCAP generator supporting baseline traffic injection, jitter, protocol decoders (SMB2, DNS, TLS, HTTP), and anomaly insertion. | **`ep01TrafficFixtures.ts`**: Specific packet events, IPs, ports, and payload contents for the Aster incident. |
| **`cefLogGenerator.ts`**: Pure function converting event definitions into RFC-compliant CEF and Sysmon string formats. | **`ep01LogFixtures.ts`**: Alert templates, timestamps, and host signatures for `mon-siem-01`. |
| **`mentorHintLadder.ts`**: General 3-level hint evaluation engine checking player idle time and guidance mode. | **`ep01MentorHints.ts`**: Authored hint texts from Blessing for each beat. |
| **`EnterpriseDebriefModal.tsx`**: Modular debrief presentation component displaying metrics, ATT&CK mapping, and learning grades. | **`ep01DebriefData.ts`**: Episode 01 specific learning objectives, SANS references, and grading rubrics. |
| **`ScopeWarningDialog.tsx` & `TraceMeterApplet.tsx`**: Persistent Step D trace presentation applets. | **`ep01NightJobScope.ts`**: Authorized hosts and sensitivity profiles for `app-portal-01`. |

---

## 6. Voice Generation Manifest

Every line of spoken dialogue in Episode 01 is mapped and flagged for future speech synthesis / voice recording. All lines are marked `needsHumanRecording: true` (or `voiceGenerated: false`).

| Dialogue ID | Character | Context / Beat | Line of Dialogue | Emotional Tone |
| :--- | :--- | :--- | :--- | :--- |
| `ep01_v_bless_01` | Blessing | Phone Call (Beat 2) | *"Protector, good morning. Don't waste time with breakfast. Get to Marina Tower now; svc-aster is pulling files it shouldn't touch."* | Urgent, controlled |
| `ep01_v_bless_02` | Blessing | SOC Floor (Beat 4) | *"The ticket is ALT-2026-1012. Michael doesn't know yet—the alert was suppressed from the morning digest. We need to know if payroll leaked."* | Low, anxious |
| `ep01_v_bless_03` | Blessing | Choice A Reaction (Beat 8) | *"You did the right thing, Protector. It will cause wahala with Michael, but our job is the truth, not the stock price."* | Proud, solemn |
| `ep01_v_bless_04` | Blessing | Choice B Reaction (Beat 8) | *"Understood. We contain it internally and keep the wolves away from Barry. But if NDSRC audits this later, we are on our own."* | Guarded, wary |
| `ep01_v_barry_01` | Barry | Street Walk (Beat 3) | *"Protector! Ah... good morning. Hot morning, abi? I'm just running to grab meat pie. Server room AC was acting up all weekend, no be small thing."* | Fast, sweating |
| `ep01_v_barry_02` | Barry | VoIP Call (Beat 4) | *"Protector! Please tell me you haven't escalated the Aster ticket yet. I swear I was only servicing the cooling racks on Saturday!"* | Panicked, pleading |
| `ep01_v_barry_03` | Barry | VoIP Call (Beat 4) | *"If Michael sees my name near that wildcard role, I am finished. Check the IAM policy yourself—I was forced to rush it!"* | Desperate |
| `ep01_v_mich_01` | Michael | VoIP Call (Beat 8) | *"Protector. Blessing tells me you're leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?"* | Commanding, sharp |
| `ep01_v_mich_02` | Michael | VoIP Call (Beat 8) | *"I don't need a lecture on MITRE techniques. I need clean incident sign-off showing zero external exposure. Do not invent ghosts on my network."* | Cold, coercive |
| `ep01_v_tsharp_01` | Tsharp | Onion Audio Note (Beat 10)| *"Yo Protector. Off-grid telemetry caught offshore scanners hitting 8080. If you probe that port actively, Cedarline's SOC will trip. Keep it quiet."* | Wry, street-smart |

---

## 7. Testing Strategy & Validation Matrix

1. **Automated End-to-End Slice Runner (`tests/e2e/Episode01VerticalSlice.test.ts`)**:
   - Plays through all 12 beats from cold-open title card to cliffhanger blackout.
   - Tests both branching paths: **Choice A (Escalation)** and **Choice B (Quiet Containment)**.
   - Tests both Night Job paths: **Quiet Passive OSINT** (Trace remains < 15%) and **Loud Active Scan** (Trace hits 60%, triggers WAF 429 rate-limiting, and yields Defender View debrief).
   - Simulates save-and-load at Beat 6, verifying exact state restoration without desynchronization.
2. **PCAP & Log Format Integrity (`tests/unit/simulation/cyber/ep01Artefacts.test.ts`)**:
   - Verifies all 48 packets have monotonic timestamps, valid IP/port pairs, and correct SMB2/TLS structure.
   - Verifies CEF logs conform to RFC format and parse cleanly in `logview`.
   - Verifies Sysmon Event ID 1 & 3 records match PCAP sequence timestamps.
3. **Scoring & Debrief Evaluator Tests (`tests/unit/simulation/narrative/ep01Debrief.test.ts`)**:
   - Tests grading algorithm based on display filter accuracy, evidence preservation, and choice consequences.
4. **Component Tests (`tests/unit/presentation/ep01Presentation.test.tsx`)**:
   - Tests `EnterpriseDebriefModal`, `PacketLensApp` filter input (`smb2.cmd == 5 && ip.addr == 10.0.4.15`), and `BlackoutOverlay` cliffhanger transition.
