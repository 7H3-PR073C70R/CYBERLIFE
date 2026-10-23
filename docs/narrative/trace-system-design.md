# Trace, Legal Exposure & Defender View Architecture Design

## 1. Executive Summary & Core Philosophy
The **Trace & Legal Exposure System** models the operational realities of dual-life cybersecurity operations in Lagos Island:
1. **Simulation Layer Ownership**: All noise calculations, meters, OPSEC modifiers, scope checks, decay timers, and defender reactions are **deterministic, pure-domain, saved, and replayable**. The presentation layer purely subscribes and renders.
2. **Never a Hard Game-Over**: Breaching trace or legal exposure thresholds never results in an arcade "Mission Failed" screen. Instead, it triggers **deterministic simulated defender countermeasures** (rate limits, honeypots, SOC alerts, IP blocks) and **long-term narrative consequences** (lost evidence admissibility, faction standing shifts, surveillance beats, subpoenas).
3. **Purple-Team Pedagogical Value**: Every offensive action teaches real blue-team detection mechanics. The **Defender View Debrief** exposes the exact logs generated (Sysmon, CEF, Suricata, Nginx, iptables), explaining why a defender spotted the action and how a practitioner minimizes operational noise.

---

## 2. Data-Driven Noise Model
Player actions that interact with simulated targets emit an authoritative `ActionNoiseEvent`. The noise table is centrally defined in data (`src/simulation/cyber/trace/noiseCatalog.ts`):

| Action Type | Category | Base Noise (0-100) | Defended Target Multiplier | Log Artifact Format | ATT&CK Technique | Real-World Detection Reason | OPSEC Reduction Strategy |
|---|---|---|---|---|---|---|---|
| **Passive WHOIS / DNS lookup** | `OSINT_PASSIVE` | 2 | 1.0x | Authoritative DNS query log | T1596 | Queries public resolvers, leaving zero telemetry on target host. | Use encrypted DoH / proxy resolvers. |
| **Passive Certificate Transparency** | `OSINT_PASSIVE` | 3 | 1.0x | Public CT Log API query | T1596.003 | Query hits public CT aggregators (Censys/crt.sh), not target gateway. | No target contact; zero target log footprint. |
| **Target Subdomain Resolution** | `OSINT_DNS` | 8 | 1.2x | External DNS recursion logs | T1590.002 | Low volume, but burst queries can trigger split-horizon DNS alerts. | Throttle query rate and randomize subdomains. |
| **Low-Rate Stealthed Port Scan** | `RECON_ACTIVE` | 20 | 1.5x | Firewall SYN dropped table | T1046 | Low PPS (Packets Per Second) evades basic IDS rate thresholds. | Randomize port order; delay packets (>5s inter-probe). |
| **Aggressive Port Scan (`-T4`/`-A`)** | `RECON_ACTIVE` | 65 | 2.0x | Suricata `ET SCAN Potential Nmap` | T1046 | Massive burst of SYN packets across 1,000 ports trips anomaly detection. | Scope to specific ports; use slow timing templates. |
| **Web Service Inspection (`svcscan`)** | `ENUMERATION` | 25 | 1.3x | Web server HTTP 200/404 logs | T1046 / T1595 | Leaves User-Agent and structured request fingerprints in HTTP access logs. | Anonymize User-Agent header; limit probe depth. |
| **Directory Fuzzing / Brute-force** | `ENUMERATION` | 70 | 1.8x | Web 404 flood (`mod_security`) | T1595.002 | Hundreds of non-existent resource requests trigger WAF IP reputation bans. | Targeted wordlists; respect rate-limits; use passive sitemaps. |
| **Credential Stuffing / Password Spray** | `EXPLOITATION` | 80 | 2.2x | Windows Event ID 4625 (Logon Fail) | T1110.003 | Sudden cluster of failed authentication attempts from a single origin. | Spray at or below account lockout thresholds; rotate egress IPs. |
| **Authenticated Read (Business Hours)** | `AUTHORIZED_ACCESS`| 5 | 1.0x | Active Directory Event ID 4624 | T1078 | Matches normal employee baseline activity in SOC user behavioral analytics. | Operate during normal local business hours (09:00 - 17:00). |
| **Authenticated Read (After Hours)** | `UNAUTHORIZED_ACCESS`| 35 | 1.6x | SIEM Anomaly `Off-Hours Access` | T1078 | Off-hours access triggers UBA (User Behavior Analytics) severity elevation. | Pre-schedule tasks or mimic batch backup maintenance windows. |
| **Bulk File / DB Exfiltration** | `EXFILTRATION` | 85 | 2.5x | Zeek `conn.log` high egress bytes | T1048 | Anomaly in egress byte ratio trips network flow threshold rules. | Throttle throughput; segment data into micro-chunks; use Tor. |

---

## 3. The Two-Meter System

### 3.1 Trace Meter (0-100, Short-Term, Operational)
- **Scope**: Active within a single engagement or night job.
- **Rises**: When actions are performed against defended targets (`BaseNoise * SensitivityMultiplier`).
- **Decays**: Automatically over simulation time at **1.0 point per 45 simulation seconds** when idle.
- **OPSEC Reductions**:
  - `Tor Routing Active`: -35% noise multiplier.
  - `Off-Hours Evasion`: -15% if operating when local SOC analyst monitoring is thinned.
  - `Log Cleanup / Artefact Wiping`: -20 point flat reduction when completing forensic hygiene.
- **Deterministic Threshold Responses**:
  - `Trace >= 25`: **Target Rate-Limiting** (HTTP 429 Too Many Requests; tool execution delays).
  - `Trace >= 50`: **SOC Alert / Honeypot Exposure** (Target spawns synthetic trap credentials; SIEM alert generated).
  - `Trace >= 75`: **Dynamic IP Block** (Target firewall drops packets; direct access severed without Tor/VPN pivot).
  - `Trace >= 90`: **Lockout & Incident Escalation** (Target terminates session; SecOps begins perimeter sweep).

### 3.2 Legal Exposure Meter (0-100, Long-Term, Cross-Episode Narrative)
- **Scope**: Persists across all episodes in `SimulationState.trace.legalExposureMeter`.
- **Rises**:
  - Out-of-scope actions without authorization (+15 to +30 pts).
  - Unsanctioned exploitation on night jobs (+10 to +25 pts).
  - Leaving unencrypted exfiltration artifacts in public directories (+10 pts).
- **Falls**:
  - Submitting signed, truthful vulnerability disclosures to NDSRC/CRCII (-10 to -20 pts).
  - Securing formal client authorization or incident response mandates (-15 pts).
  - Cooperative reporting during day triage (-10 pts).
- **Narrative Milestones**:
  - `Legal Exposure >= 40`: **Blessing's Warning** (Blessing warns Protector off-the-record about federal log sweeps).
  - `Legal Exposure >= 65`: **Choker Surveillance** (Krest IR surveillance vehicle spotted near Broad Street apartment; encrypted threat note in Onion Chat).
  - `Legal Exposure >= 85`: **NDSRC Subpoena Beat** (Inspector Daniel opens a formal statutory inquiry; high risk to Day Job standing).
- **Endings Alignment**: Feeds flags for **The Gray-Zone Sovereign** (`flag_0xlagos_aligned`), **The Corporate Shield** (`flag_corporate_aligned`), and **The Whistleblower's Firestorm** (`flag_inquirer_aligned`).

---

## 4. Scope & Rules of Engagement (RoE) Enforcement
During day jobs, formal authorization lists allowed hosts, ports, and methods:
1. Attempting an action on an unlisted target triggers an in-world **Scope Warning Modal / CLI Prompt**:
   > `[!] ROE BOUNDARY WARNING: Target '10.0.12.99' is NOT in your authorized scope.`
   > `Proceeding will violate Cedarline contract SLA and increase Legal Exposure.`
   > `[ ABORT ]  /  [ PROCEED (RECORD VIOLATION) ]`
2. **Evidence Integrity**: Any evidence collected while out-of-scope is tagged as `tainted: true`. Tainted evidence is barred from formal corporate incident reports and admissible tribunal submission, forcing alternative remediation routes.

---

## 5. UI Integration & Diegetic Immersion
1. **Workstation Top Panel**:
   - Compact status indicator: `TRACE: 24% [LOW]` and `LEGAL: 18% [CLEAR]`.
   - Hidden during benign routine desktop work; illuminates with subtle amber/red neon when night jobs begin or noise occurs.
2. **Diegetic Immersion (Immersive Mode)**:
   - When Trace > 50, ambient workstation audio incorporates accelerated CPU fan whine and subtle terminal warning tickers (`[WARN] Remote sensor syn-flood detected`).
   - Terminal prints system telemetry notices (`NOTICE: Target 10.0.4.15 TCP RST received`).
   - Supports `reduceMotion` (replaces pulse animations with solid color fills).

---

## 6. Defender View Debrief ("What the Blue Team Saw")
At the conclusion of a night job (or via terminal command `trace debrief`), the game presents an authentic Purple-Team timeline:
- **Timestamped Action**: Every scan, request, or exploit.
- **Synthetic Log Line**: Verbatim log entry in CEF, Sysmon Event ID 1/3, Suricata EVE JSON, or Nginx format.
- **Verdict**: `DETECTED` (logged & alerted), `SUSPICIOUS` (logged but below alert threshold), or `MISSED` (below noise floor).
- **ATT&CK Reference**: Technique ID, Name, and Tactic.
- **Purple-Team Lesson**: Explains what SIEM / EDR rule detected it and how real red teams or penetration testers lower noise.

---

## 7. Episode 01 Implementation: External Scan on `app-portal-01`
- **Context**: Tsharp's Onion Chat warning about offshore scans on `app-portal-01:8080`.
- **Quiet Path**: Passive OSINT lookup via DNS/CT records (`trace <= 5`).
- **Loud Path**: Direct aggressive scan or unauthorized `svcscan` against external perimeter without Tor (`trace +45` to `+70`), triggering target rate limiting and defender response alert.
