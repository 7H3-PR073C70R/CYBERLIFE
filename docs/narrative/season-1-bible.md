# Cyberlife — Season 1 Story Bible v2: The Marina Corridor Protocols

> **Document Type**: Authoritative Narrative Architecture & Pedagogical Story Bible  
> **Status**: Canonical / v2.0  
> **Target Path**: `docs/narrative/season-1-bible.md`  
> **Setting**: Lagos Island, Nigeria (Circa October–November 2026)  
> **Target Length**: Comprehensive Reference Specification (approx. 5,500 words)  

---

## 1. Executive Summary & Narrative Philosophy

**Cyberlife** is a high-fidelity cybersecurity career simulation and interactive techno-thriller set in the dense, historic, and hyper-connected financial and mercantile corridor of Lagos Island, Nigeria. The narrative layer does not function as cosmetic window-dressing or an arcade gamification veneer; it is the **dramatic engine that drives genuine technical mastery**.

Every story beat, interpersonal tension, and ethical crisis in Season 1 is anchored directly in real-world cybersecurity disciplines:
- **Blue Team**: Enterprise Security Operations Center (SOC) triage, alert prioritization, and Sigma rule engineering.
- **Red Team**: Scoped penetration testing, vulnerability validation, and lateral movement under strict Rules of Engagement (RoE).
- **Purple Team**: Collaborative adversary emulation, detection gap analysis, and retest verification.
- **Network Forensics & Threat Intel**: Deep-packet inspection (Packet Lens), multi-protocol dissection, and indicator correlation.
- **Digital Forensics & Incident Response (DFIR)**: RFC 3161 evidence preservation, Master File Table (MFT) timestomping detection, and chain of custody.
- **Reverse Engineering**: Static and dynamic binary disassembly, PE/ELF header analysis, and firmware inspection (Rev Lens).
- **Social Engineering & Physical Security**: Pretexting awareness, credential harvesting analysis, and facility access control audits.
- **Independent Vulnerability Research**: Open-market bug bounty programs, coordinated vulnerability disclosure, and Tor/Onion threat tracking.
- **AI/LLM Security**: Indirect prompt injection, retrieval-augmented generation (RAG) vector poisoning, and autonomous agent tool-calling containment (The Aster Incident).

The dramatic structure draws aesthetic inspiration from grounded, psychological techno-realism: an isolated protagonist caught between towering corporate interests, a fragile municipal infrastructure, and a decentralized underground. However, Cyberlife replaces Hollywood "magic hacking" tropes with **rigorous, cert-syllabus technical authenticity**. When the screen cuts to black, the mystery is solved not by intuition, but by comparing cryptographic SHA-256 hashes and analyzing immutable file system telemetry.

---

## 2. Protagonist Specification: Protector

### 2.1 Identity & Character Specification

To resolve the naming collision with the regulatory inspector (`npc_babatunde`, canonically normalized to **Daniel** in [docs/narrative/name-changes.md](file:///Users/protector/Documents/projects/cyberlife/docs/narrative/name-changes.md)) and the legacy default "Babatunde", the player character is formally named:

- **Character Name**: **Protector** (The player selects male or female during character creation; default male).
- **Informal / Dialogue Call**: **Protector** (or gender-neutral respectful terms: *"my friend"*, *"analyst"*). Never gendered forms.
- **Terminal User / OS Handle**: `protector` (e.g., `protector@orion-ws04:~#`)
- **Underground Handle (0xLagos / Onion Chat)**: `Protector` (or cryptographic PGP key ID `0x7E3_PR073C70R`)
- **Age**: 26
- **Current Position**: Tier-1 Contract Security Analyst, Cedarline Services Ltd. (Marina Tower)
- **Residence**: Fourth-floor tenement loft, Odunlami Street back-alleys, central Lagos Island

### 2.2 Backstory

Protector is an astute, largely self-taught systems engineer from Ebute Metta who earned a diploma in electrical engineering before breaking into digital infrastructure. Eighteen months prior to Season 1, Protector worked as an unpaid intern at an interbank settlement clearinghouse on Broad Street. While debugging recurring timeout errors on the legacy core banking switch, Protector authored an unauthorized, lightweight diagnostic shell script (`nexus_probe_v1.sh`) to trace dropped transactions across the multi-tenant data corridor connecting commercial banks to maritime freight at the Port of Lagos.

When an overseas enterprise consulting firm was awarded the infrastructure modernisation contract, Protector was summarily laid off without reference. Protector kept the laptop, wiped the credentials—or so Protector believed—and drifted into freelance electronics repair in Balogun Market before recruiter Goodness secured Protector a probationary Tier-1 SOC contractor seat at Cedarline Services Ltd.

### 2.3 The Secret

The diagnostic hook Protector wrote as an intern was never decommissioned. Unknown to Protector until Episode 1, an external adversary discovered `nexus_probe_v1.sh` dormant on an unsegmented management subnet, modified its parameters, and turned it into an automated exfiltration pipe across the **Eko Nexus Pipeline**. 

Protector's deepest terror is not simply being fired—it is that a rigorous forensic audit by NDSRC or Krest IR will trace the root origin of the intrusion back to Protector's own early git commits and shell scripts, destroying Protector's career and landing Protector in a federal holding cell.

### 2.4 Flaw, Want, and Need

- **The Flaw (Hyper-Vigilant Isolation & Intellectual Pride)**: Protector believes that asking for help is an admission of guilt or incompetence. Convinced that corporate leaders are universally negligent and peers are easily compromised, Protector hoards evidence, works off-the-clock without authorization, and relies excessively on solitary deduction. This hyper-arousal leads to chronic sleep deprivation, stimulant abuse, and perceptual distortion.
- **The Want**: Unassailable professional legitimacy. Protector wants a permanent, high-paying corporate contract at Cedarline, clearance to work Tier-3 incident response, financial security to pay quarterly rent and generator fuel, and public recognition as a premier defensive architect.
- **The Need**: To accept that cybersecurity is fundamentally an enterprise of **collective human resilience, institutional transparency, and radical honesty**. Protector must learn to trust mentors like Blessing, forgive terrified peers like Barry, and take accountability for past technical shortcuts rather than covering them up.

### 2.5 The Encrypted Journal: Voice, Purpose & Structural Unreliability

Protector maintains an encrypted daily journal located at `~/.vault/journal.enc` on Orion OS, decrypted locally via an interactive CLI viewer or desktop utility.

- **The Audience ("You")**: The journal is addressed directly to the player in the second person (*"You"*). Protector treats the player as an internal interlocutor, a quiet cognitive co-pilot, or a sounding board:
  > *"You noticed that latency spike on the secondary gateway at 14:10, didn't you? Tell me you saw it. Blessing thinks it was just a cloud backup sync. But you and I know backup cron jobs don't request raw SMB tree connects to payroll shares."*
- **Tone**: Warm, sharp, wryly humorous, hyper-focused, and steeped in authentic Lagos street intelligence. It captures the exhausting rhythm of generator hums, damp coastal sea breezes through open louvers, cold instant coffee, and the terrifying beauty of clean network telemetry.
- **The Structural Unreliability (The Journal is Sometimes WRONG)**:
  Protector's journal is not an omniscient objective log. In multiple episodes, Protector's subjective conclusions are **demonstrably contradicted by later hard digital evidence**:
  - In *Episode 1*, Protector writes with total conviction that Lead AI Engineer Mercy intentionally planted a backdoor in Aster to sabotage VP Michael. In *Episode 2*, forensic JSON inspection reveals Mercy's strict guardrail commits were overridden by an executive pull request approved while Mercy was on a flight.
  - In *Episode 3*, Protector notes that an unknown stalker visited the apartment building during a power cut. In *Episode 7*, disk MFT carving and physical CCTV logs prove Protector sleepwalked to the corner kiosk in a state of exhaustion, hallucinating the confrontation.
  - *Pedagogical Objective*: Reinforces the golden rule of incident response: **"Witness testimony—including your own—is fallible; cryptographic evidence and correlated timestamps are immutable."**

---

## 3. The Dual-Life Loop & Simulation Clock

Cyberlife structures each gameplay day into a four-phase diurnal cycle, mirroring the real life of a technical professional navigating an intense emerging-market metropolis.

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         THE 24-HOUR DUAL-LIFE LOOP                     │
  └────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  [ 07:00 - 09:00 ] PHASE 1: MORNING (Apartment & Urban Transit)
       │ - Review personal finances (rent due, generator fuel, inverter battery %).
       │ - Read ~/.vault/journal.enc from "last night" (spot discrepancies).
       │ - Walk through CMS Transit Hub / Tinubu Square; gather ambient rumors.
       ▼
  [ 09:00 - 17:30 ] PHASE 2: DAY (Authorized Enterprise Work at Cedarline)
       │ - Governed by Corporate SLA, formal Rules of Engagement (RoE), and NDAs.
       │ - Dispatch via Activity Director: Blue Team SOC triage, Packet Lens inspection.
       │ - Scoped Red Team audits (authorized targets only: 10.0.12.0/24).
       │ - Corporate salary paid in Kobo; enterprise reputation (cedarline_secops).
       ▼
  [ 18:00 - 23:00 ] PHASE 3: NIGHT (The Gray Zone: 0xLagos & Balogun Market)
       │ - Off-grid research: Marina Seawall meetings, Balogun electronics backrooms.
       │ - Tor Browser & Onion Chat: Unregulated vulnerability bounties, C2 tracking.
       │ - Exploit Lab & Rev Lens: Decompiling live malware samples without safety gates.
       │ - High stakes: Trip a honeypot, and NDSRC Inspector Daniel initiates surveillance.
       ▼
  [ 23:30 - 03:00 ] PHASE 4: LATE-NIGHT BLACKOUT BEAT (The Disconnect)
       │ - Municipal grid collapse ("Up NEPA!"). Inverter screams and drops to 12V.
       │ - Lost Time Event: Clock jumps 90–180 minutes forward.
       │ - The terminal wakes up with unexpected bash history, moved files, or open sockets.
       │ - Journal asserts one narrative; file system evidence reveals another.
       └────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Morning: Awakening & Logistics (07:00 – 09:00)
- **Location**: Player's Apartment, Odunlami Street.
- **Systems & Mechanics**:
  - `WorldSimulationService`: Triggers daily rent and inverter power billing deductions.
  - `FileManagerApp`: Check `~/.vault/journal.enc` for recent decrypt notes.
  - `ContactsApp`: Read SMS messages from recruiter Goodness, landlord notices, or cryptic pings from Tsharp.
  - Physical Transit: Walk down into the street, pass through Tinubu Square or the Marina Promenade, observing diurnal pedestrian traffic patterns and vendor opening routines.

### 3.2 Day: Authorized Enterprise Operations (09:00 – 17:30)
- **Location**: Floor 14 (SOC Console) and Floor 18 (Server Closet), Cedarline Marina Tower.
- **Systems & Mechanics**:
  - `ActivityApp` & `IncidentApp`: Official corporate tickets dispatched by the Activity Director.
  - `DefensiveOpsApp`: Triage incoming SIEM alerts (`ALT-2026-XXXX`), tune Sigma rules, inspect host telemetry.
  - `PacketLensApp`: Dissect live internal mirror traffic, isolate misbehaving internal nodes.
  - `RedTeamApp`: Perform authorized penetration testing strictly within signed Rules of Engagement (RoE). Any attempt to scan prohibited subnets (e.g. `dc-core-01`) triggers instant contract penalties and management reprimands.
  - Faction Governance: Builds standing with `cedarline_secops` and `eko_merchant_bank`.

### 3.3 Night: The Gray Zone (18:00 – 23:00)
- **Location**: Apartment workstation, Marina Seawall, or Mama Esther’s Balogun backroom.
- **Systems & Mechanics**:
  - `TorBrowserApp` & `OnionChatApp`: Connect to the 0xLagos Research Syndicate forum and encrypted broker relays.
  - `BountyApp`: Accept high-risk, independent vulnerability contracts across Lagos Island infrastructure.
  - `ExploitLabApp` & `RevLensApp`: Reverse engineer obfuscated payloads, carve raw firmware, analyze predatory loan app trackers.
  - Legal & Operational Consequences: Operating without an authorized RoE charter means real counter-intelligence pressure. Failing an evasion check alerts Krest IR or triggers an NDSRC statutory audit inquiry.

### 3.4 Late-Night Blackout Beat: The Disconnect (23:30 – 03:00)
- **Location**: Darkened Apartment Workstation.
- **Systems & Mechanics**:
  - Detailed in Section 4. The physical power cut serves as a mechanical transition, an atmospheric punctuation mark, and an unreliable-narrator device.

---

## 4. Blackouts as Lost Time: The Forensic Contradiction

### 4.1 Grounded Reality: Municipal Infrastructure as Narrative Device
In Lagos Island, electrical supply shifts constantly between the national grid (Eko Electricity Distribution Company / EKEDC), private diesel generator banks, and residential solar inverter arrays. The sudden cut—marked by the neighborhood-wide drop in background hum followed seconds later by the clatter of small two-stroke generators—is an inescapable reality.

In Cyberlife, this infrastructure fragility is elevated into a psychological and investigative mechanic: **The Lost Time State**.

### 4.2 Mechanical Execution of the Blackout Beat

1. **The Brownout Warning (Audio-Visual Trigger)**:
   - Overhead ceiling fan slows to a halt. Ambient room audio drops out.
   - Workstation monitor flickers twice; the inverter under the desk emits a continuous 1 kHz warning tone (`inverter_alarm.opus`).
   - Screen cuts to pure black for 4 seconds, accompanied by the deep mechanical thud of a substation trip.
2. **The Time Jump**:
   - The simulation clock skips forward dynamically (e.g., jumping from `23:42` to `02:18`).
   - The workstation reboots under emergency battery reserve (`BATTERY: 34% // VOLTAGE: 11.8V`).
3. **The State Mutation**:
   - When the desktop re-renders, the environment has changed:
     - The terminal prompt shows an active history entry that the player never entered (e.g., `nc -nv 10.0.12.99 4444` or `dd if=/dev/sdb of=/tmp/exfil.raw`).
     - A new, unread message in Onion Chat from an unknown handle: *"Session closed. Hashes verified. Do not speak to Blessing tomorrow."*
     - An open file in `FileManagerApp` with a modified timestamp matching the blackout interval.

### 4.3 The Pedagogical Payoff: The Forensic Contradiction

The next morning, Protector opens `~/.vault/journal.enc`. The entry (written during the fugue or immediately upon waking) provides an emotional, self-justifying narrative:
> *"23:45 — The power went out. I sat in the dark and waited for the grid to switch. I didn't touch the keyboard. I didn't touch Cedarline's gateway."*

However, when the player executes a forensic audit using the `forensics` CLI or `DefensiveOpsApp`:
- **Master File Table ($MFT) Analysis**: Inspecting `$STANDARD_INFORMATION` vs `$FILE_NAME` timestamps exposes a classic timestomping discrepancy on `C:\Windows\System32\drivers\etc\hosts` occurring precisely at `01:14:02 AM`.
- **Zeek / PCAP Telemetry**: `PacketLensApp` logs reveal an active TLS connection to an external relay with a JA3 fingerprint matching known command-and-control software, initiated from Protector’s MAC address during the blackout.
- **Sysmon Event Logs**: Event ID 1 (Process Creation) records an execution of `curl` with a base64-encoded authentication header.

The player is forced to confront the core truth: **Protector's memory is compromised by exhaustion and trauma, but the machine does not lie.** The player must learn to investigate *their own character* using objective digital evidence.

---

## 5. On-Screen Antagonistic Pressure & The Recurring Face

### 5.1 The Spectrum of Pressure
Protector is trapped between three distinct institutional pressures:
1. **Corporate Coercion (VP Michael)**: Wields legal NDAs, contract termination, and industry blacklisting. Michael does not care who is technically at fault; he cares about board valuation and international acquisition deadlines.
2. **Statutory Regulatory Power (Daniel - NDSRC)**: Wields federal search warrants, subpoena authority, and the power to revoke commercial licenses. Daniel is incorruptible, thorough, and moves with bureaucratic inevitability.
3. **Covert Corporate Containment (Krest IR & Choker)**: The active, shadow adversary who operates where legal corporate policy ends.

### 5.2 The Recurring Face: Choker

- **Identity**: Managing Director of Incident Response & Special Operations, **Krest Incident Response & Data Solutions**.
- **Appearance & Demeanor**:
  - Impeccably tailored: dark bespoke linen suits or crisp collarless tunics, devoid of corporate badges.
  - Speaks with quiet, Cambridge-educated elegance seasoned with chillingly calm colloquial Lagos cadence.
  - Never raises his voice, never uses crude threats, and never displays physical weapons. He carries an ultra-thin workstation tablet displaying live enterprise telemetry streams.
- **Operational MO**:
  - Choker represents the dark reality of elite corporate incident response: the "cleanup crew" hired by executive boards to quietly neutralize evidence, buy whistleblower silence, sanitize audit logs, and frame vulnerable junior staff before statutory regulators arrive.
- **The Psychological Stalking Cycle**:
  - *Episode 1*: A distant figure in the Marina Tower lobby talking quietly to VP Michael while reviewing an incident timeline.
  - *Episode 2*: Steps out of an air-conditioned black Lexus SUV near the Broad Street Danfo stop, buying roasted plantain from a street vendor while calmly naming Protector's university graduating year and current bank balance.
  - *Episode 3*: Protector finds a formal embossed business card slipped under the apartment door: *"Krest Incident Response — Strategic Advisory Retainer. Let us help you settle your uncle’s medical bill, Protector."*
  - *Episode 5*: Choker sits across from Protector in an empty corner booth at the Marina Waterfront Café, showing Protector a live packet capture of Protector's own apartment router: *"You think you're fighting for the truth, my friend. Truth is an expensive luxury in a city where the grid fails every afternoon. Sign the containment NDA, let Barry take the severance package, and tomorrow you have a desk on Floor 18."*

---

## 6. Season 1 Episode Architecture: The 8 Protocols

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               SEASON 1 EPISODE DIRECTORY                               │
├────────────┬─────────────────────────────┬─────────────────────────────────────────────┤
│ Episode 01 │ ep01_triage_init.pcap       │ Blue Team SOC Triage & The SMB Anomaly      │
│ Episode 02 │ ep02_wildcard_iam.audit     │ Identity Governance & Human Intelligence    │
│ Episode 03 │ ep03_curbside_beacon.dd     │ DFIR, Removable Media & Anti-Forensics      │
│ Episode 04 │ ep04_bola_clearance.py      │ Red Team API Security & Predatory Underflow │
│ Episode 05 │ ep05_prompt_injection.sig   │ AI/LLM Tool-Calling & Sigma Rule Tuning     │
│ Episode 06 │ ep06_predatory_pipeline.pcap│ The Big Act: Financial Contagion & OSINT    │
│ Episode 07 │ ep07_blackout_reconcile.mft │ Memory Forensics, MFT Timelines & Lost Time │
│ Episode 08 │ ep08_root_authority.exit    │ Executive Debrief, Tribunal & Final Mandate │
└────────────┴─────────────────────────────┴─────────────────────────────────────────────┘
```

---

### Episode 01: `ep01_triage_init.pcap`
*The Aster Anomaly & The Midnight Query*

- **Premise**: Monday morning, 07:42 AM. Cedarline's SOC is hit with an anomalous internal alert: the newly deployed autonomous enterprise customer assistant (`svc-aster`) executed unauthorized SMB read queries across the corporate management file server.
- **Cybersecurity Pillar(s)**: Blue Team (SOC Alert Triage, Network Traffic Analysis).
- **Learning Objectives**:
  - Apply NIST SP 800-61r2 incident handling triage methodology.
  - Construct Wireshark/PacketLens display filters for SMB2 and DNS dissection.
  - Differentiate routine batch database synchronization from credential abuse.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK**: T1021.002 (SMB/Windows Admin Shares), T1071.001 (Web Protocols).
  - **Sysmon Event IDs**: Event ID 3 (Network connection detected from `app-portal-01`), Event ID 1 (Process creation for `aster-agent-worker`).
  - **Packet Lens Dissection**: PCAP filter `smb2.cmd == 5 && ip.addr == 10.0.4.15`; identifying SMB2 `Tree Connect Request` to `\\filesrv-01.cedarline.internal\confidential$`.
  - **Log Format**: CEF (Common Event Format) alert logs exported from `mon-siem-01`.
- **Existing Apps & Tools**: `PacketLensApp`, `IncidentApp`, `TerminalApp` (`logview`, `netmap`, `svcscan`).
- **Day Case (Authorized)**: Triage alert `ALT-2026-1012`. Blessing tasks Protector with determining whether `svc-aster` accessed sensitive customer payroll data on `filesrv-01`.
- **Night Job (Gray-Zone)**: Tsharp alerts Protector via Onion Chat that 0xLagos spotted external port scans originating from offshore subnets probing `app-portal-01:8080`. Protector performs passive OSINT reconnaissance on the public IP range.
- **Characters & Secrets**:
  - *Blessing*: Confident SOC lead, but privately anxious; she notices the ticket was suppressed from the executive morning dashboard.
  - *Barry*: Sweating, evasive; claims he was working on cooling rack maintenance all weekend.
- **The Twist**: The anomalous query was not an internal scanning mistake. Embedded inside the SMB payload was an attempt to establish an outbound TLS handshake to `vault-core-01.transit.internal`—a secure clearing gateway belonging to **The Eko Nexus interbank pipeline**.
- **The Choice That Matters**:
  - *Choice A (Procedural)*: Log the external pipeline staging anomaly directly into the Cedarline ticket, escalating the incident to executive visibility.
  - *Choice B (Cautious)*: Mark the ticket as an internal permission misconfiguration to shield the team from VP Michael’s wrath while investigating quietly.
- **Faction Movement**: Cedarline SecOps (+10 on Choice A, -5 on Choice B); 0xLagos (+5 if external telemetry shared).
- **Debrief**:
  - *ATT&CK Mapping*: T1021.002, T1071.001.
  - *How Real Teams Do It*: Tier-1 analysts correlate proxy logs with network captures to confirm whether exfiltration bytes crossed the boundary before closing containment tickets.
  - *What to Study Next*: SANS SEC503 (Network Intrusion Analysis); RFC 2474 (DiffServ & Traffic Shaping).
- **Cliffhanger**: Protector returns to the dark apartment. The power drops. When the monitor flickers on under inverter battery, an encrypted archive (`nexus_handshake_dump.pcap`) sits in `/tmp`, and an anonymous ping arrives on Onion Chat: *"You saw the Nexus address. Walk away, Protector."*

---

### Episode 02: `ep02_wildcard_iam.audit`
*The Wildcard Mandate & Human Pressure*

- **Premise**: Executive management attempts to close the Aster investigation by declaring junior administrator Barry a rogue insider who authored a backdoor. Protector must audit the identity policies and cross-examine staff.
- **Cybersecurity Pillar(s)**: Identity & Access Management (IAM), Cloud Security, Human Intelligence (HUMINT).
- **Learning Objectives**:
  - Audit JSON cloud IAM policies against the Principle of Least Privilege (PoLP).
  - Cross-reference physical badge access control logs with server authentication telemetry (M21 HUMINT framework).
  - Detect social engineering pressure tactics utilized by executive leadership.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK**: T1078.004 (Cloud Accounts), T1098 (Account Manipulation).
  - **IAM Policy JSON**:
    ```json
    {
      "Version": "2026-10-12",
      "Statement": [{
        "Effect": "Allow",
        "Action": ["*"],
        "Resource": ["arn:cedarline:storage:::*"]
      }]
    }
    ```
  - **M21 Commands & Artefacts**: `StartInterview`, `AskInterviewQuestion`, `CompareEvidenceWithTestimony`; physical badge logs (`ev_phys_badge_log_tuesday`) showing badge `CED-2026-B-0247` entering Room 4B at 19:47.
- **Existing Apps & Tools**: `HumanIntelApp`, `IncidentApp`, `DefensiveOpsApp`, `FileManagerApp`.
- **Day Case (Authorized)**: Complete internal audit of `svc-aster` IAM role; interrogate Barry and Blessing regarding server room discrepancies.
- **Night Job (Gray-Zone)**: Mama Esther calls Protector to Balogun Market. Several mobile money POS terminals are throwing authorization token errors. Protector inspects the terminal configuration and finds hardcoded API credentials pointing to Cedarline's staging cluster.
- **Characters & Secrets**:
  - *Barry*: Breaks down during interrogation. He confesses he applied the wildcard `["*"]` policy because VP Michael threatened to fire him if Aster’s integration test failed ahead of foreign investor visits.
  - *Mercy*: Admits she warned management in writing that autonomous agents with wildcard scopes violate foundational AI safety parameters.
- **The Twist**: Barry did not author the prompt that triggered the SMB query. The wildcard permission simply opened the door; the malicious command entered via an external customer support ticket submitted through the public API.
- **The Choice That Matters**:
  - *Choice A (Ethical Mentor)*: Protect Barry by documenting the executive override email chain as the root cause in the incident portal and re-scoping the role to `kb-assistant`.
  - *Choice B (Corporate Alignment)*: Formally name Barry’s manual role assignment as the primary vulnerability to secure VP Michael’s approval and retain corporate standing.
- **Faction Movement**: Barry (+30 Allied on Choice A, -60 Hostile on Choice B); Cedarline Management (+25 on Choice B, -15 on Choice A).
- **Debrief**:
  - *ATT&CK Mapping*: T1078.004, T1098.
  - *How Real Teams Do It*: Enterprise IAM governance utilizes automated CI/CD policy linters (e.g., Checkov, AWS IAM Access Analyzer) to block wildcard grants in pull requests before deployment.
  - *What to Study Next*: NIST SP 800-207 (Zero Trust Architecture); ISO/IEC 27001 Annex A.9 (Access Control).
- **Cliffhanger**: Exiting the building onto Marina promenade, Protector is approached by Choker, who murmurs: *"A wise analyst knows when an account is supposed to have wildcards, Protector. Don't dig up pipes you can't afford to replace."*

---

### Episode 03: `ep03_curbside_beacon.dd`
*The Deadman Flash & Anti-Forensic Shadows*

- **Premise**: An encrypted USB storage device is discovered dropped at the Broad Street Danfo bus stop. Protector must conduct an air-gapped digital forensics investigation to carve its data without triggering anti-forensic traps.
- **Cybersecurity Pillar(s)**: Digital Forensics & Incident Response (DFIR), Media Carving, Reverse Engineering.
- **Learning Objectives**:
  - Enforce RFC 3161 digital chain-of-custody and compute SHA-256 baseline hashes.
  - Analyze NTFS Master File Table ($MFT) records to detect timestomping ($STANDARD_INFO vs $FILE_NAME discrepancies).
  - Safely extract and decompile executable firmware beacons in an air-gapped lab.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK**: T1091 (Replication Through Removable Media), T1070.006 (Timestomp), T1027 (Obfuscated Files).
  - **Forensic Evidence File**: `/evidence/marina_exfil_usb.dd` (Raw bitstream forensic image, SHA-256: `9e1c3a...`).
  - **MFT Discrepancy Table**:
    - `$STANDARD_INFORMATION` Modified: `2026-10-14 02:11:00 UTC`
    - `$FILE_NAME` Modified: `2026-10-10 18:30:12 UTC` (Proof of anti-forensic timestomping).
  - **Commands**: `forensics hash`, `forensics mft`, `revlens inspect`.
- **Existing Apps & Tools**: `TerminalApp` (`forensics`, `revlens`), `PacketLensApp`, `IncidentApp` (Evidence Vault).
- **Day Case (Authorized)**: Air-gapped forensic extraction of the USB drive image. Carve deleted partition records, verify hash integrity, and document forensic indicators.
- **Night Job (Gray-Zone)**: Packet Lens monitoring of port 8443 traffic crossing the Marina gateway. Correlate beaconing periodicity (exact 120-second jitter intervals) identified in the carved USB microcode against live external IPs.
- **Characters & Secrets**:
  - *Uncle Segun*: Recognizes the physical engraving on the flash drive casing—it belonged to a maritime port customs auditor who was forced into hiding after reporting phantom container clearings.
  - *Daniel (NDSRC)*: Reaches out via encrypted channels, warning Protector that foreign threat actors are actively probing the Eko Nexus pipeline.
- **The Twist**: The USB flash drive was not dropped by an attacker—it was an emergency deadman archive prepared by an EMB internal risk auditor who discovered that millions of Naira in fraudulent credits were being cleared through Cedarline's servers.
- **The Choice That Matters**:
  - *Choice A (Statutory Handover)*: Hand the preserved cryptographic evidence package directly to NDSRC Inspector Daniel.
  - *Choice B (Press Handover)*: Pass the evidence to Mary at *The Lagos Inquirer* to trigger public exposure and prevent a quiet corporate burial.
- **Faction Movement**: NDSRC (+35 on Choice A); The Lagos Inquirer (+40 on Choice B); Krest IR (-25 to Distrusted).
- **Debrief**:
  - *ATT&CK Mapping*: T1091, T1070.006.
  - *How Real Teams Do It*: Certified forensic examiners write-block physical drives, compute dual MD5/SHA-256 hashes, and use timeline carving tools (Plaso/log2timeline) to detect anti-forensic manipulation.
  - *What to Study Next*: SANS FOR500 (Windows Forensic Analysis); RFC 3227 (Evidence Collection & Archiving).
- **Cliffhanger**: Protector writes in the journal: *"Evidence sealed in vault at 22:00."* But next morning, the Evidence Vault audit log records an unauthorized export at 03:15 AM to an external server. The player has no memory of initiating the export.

---

### Episode 04: `ep04_bola_clearance.py`
*The Broken Boundary & Predatory Underflow*

- **Premise**: Cedarline is contracted to perform an authorized penetration test on Eko Merchant Bank’s new partner credit underwriting portal. Protector discovers a critical API vulnerability being actively exploited by predatory micro-lending apps.
- **Cybersecurity Pillar(s)**: Red Team (Web Application Penetration Testing, Rules of Engagement).
- **Learning Objectives**:
  - Execute web application security testing within strictly bounded Rules of Engagement (RoE).
  - Exploit and document OWASP API1:2023 Broken Object Level Authorization (BOLA/IDOR).
  - Formulate CVSS v3.1 base score vectors and compile professional executive remediation roadmaps.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK**: T1190 (Exploit Public-Facing Application), T1059.006 (Python Scripts).
  - **OWASP API Security**: API1:2023 (BOLA), API2:2023 (Broken Authentication).
  - **HTTP Request Manipulation via Web Proxy**:
    ```http
    GET /api/v2/underwrite/profile?account_id=EMB-88219 HTTP/1.1
    Host: staging-gateway.eko-merchant.sim
    Authorization: Bearer eyJhbGciOi...
    X-Forwarded-For: 10.0.12.45
    ```
  - **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N` (Base Score: 7.5 - High).
- **Existing Apps & Tools**: `WebProxyApp`, `RedTeamApp`, `TerminalApp` (`redteam`), `BountyApp`.
- **Day Case (Authorized)**: Authorized Red Team assessment of target `10.0.12.45` under client charter `ROE-EMB-2026-04`. Validate BOLA finding `VULN-CEDAR-001` exposing customer debt histories.
- **Night Job (Gray-Zone)**: Investigating "QuickKudi"—a rogue digital micro-lending app operating across Lagos Island. Protector decompiles the Android APK via `RevLensApp` and discovers it uses the exact same unauthenticated API endpoint to harvest merchant contacts for automated extortion calls.
- **Characters & Secrets**:
  - *Goodness*: Warns Protector that EMB executives are quietly packaging non-performing loans and selling them at a discount to unregulated debt-recovery syndicates.
  - *Mary*: Investigating suicides among market traders who received automated defamation messages from predatory apps.
- **The Twist**: The BOLA flaw was not an oversight. It was hardcoded into the API by a third-party development agency owned by Krest IR, providing their automated credit-collection crawlers unfettered access.
- **The Choice That Matters**:
  - *Choice A (Immediate Lockdown)*: Submit an emergency Critical finding to EMB, forcing an instant API shutdown that cuts off the predatory app scrapers (alerting Krest IR that their backchannel is compromised).
  - *Choice B (Passive Reconnaissance)*: Maintain the connection silently to trace where Krest IR is routing the exfiltrated loan records before raising the alarm.
- **Faction Movement**: Eko Merchant Bank (+20 on Choice A); Balogun Traders (+25 on Choice A); Krest IR (-30 on Choice A).
- **Debrief**:
  - *ATT&CK Mapping*: T1190, T1059.006.
  - *How Real Teams Do It*: Modern API gateways enforce cryptographically verified object ownership in middleware (e.g., verifying `request.user.id == resource.owner_id`) rather than trusting client-supplied URL parameters.
  - *What to Study Next*: OWASP API Security Top 10; PortSwigger Web Security Academy (Access Control Vulnerabilities).
- **Cliffhanger**: A secure message arrives in `OnionChatApp` from a distorted voice: *"You just locked our tap, Protector. You think you're protecting Broad Street? Look at who pays your consulting retainer."*

---

### Episode 05: `ep05_prompt_injection.sig`
*Phantom Weaver & The Agent Sandbox*

- **Premise**: The Aster incident escalates into an active enterprise contagion. An automated adversary framework ("Phantom Weaver") is executing indirect prompt injection attacks against LLM-powered customer service agents across the Marina financial district.
- **Cybersecurity Pillar(s)**: AI/LLM Security, Purple Team Collaboration, Detection Engineering (Sigma).
- **Learning Objectives**:
  - Analyze OWASP LLM01:2025 (Prompt Injection) and OWASP LLM06 (Excessive Agency).
  - Author and tune Sigma correlation rules to detect malicious tool-calling loops.
  - Execute collaborative Purple Team adversary emulation scenarios to validate detection coverage.
- **Technical Content & Real Artefacts**:
  - **OWASP LLM Top 10**: LLM01 (Prompt Injection), LLM06 (Excessive Agency), LLM08 (Vector Poisoning).
  - **Sigma Detection Rule (`RULE-SEC-009`)**:
    ```yaml
    title: Suspicious LLM Agent Autonomous Command Execution
    status: experimental
    logsource:
      category: process_creation
      product: linux
    detection:
      selection:
        ParentImage|endswith: '/aster-runtime/agent_worker'
        CommandLine|contains:
          - 'curl'
          - 'smbclient'
          - 'vault-core-01'
      condition: selection
    level: critical
    ```
  - **Purple Team Emulation Scenario**: `SCEN-PT-04` (Prompt Injection Vector Traversal).
- **Existing Apps & Tools**: `DefensiveOpsApp` (Detection Studio / Purple Team Studio), `PacketLensApp`, `IncidentApp`.
- **Day Case (Authorized)**: Purple team collaboration with Lead AI Engineer Mercy. Emulate prompt injection attacks against `svc-aster` staging instances; tune detection rules in `RuleTunerApp` to achieve 100% alert coverage with 0% false positives.
- **Night Job (Gray-Zone)**: Tsharp and Protector investigate an open-source GitHub repository associated with "Phantom Weaver". They discover that the framework is poisoning vector embeddings in public customer support documentation across Lagos fintechs.
- **Characters & Secrets**:
  - *Mercy*: Admits that when designing Aster's autonomous tool loop, she omitted schema validation on the outbound SQL/SMB tool parameters because management insisted on "frictionless agent capability."
  - *VP Michael*: Pressuring the security team to sign off on an AI safety compliance certificate ahead of a board audit.
- **The Twist**: The prompt injection payloads were not designed to crash systems. They were tailored queries searching for one specific string: `nexus_probe_v1.sh`—Protector’s old internship script.
- **The Choice That Matters**:
  - *Choice A (Systemic Shield)*: Deploy the tuned Sigma rule across the entire shared Cedarline-EMB pipeline, blocking the contagion but officially exposing Mercy’s architecture to external regulatory scrutiny.
  - *Choice B (Internal Quarantine)*: Deploy the rule exclusively on Cedarline’s private nodes, protecting Mercy from executive termination while leaving partner bank switches vulnerable.
- **Faction Movement**: Cedarline SecOps (+25 on Choice A); CRCII (+30 on Choice A); Mercy (+35 on Choice B, -15 on Choice A).
- **Debrief**:
  - *OWASP LLM Mapping*: LLM01, LLM06.
  - *How Real Teams Do It*: Production agentic AI architectures implement strict deterministic guardrail wrappers (e.g., NeMo Guardrails, Llama Guard), enforce read-only tool permissions, and isolate vector databases from untrusted external user inputs.
  - *What to Study Next*: OWASP Top 10 for Large Language Model Applications; MITRE ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems).
- **Cliffhanger**: A blackout hits Odunlami Street at 23:50. When Protector awakens at 03:20 AM, the apartment door is bolted, a glass of water has been knocked over, and a newly created local folder on the desktop contains the source code for the live Eko Nexus clearing switch.

---

### Episode 06: `ep06_predatory_pipeline.pcap`
*The Big Act: The Marina Corridor Disruption*

- **Premise**: The convergence. The Eko Nexus pipeline is weaponized. Rogue settlement transactions trigger mass point-of-sale failures and automated debt collection auto-debits across Lagos Island.
- **Cybersecurity Pillar(s)**: Threat Intelligence, Financial Protocol Forensics, OSINT & Tor Investigation.
- **Learning Objectives**:
  - Dissect ISO 8583 financial transaction interchange message specifications.
  - Map command-and-control infrastructure using the Diamond Model of Intrusion Analysis.
  - Navigate the authorized vs. unauthorized ethical threshold under catastrophic public impact.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK**: T1565.001 (Data Manipulation - Stored Data Manipulation), T1071.004 (DNS Tunneling), T1584.005 (Rogue DNS Server).
  - **ISO 8583 Financial Message Telemetry**:
    - Processing Code: `0200` (Financial Transaction Request)
    - Field 39 (Response Code): `91` (System Error / Switch Inoperative)
    - Field 48 (Private Data): Encrypted exfiltration token matching Protector's old diagnostic format.
  - **Zeek DNS Traces**: DNS TXT query tunneling carrying base64 encoded transaction batches to `*.transit-nexus.sim`.
- **Existing Apps & Tools**: `PacketLensApp`, `TorBrowserApp`, `SocialPretextApp`, `TerminalApp` (`threatintel`, `netmap`).
- **Day Case (Authorized)**: Emergency crisis response at Cedarline. Broad Street interbank settlement switches are dropping packets. Thousands of POS merchants in Balogun Market cannot clear transactions, while predatory lending apps execute automated auto-debits.
- **Night Job (Gray-Zone)**: Operating out of Mama Esther’s electronics backroom using Tor and Packet Lens. Protector and Tsharp trace the DNS tunneling infrastructure to a command server hosted inside Krest IR’s financial data annex.
- **Characters & Secrets**:
  - *Mama Esther*: In tears; market women are surrounding POS agency kiosks demanding their cash, while small traders are receiving automated bankruptcy threats.
  - *Uncle Segun*: Reminds Protector that thirty years ago, bank crashes were done with ledger pens; today they are done with network packets, but the human despair is identical.
  - *Choker*: Contacts Protector directly: *"We are balancing the ledger for the tier-1 banks, Protector. Bad debts are being reclaimed. Step aside."*
- **The Twist**: The automated predatory clearing script did not use a foreign zero-day. It utilized the exact syntax, port assignments, and diagnostic credentials of `nexus_probe_v1.sh`—the script Protector authored as an unpaid intern.
- **The Choice That Matters (The Authorized vs. Unauthorized Fork)**:
  - *The Authorized Path*: Hand all findings to VP Michael and Krest IR under the promise that executive leadership will resolve it internally. (Result: Barry is arrested as the scapegoat; Krest covers up the fraud; Protector is offered a lucrative permanent contract).
  - *The Unauthorized Path*: Defy corporate authority; partner with 0xLagos, Mama Esther, and *The Lagos Inquirer*; run an unsanctioned out-of-scope exploit to sever the exfiltration pipe and release the transaction ledgers to the press.
- **Faction Movement**:
  - *Authorized Path*: Cedarline (+50 Allied), Krest IR (+50 Allied), Balogun Traders (-80 Hostile), Inquirer (-60 Hostile).
  - *Unauthorized Path*: Balogun Traders (+80 Allied), The Inquirer (+75 Allied), CRCII (+60 Allied), Cedarline (-80 Hostile), Krest IR (-100 Hostile).
- **Debrief**:
  - *ATT&CK Mapping*: T1565.001, T1071.004.
  - *How Real Teams Do It*: Interbank payment networks enforce cryptographic MACs (Message Authentication Codes) and end-to-end HSM (Hardware Security Module) payload encryption on all ISO 8583 fields to prevent transit tampering.
  - *What to Study Next*: PCI-DSS v4.0 Requirement 6 (Develop and Maintain Secure Systems); ISO 8583 Financial Transaction Card Originated Messages.
- **Cliffhanger**: If the authorized path was chosen, police sirens wail as Barry is led out of Marina Tower in handcuffs. If the unauthorized path was chosen, NDSRC federal agents raid Cedarline, and Choker's black SUV pulls up silently outside Protector's apartment.

---

### Episode 07: `ep07_blackout_reconcile.mft`
*Memory Forensics & The Midnight Self-Audit*

- **Premise**: In the wake of the Marina corridor disruption, Protector’s own workstation is mirrored for forensic analysis. Protector must conduct an uncompromising forensic self-audit to determine what really happened during the late-night blackouts.
- **Cybersecurity Pillar(s)**: Digital Forensics & Anti-Forensic Analysis, Memory Forensics.
- **Learning Objectives**:
  - Reconstruct volatile memory dumps using process-tree inspection and thread analysis.
  - Parse Master File Table ($MFT) records and shell artifacts to verify file execution chronologies.
  - Reconcile contradictory personal notes against immutable network and operating system telemetry.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK**: T1070.002 (Clear Linux/Mac History), T1055 (Process Injection), T1070.004 (File Deletion).
  - **Forensic Artefacts**:
    - Memory image: `/evidence/workstation_dump.raw`.
    - Volatility-style `pslist` and `malfind` output revealing an injected process thread inside `systemd-resolved`.
    - `$MFT` record analysis proving that `nexus_probe_v1.sh` was copied to the local workstation via an automated reverse SSH tunnel while the player was unconscious.
  - **Existing Apps & Tools**: `TerminalApp` (`forensics`, `logview`), `DefensiveOpsApp`, `HumanIntelApp`, `FileManagerApp`.
- **Day Case (Authorized)**: Formal forensic cross-examination under NDSRC oversight. Blessing assists Protector in verifying chain-of-custody hashes across all seized server drives.
- **Night Job (Gray-Zone)**: Operating in the apartment on dying inverter battery power. Protector performs deep-dive analysis on their own machine, reconstructing the exact second-by-second timeline of the blackout intervals.
- **Characters & Secrets**:
  - *Blessing*: Confesses she identified Protector’s old internship script days ago; she intentionally delayed the internal incident escalation because she believed in Protector’s integrity and wanted Protector to solve it cleanly.
  - *Daniel (NDSRC)*: Informs Protector that federal charges are being prepared, but a verified, complete forensic disclosure report can secure statutory whistleblower immunity.
- **The Twist (The Blackout Revealed)**: Protector was not an evil double agent or a villain suffering from a split personality. An automated reverse SSH backdoor embedded in Protector's personal dotfiles during their old internship had been compromised by Krest IR's automated infrastructure. Whenever Protector's laptop reconnected to power following a blackout, Krest’s C2 framework utilized Protector's system as an automated proxy pivot! Protector was a victim of their own unmaintained development environment.
- **The Choice That Matters**:
  - *Choice A (Full Unvarnished Disclosure)*: Submit the raw forensic disk image showing both Protector’s past configuration mistakes, Blessing’s delayed reporting, and Krest IR’s active exploitation to the NDSRC tribunal.
  - *Choice B (Selective Redaction)*: Cleanse the evidence image of Protector and Blessing’s personal traces, submitting a sanitized package that pins 100% of the blame strictly on Krest IR and VP Michael.
- **Faction Movement**: Final alignment score calculated across Strict Procedural, Ethical Mentor, Uncompromising Truth, and Pragmatic Commercial.
- **Debrief**:
  - *ATT&CK Mapping*: T1070.002, T1055.
  - *How Real Teams Do It*: Incident responders maintain strict separation between personal and operational environments, using dedicated air-gapped forensic jump-boxes and hardware write-blockers to prevent self-contamination.
  - *What to Study Next*: SANS FOR508 (Advanced Incident Response & Digital Forensics); The Art of Memory Forensics (Ligh et al.).
- **Cliffhanger**: Morning light breaks across Lagos lagoon. A formal summons is delivered to Protector's door: The Joint Regulatory & Executive Tribunal convenes at 09:00 AM at the Federal Secretariat, Marina.

---

### Episode 08: `ep08_root_authority.exit`
*The Grand Tribunal & The Living Seawall*

- **Premise**: The season finale. The grand confrontation before the joint regulatory commission, corporate boards, civic leaders, and the investigative press. Protector must present the certified incident report and decide who controls the digital root of Lagos Island.
- **Cybersecurity Pillar(s)**: Executive Incident Debriefing, Regulatory Compliance Enforcement, Strategic Defense Architecture.
- **Learning Objectives**:
  - Author and defend an executive-level root-cause analysis (RCA) and comprehensive incident report.
  - Align digital forensic evidence with statutory compliance frameworks (NDPR, ISO/IEC 27001, Central Bank guidelines).
  - Architect systemic defense-in-depth controls to prevent enterprise pipeline re-infection.
- **Technical Content & Real Artefacts**:
  - **MITRE ATT&CK Mitigations**: M1047 (Audit), M1026 (Privileged Account Management), M1018 (User Training), M1041 (Execution Prevention).
  - **Final Incident Disclosure Deliverable**:
    - Executive Summary with business impact rating.
    - Verified Attack Chronology with RFC 3161 evidence hashes.
    - Full technical vulnerability matrix (BOLA CWE-639, Prompt Injection CWE-1427, IAM Wildcard CWE-250).
    - Strategic Remediation Roadmap with prioritized mitigation phases.
- **Existing Apps & Tools**: `IncidentApp` (Report Builder & Final Certification), `HumanIntelApp`, `SecurityNewsApp`, `CareerApp`.
- **Day Case & Night Job**: The Day Case is the Grand Tribunal at the Federal Secretariat; the Night Job is the permanent reconfiguration of the Marina corridor network architecture alongside 0xLagos.
- **Characters & Secrets**:
  - All 11 recurring characters assemble in the hearing chambers or await the decision outside:
    - *VP Michael* pleads for corporate continuity and foreign investment survival.
    - *Barry* sits with legal counsel, hoping his life is not destroyed.
    - *Mercy* presents the open-source agent guardrail framework.
    - *Mama Esther* stands with the Balogun merchant delegates demanding restitution.
    - *Mary* holds the front-page galley proof awaiting the final transmission.
    - *Choker* sits in the back row, calmly watching to see if Protector can truly be broken.
- **The Twist**: The root authority cryptographic key for the Eko Nexus pipeline is in Protector’s hands. Whoever receives the certified evidence package gains operational control over the future of financial data clearing in West Africa.
- **The Choice That Matters**:
  - Deliver the keys and certified package to **NDSRC Inspector Daniel** (Regulatory Justice).
  - Deliver the package to **Mary at The Lagos Inquirer** (Public Whistleblowing).
  - Deliver the package to **0xLagos and Mama Esther** (Grassroots Community Sovereignty).
  - Deliver the package to **VP Michael and Eko Merchant Bank** (Corporate Stability & Personal Wealth).
- **Faction Movement**: Drives the game to one of the Four Canonical Endings.
- **Debrief**: Complete Season 1 cybersecurity syllabus review; mapping the entire story arc from Tier-1 SOC log inspection to enterprise security architecture; unlocking post-game sandbox contracts.
- **Cliffhanger**: The radio at the Marina seawall plays an Afrobeats track. Yellow Danfos rumble across the bridge. A terminal notification chimes on Orion OS: Season 2 reconnaissance beacon detected.

---

## 7. The Big Act: The Predatory Pipeline Cascade (Episodes 6 & 7)

### 7.1 What Happens: The Mechanical Strike
In Episode 6, the simmering vulnerabilities exposed across earlier episodes converge into an acute financial infrastructure crisis. 

The threat actors (orchestrated by Krest IR on behalf of a consortium of predatory micro-lending platforms and aggressive debt-factoring intermediaries) weaponize Cedarline's multi-tenant connection to the **Eko Nexus pipeline**. Using the modified parameters of Protector’s legacy `nexus_probe_v1.sh` diagnostic script, they execute an automated batch query across the core banking switch.

### 7.2 The Real Human Impact on Lagos Island
Unlike abstract corporate breaches, this attack directly batters ordinary working citizens across Lagos Island:
1. **The POS Terminal Freeze**: In Balogun Market, CMS Ferry Terminal, and Broad Street sidewalks, over 2,500 mobile POS terminals throw `Error 91: Switch Timeout`. Independent terminal operators—often young women supporting extended families—are left unable to disburse cash or verify customer payments.
2. **Automated Predatory Auto-Debits**: The rogue script triggers batch direct-debit instructions on accounts flagged with outstanding micro-loans from predatory apps ("QuickKudi", "FastNaira"). Traders wake up to find their entire weekly working capital wiped to zero.
3. **Automated Defamation Campaigns**: When accounts show insufficient funds, the lending apps' automated backend APIs scrape contact books and blast defamatory SMS messages to relatives, church members, and business suppliers: *"DEFICIT ALERT: [Trader Name] is a criminal runaway debtor. Pay immediately or police will seize your stall."*
4. **Market Panic & Cash Runs**: Crowds gather outside bank branches on Broad Street demanding physical cash; security guards lock the metal accordion grilles, and street tension spikes.

### 7.3 Moral Cost & Alignment Divergence

The player faces an agonizing trade-off between institutional survival, personal career ambition, and human empathy:

| Investigative Path | Action Taken | Immediate Impact | Real Human Cost |
|---|---|---|---|
| **The Authorized Path** (Corporate Alignment) | Report finding to VP Michael; allow Krest IR to execute a "quiet quarantine" under NDA. | Krest pays Protector a ₦2,500,000 retainer; Michael promotes Protector to Lead Analyst; Cedarline’s foreign acquisition succeeds. | Barry is handed to corporate security as the sole fall guy; market traders receive zero financial restitution; predatory loan syndicates continue operating unhindered. |
| **The Unauthorized Path** (Grassroots / Public Truth) | Breach NDA; join 0xLagos; execute out-of-scope exploit to sever the exfiltration pipe; leak ledgers to *The Inquirer*. | The predatory pipeline is severed; illegal debits are reversed; market women celebrate in Balogun; NDSRC launches federal raids. | Protector's corporate badge is revoked; VP Michael files breach-of-contract lawsuits; Krest IR operatives launch active surveillance; Protector is blacklisted from tier-1 enterprise banking roles. |

---

## 8. Season 1 Endings: The Four Variations

Cyberlife features four distinct, fully substantiated narrative endings determined by the player’s dominant **Narrative Ethics Alignment** and persistent world flags.

```
                              [ The Grand Presentation ]
                                          │
         ┌──────────────────┬─────────────┴─────────────┬──────────────────┐
         ▼                  ▼                           ▼                  ▼
    [ Ending 1 ]       [ Ending 2 ]                [ Ending 3 ]       [ Ending 4 ]
   The Regulatory     The Whistleblower's         The Gray-Zone      The Corporate
     Reformer              Firestorm                Sovereign            Shield
  (Strict Procedural) (Uncompromising Truth)   (Pragmatic Commercial) (Ethical Mentor /
                                                                      Pragmatic Corporate)
```

---

### Ending 1: The Regulatory Reformer
*Alignment: Strict Procedural | Primary Ally: NDSRC (Daniel) | Key Flag: `flag_ndsrc_aligned`*

- **The Resolution**: Protector presents a flawless, legally unassailable cryptographic evidence bundle directly to Chief Inspector Daniel at the NDSRC hearing. 
- **The Fallout**:
  - The NDSRC issues emergency sanctions against Krest IR, revoking their commercial forensic operating license in West Africa.
  - Cedarline Services is spared complete liquidation but placed under mandatory two-year federal operational supervision; VP Michael is removed from executive operations by the board.
  - Barry is completely exonerated of criminal charges and retained under a supervised junior administrative retraining program.
  - Mercy is appointed interim Chief Technology Officer of Cedarline, tasked with building sovereign, open-source AI guardrails.
- **Protector's Fate**: Protector is awarded statutory federal immunity and recruited as a Senior Compliance & Incident Auditor for the NDSRC Critical Infrastructure Defense Unit, earning a stable, honorable civil-service salary and the respect of institutional defenders.

---

### Ending 2: The Whistleblower’s Firestorm
*Alignment: Uncompromising Truth | Primary Ally: The Lagos Inquirer (Mary) & CRCII | Key Flag: `flag_inquirer_aligned`*

- **The Resolution**: Protector bypasses executive and regulatory hierarchies entirely, uploading the complete unredacted transaction ledger and forensic disk images to *The Lagos Inquirer’s* secure drop.
- **The Fallout**:
  - Mary’s front-page banner headline—*"THE SHADOW PIPELINE: How Broad Street Banks and Predatory Tech Scraped Lagos Market Women"*—causes international outrage.
  - Cedarline’s foreign acquisition collapses overnight; executive management faces criminal prosecution for fraud and data concealment.
  - The Central Bank introduces sweeping regulations banning predatory lending apps and mandating strict API consumer protections.
  - Krest IR dissolves its Marina office, and Choker quietly exits the country to consulting posts in Dubai.
- **Protector's Fate**: Protector is terminated from Cedarline and blacklisted by conservative commercial banks, but becomes a legendary folk hero across the Nigerian tech ecosystem. Protector joins the Civic Rights & Cyber Integrity Initiative (CRCII) as Chief Technical Advisor, living modestly in the Island loft, funded by international research grants and community bug bounties.

---

### Ending 3: The Gray-Zone Sovereign
*Alignment: Pragmatic Commercial | Primary Ally: 0xLagos Syndicate (Tsharp) | Key Flag: `flag_0xlagos_aligned`*

- **The Resolution**: Protector plays both sides with cold, pragmatic brilliance. Protector delivers a sterile remediation report to Cedarline to claim the maximum incident response fee, while privately supplying the predatory pipeline exploit hashes to 0xLagos and Mama Esther.
- **The Fallout**:
  - 0xLagos deploys an automated open-source counter-script that continuously neutralizes predatory auto-debits across merchant terminals, while Cedarline quietly patches the BOLA endpoint.
  - Eko Merchant Bank settles customer complaints quietly through informal merchant credits coordinated by Mama Esther.
  - Choker and Protector reach an unspoken truce: Krest acknowledges Protector as a formidable independent operator who cannot be bought, but who will not burn the house down without cause.
- **Protector's Fate**: Protector remains completely independent. Using over ₦5,000,000 in combined bug bounties and corporate consulting fees, Protector buys out the loft apartment lease, installs a state-of-the-art commercial solar power system, and opens an independent vulnerability research consultancy on the Marina waterfront.

---

### Ending 4: The Corporate Shield
*Alignment: Pragmatic Corporate / Procedural Compromise | Primary Ally: Cedarline Management (Michael) | Key Flag: `flag_corporate_aligned`*

- **The Resolution**: Protector accepts VP Michael’s containment strategy. The Aster incident and the Eko Nexus leak are packaged as a "routine external stress-test anomaly" successfully contained by internal SecOps.
- **The Fallout**:
  - Cedarline successfully closes its multi-million dollar international acquisition; VP Michael receives a massive equity bonus.
  - Krest IR signs an exclusive, highly lucrative multi-year retainer to manage Cedarline’s SOC infrastructure.
  - Barry is quietly terminated with a generous non-disclosure settlement, leaving Lagos Island to run a small phone repair stall in Ikeja Computer Village.
  - Predatory lending continues through alternative channels, and the underlying pipeline remains fragile.
- **Protector's Fate**: Protector is promoted to Principal Security Architect at Cedarline, earning a generous six-figure dollar salary, an executive office on Floor 18 overlooking the Marina, and priority access to high-end enterprise hardware. Yet, as the final scene closes, whenever the office lights flicker or a Danfo honks outside on Broad Street, Protector checks the system logs, terrified of the ghosts in the machine.

---

## 9. Cultural Voice, Linguistic Authenticity & Ethical Boundaries

### 9.1 Nigerian English & Linguistic Nuance
The dialogue in Cyberlife reflects the authentic socio-linguistic fabric of contemporary Lagos Island:

- **Executive & Formal Corporate English (Marina Tower & Broad Street)**: Articulate, precise, and polite, punctuated with international enterprise jargon (*"alignment"*, *"exposure"*, *"board review"*, *"regulatory exposure"*, *"contractual indemnity"*).
- **Colloquial Lagos English (Street & Office Commonality)**: Spoken by technical peers like Blessing, Barry, and Tsharp. Natural, rhythmic, and peppered with authentic Nigerian expressions used across professional environments:
  - *"No vex"* (Do not be offended).
  - *"Wahala"* (Trouble/Complication: e.g., *"This wildcard role will cause serious wahala during the audit."*).
  - *"Up NEPA!"* (Universal exclamation when municipal power suddenly restores).
  - *"Oga"* (Senior/Boss: used with varying degrees of respect or irony).
  - *"You dey try"* (Encouraging acknowledgment of hard work).
- **Sparing, Respectful Nigerian Pidgin (Market & Community)**: Used primarily by community figures like Mama Esther and transit drivers. It is treated with literary dignity, never as comic relief or cartoonish caricature:
  - *"My friend, sit down first. Street no dey lie; if market women dey cry, code get problem."*
  - *"No be small thing oh. Dem think say because we dey sell for market, we no know when money miss."*

### 9.2 Strict Ethical Boundaries & Anti-Glorification Policy
Cyberlife strictly adheres to educational and ethical integrity:
- **Zero Glorification of Cybercrime**: The game never romanticizes "Yahoo Yahoo" or financial fraud. Fraudsters are portrayed not as glamorous outlaws, but as predatory actors who exploit vulnerable grandmothers, market vendors, and junior workers. The true hero of the story is the **defensive engineer, the meticulous forensic investigator, and the ethical researcher**.
- **100% Fictional Entities**: All companies (Cedarline, Eko Merchant Bank, Krest IR), factions (0xLagos, CRCII), and government bodies (NDSRC) are original fictional creations. No real-world Nigerian financial institutions, government ministries, or law enforcement divisions are depicted.

---

## 10. Narrative Delivery Mechanics: Diegetic Immersion

Cyberlife replaces traditional video game quest markers, artificial objective compasses, and arcade "HUD checklists" with **immersive, diegetic in-game artifacts**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DIEGETIC NARRATIVE DELIVERY CHANNELS                            │
├──────────────────────┬─────────────────────────────────────────────────────────────────┤
│ Title Cards          │ Monospaced terminal boot sequence: UTC+1 timestamp, SHA-256    │
│                      │ episode hash, and kernel banner introducing the episode.        │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Incident Portal      │ Corporate Cedarline dispatch tickets (`TKT-2026-XXXX`) carrying │
│                      │ official scopes, SLAs, and formal managerial instructions.      │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Onion Chat & Tor     │ Encrypted pings, anonymized research drops, and peer chatter    │
│                      │ with 0xLagos researchers and underground brokers.               │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Hacker Call Overlay  │ Urgent voice dialogue pop-ups from Blessing, Choker, or Goodness│
│                      │ interrupting the desktop with high-priority spoken updates.     │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ File System Drops    │ Real files appearing in `~/.vault/`, `/tmp/`, or `/evidence/`   │
│                      │ (raw PCAPs, disk images, carved logs, executive memos).         │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Encrypted Journal    │ `~/.vault/journal.enc`: Protector's internal monologue, providing │
│                      │ emotional perspective, humor, and provocative forensic puzzles. │
├──────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Blackout Beats       │ Screen brownout, 1kHz inverter alarm, lost-time clock skip, and │
│                      │ unprompted system mutations forcing forensic self-audits.       │
└──────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 11. System Mapping & Missing Artefacts Audit Matrix

This matrix maps every narrative beat and technical workflow in Season 1 against the existing codebase (`src/simulation/...` and `src/presentation/...`), explicitly auditing current support and identifying required technical deliverables.

| Episode & Beat | Existing Systems & Components | Active Apps & Commands | Missing Systems, Data Schemas & Simulated Artefacts |
|---|---|---|---|
| **Ep 01: Aster Triage** | `SimulationEngine.ts`<br>`CyberToolRegistry.ts`<br>`NetworkTopology.ts` | `PacketLensApp`<br>`IncidentApp`<br>`logview`, `netmap`, `svcscan` | • Synthetic SMB2 `Tree Connect` packet capture stream inside `PacketLensApp`.<br>• CEF formatted alert ingest records for `mon-siem-01`.<br>• Blackout screen brownout shader overlay. |
| **Ep 02: Wildcard Audit** | `humanIntel/`<br>`careerDefinitions.ts`<br>`M21HumanIntelAdapter.ts` | `HumanIntelApp`<br>`IncidentApp`<br>`humint`, `policy` | • Interactive JSON IAM Policy Editor / Visualizer tab in `DefensiveOpsApp`.<br>• Room 4B physical badge reader access log data structure. |
| **Ep 03: Curbside Beacon** | `forensicsCommand.ts`<br>`EvidenceVault.ts`<br>`RevLensApp.tsx` | `TerminalApp` (`forensics`)<br>`RevLensApp`<br>`PacketLensApp` | • Simulated raw disk image generator (`/evidence/marina_exfil_usb.dd`).<br>• $MFT record parser simulating timestomping ($STANDARD_INFO vs $FILE_NAME).<br>• 120-second jitter TLS beacon generator in Packet Lens. |
| **Ep 04: BOLA PenTest** | `WebProxyEngine.ts`<br>`RedTeamApp.tsx`<br>`BountyApp.tsx` | `WebProxyApp`<br>`RedTeamApp`<br>`redteam` | • Authored EMB staging banking API target definition (`10.0.12.45`) in Red Team inventory.<br>• Simulated BOLA response payload exposing executive debt accounts.<br>• CVSS v3.1 vector calculator modal. |
| **Ep 05: Prompt Injection** | `DetectionEngine.ts`<br>`RuleTunerApp.tsx`<br>`PurpleTeamStudio.tsx` | `DefensiveOpsApp`<br>`RuleTunerApp`<br>`purpleteam` | • Authored Sigma rule `RULE-SEC-009` (LLM Tool Calling anomaly) in `DetectionEngine`.<br>• LLM tool-calling prompt injection payload dataset.<br>• Purple team emulation scenario `SCEN-PT-04` integration. |
| **Ep 06: The Big Act** | `ActivityDirectorEngine.ts`<br>`OnionChatApp.tsx`<br>`TorBrowserApp.tsx` | `PacketLensApp`<br>`TorBrowserApp`<br>`threatintel` | • ISO 8583 financial message parser / dissector in `PacketLensApp`.<br>• Predatory micro-lending app decompile artifacts in `RevLensApp`.<br>• Branching logic gate in `narrativeValidator.ts` for Authorized vs Unauthorized fork. |
| **Ep 07: Lost Time Audit** | `forensicsCommand.ts`<br>`SaveManager.ts`<br>`ActivityCatalogue.ts` | `TerminalApp`<br>`DefensiveOpsApp`<br>`FileManagerApp` | • Workstation volatile memory dump parser (`volatility`-style `pslist` / `malfind` traces).<br>• Reverse SSH tunnel artifacts injected into `~/.bash_history` and `/var/log/auth.log`.<br>• Dedicated Encrypted Journal reader app / CLI (`journal` / `JournalApp.tsx`). |
| **Ep 08: Root Authority** | `IncidentApp.tsx`<br>`HumanIntelApp.tsx`<br>`CareerSystem.ts` | `IncidentApp`<br>`CareerApp`<br>`report`, `certify` | • Grand Tribunal multi-party testimonial dialogue graph.<br>• Final 4-variation epilogue screen overlay with persistent alignment scoring.<br>• Official certificate of completion deliverable export. |

---

## 12. Conclusion & Golden Rule for Engineering Integration

Season 1 of Cyberlife transforms technical education into high-stakes narrative drama. Every terminal command executed by the player carries weight: it changes a character’s life, shifts the balance of power between institutions, and uncovers another piece of the Eko Nexus mystery.

By maintaining strict technical authenticity, respecting the living reality of Lagos Island, and utilizing the protagonist's fallibility to teach the supremacy of verifiable evidence over subjective assumption, Cyberlife establishes an uncompromised standard for serious cybersecurity gaming.
