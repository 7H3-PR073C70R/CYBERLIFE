# Cyberlife — Central Mystery & Branching Story Arcs

## 1. The Central Mystery: The Eko Nexus Pipeline & The Marina Corridor Disruption

At the center of Cyberlife lies an original techno-thriller mystery: **The Eko Nexus Pipeline Breach**.

While the player enters the story through a localized incident—the **Aster Incident** at Cedarline Services Ltd.—they quickly discover that Aster's prompt injection is merely the visible tremor of a much larger, systemic crisis threatening the digital infrastructure of Lagos Island.

---

### 1.1 The Initiating Incident

On the morning of **Monday, October 12, 2026 at 07:42 AM**, an anomalous security event triggered an internal SOC alert at Cedarline Services Ltd. (`app-portal-01` attempting unauthorized SMB read operations against departmental file server `filesrv-01`). The query was executed by `svc-aster`, the service account running Cedarline’s newly deployed autonomous customer support and knowledge assistant.

However, forensic deep-packet inspection and correlated SIEM timestamps reveal that this was not a simple misconfiguration query:
1. Seconds before the SMB query on `filesrv-01`, an incoming customer support ticket originating from an external IP contained an **indirect prompt injection payload**.
2. When the Aster language model processed the ticket, the prompt instructed Aster to query the confidential corporate payroll share (`payroll_q3_confidential.xlsx`) and simultaneously attempt an outbound sync to an external staging destination: `vault-core-01.transit.internal`.
3. `vault-core-01` is not owned by Cedarline—it is a secure clearing gateway belonging to **The Eko Nexus**, a multi-tenant interbank data pipeline connecting Cedarline, **Eko Merchant Bank**, and maritime freight logistics at the Port of Lagos.

---

### 1.2 What the Public Believes Happened

- **The Public Headline**: "Minor Telecom Glitch Disrupts Morning Commercial Banking Across Broad Street."
- **Media Reporting**: Mainstream news outlets report that an offshore subsea fiber cable maintenance window caused temporary latency and transient POS transaction failures throughout Lagos Island commercial districts.
- **Street Sentiment**: Small traders in Balogun Market and commuters at CMS Ferry Terminal assume it is the usual municipal utility incompetence or routine telecom downtime.

---

### 1.3 What the Involved Organizations Claim

| Organization | Official Claim | Private Reality & Concealment |
|---|---|---|
| **Cedarline Services Ltd.** | "A routine automated test script authored by our infrastructure team encountered an unhandled exception during scheduled maintenance. No customer data was compromised." | Executive management (VP Femi Martins) rushed Aster’s release to impress international acquisition auditors, ignoring lead AI engineer Dr. Elena Chen's security warnings. They assigned junior admin Marcus Adebayo the blame. |
| **Eko Merchant Bank** | "Eko Merchant Bank systems remain fully resilient, air-gapped, and unaffected by third-party vendor fluctuations." | Senior risk officers detected anomalous cross-tenant queries from Cedarline hitting their credit staging tables. Terrified of regulatory sanctions from NDSRC, they hired Krest Incident Response to secretly purge interconnect logs. |
| **Krest Incident Response** | "Krest is performing independent third-party validation under standard commercial confidentiality." | Krest is actively orchestrating a narrative containment strategy: quarantining forensic evidence, silencing internal whistleblowers, and offering Marcus a financial settlement to sign an NDA accepting full responsibility. |
| **0xLagos Research Syndicate** | "Cedarline’s cloud infrastructure was wide open. An automated botnet or rival syndicate is probing the entire Marina financial corridor." | Independent researchers (led by Tunde 'ZeroDay' Bakare) noticed the anomaly independently through public DNS reconnaissance and bug bounty telemetry, but lack internal credentials to prove the root cause. |

---

### 1.4 Known Evidence, Contradictions, and Misleading Interpretations

- **The Red Herring**: Marcus Adebayo assigned `corporate-admin` with wildcard `['*']` scopes to `svc-aster`. Management claims Marcus is an incompetent or rogue insider who created the vulnerability.
- **The Contradiction**: Marcus only assigned the wildcard permissions because the staging API tokens provided by the overseas AI vendor kept failing during deployment testing. He was explicitly told by executive leadership: *"Make it work before the board meeting, or your contract will not be renewed."*
- **The Forensic Truth**: The prompt injection was not an accident. The payload contained exact knowledge of Cedarline’s internal host naming convention (`filesrv-01`) and the exact filename `payroll_q3_confidential.xlsx`. Someone with internal architecture documentation constructed the payload.

---

## 2. Multiple Plausible Explanations (The Four Investigative Theories)

The player’s investigation is structured around four competing hypotheses, each supported by real, discoverable in-game evidence:

```
                            [ The Eko Nexus Anomaly ]
                                        │
         ┌──────────────────┬───────────┴───────────┬──────────────────┐
         ▼                  ▼                       ▼                  ▼
    [ Theory A ]       [ Theory B ]            [ Theory C ]       [ Theory D ]
  Corporate Rush      Targeted Cyber         Rogue Autonomous       Whistleblower
   & Scapegoating       Espionage            Agent Contagion         Deadman Drop
```

1. **Theory A: The Corporate Cover-Up (Management Negligence & Scapegoating)**
   - *Premise*: Cedarline executives intentionally bypassed mandatory security gates to secure a multimillion-dollar foreign acquisition. When the breach occurred, they fabricated a narrative pinning total fault on Marcus.
   - *Key Evidence*: Executive emails showing signed release overrides; audit trail deletion requests sent to Krest IR; Marcus's original ticketing logs.

2. **Theory B: Targeted Financial Espionage (The Eko Merchant Bank Intercept)**
   - *Premise*: A rival financial consortium commissioned a targeted attack using prompt injection to extract executive compensation and credit underwriting algorithms via Cedarline’s shared pipeline.
   - *Key Evidence*: Network PCAP analysis showing anomalous payload routing from offshore IP addresses; encrypted staging records found in `vault-core-01`.

3. **Theory C: Rogue Autonomous Agent Contagion (Phantom Weaver)**
   - *Premise*: A recurring, self-propagating prompt injection framework ("Phantom Weaver") designed to exploit autonomous agent tool-calling loops is spreading across interconnected West African enterprise APIs.
   - *Key Evidence*: Identical prompt signatures detected in logs at Eko Merchant Bank and Balogun POS processing systems; Dr. Elena Chen’s vector embedding logs.

4. **Theory D: The Internal Whistleblower's Forced Audit**
   - *Premise*: A conscientious insider inside Cedarline or EMB deliberately triggered the alert by feeding the prompt injection to Aster, knowing it would force a mandatory external SOC audit and expose systemic cloud data leaks before customer funds were stolen.
   - *Key Evidence*: Curbside removable media dropped near Broad Street containing cryptographic keys and internal warning memos; anonymous tips received by *The Lagos Inquirer*.

The game does not force one arbitrary conclusion upon the player. The player's investigative depth, evidence preservation rigor, and interview decisions determine which theory they substantiate and who they present their findings to.

---

## 3. Major Story Arcs & Chapter Progression

Cyberlife’s narrative is organized into three overarching Story Arcs, subdivided into structured Chapters:

### Arc 1: The Aster Anomaly (The Local Breach)
*Focus: Mastering triage, forensic analysis, credential remediation, and interpersonal ethics within Cedarline.*
- **Chapter 1: Triage on Broad Street**
  - Briefing with Lead Analyst Amina (Temitope Blessing).
  - Network discovery with `netmap` and service inspection with `svcscan`.
  - Auditing SIEM logs for `svc-aster` anomalies.
- **Chapter 2: The Infrastructure Dilemma**
  - Confronting Marcus Adebayo: Uncovering the panic behind the wildcard role.
  - Consulting Dr. Elena Chen: Understanding prompt injection and tool-calling boundaries.
  - Decision Point: Collaborate with Marcus to secretly fix credentials, or formally cite him in executive reports?
- **Chapter 3: Containment & Remediation**
  - Safe evidence preservation in the Incident Portal (`EVD-2026-001` through `EVD-2026-004`).
  - Executing service containment and applying least-privilege IAM policies (`kb-assistant`).
  - Running automated verification suites and submitting the certified incident report.

### Arc 2: The Eko Nexus Pipeline (The Broad Street Convergence)
*Focus: Broadening the investigation beyond Cedarline into interbank data pipelines, physical security, and street-level intelligence.*
- **Chapter 4: The Curbside Beacon**
  - Investigating a dropped USB drive found at the Broad Street Danfo stop.
  - Air-gapped forensic lab analysis: safe artifact carving without connecting to the production network.
  - Tracing physical access logs at Marina Tower (discovering visitor tailgating at Level 4).
- **Chapter 5: Whispers in Balogun Market**
  - Assisting Mama Nkechi with fraudulent POS terminal firmware analysis.
  - Discovering correlations between retail banking SMS fraud and the Eko Nexus pipeline.
  - Meeting Tunde 'ZeroDay' Bakare on the Marina seawall to correlate external threat intelligence.
- **Chapter 6: The Interbank Infiltration**
  - Gaining authorized access to Eko Merchant Bank staging environment.
  - Using Web Application Proxy (`webproxy`) to detect BOLA/IDOR vulnerabilities leaking executive credit profiles.
  - Uncovering Krest IR’s clandestine log sanitization campaign.

### Arc 3: Shadows Over Marina Tower (The Resolution & Fallout)
*Focus: High-stakes confrontation, regulatory exposure, and determining the fate of the involved organizations.*
- **Chapter 7: The Whistleblower’s Ledger**
  - Gathering final cryptographic evidence proving whether the breach was corporate negligence, espionage, or a forced whistleblower audit.
  - Meeting Senior Investigative Journalist Kemi Adeyemi at Tinubu Square or NDSRC Inspector Babatunde Lawal.
- **Chapter 8: The Grand Presentation**
  - Submitting formal findings to the chosen authority (Executive Management, Public Press, Regulatory Commission, or Darkweb/Bounty Network).
  - Facing the consequences: Faction standings shift dramatically, careers evolve, and the economic landscape of Lagos Island reflects the player’s agency.

---

## 4. Multi-Role Investigative Paths & Alternative Advances

Players are never trapped by a single character class or skill tree. The narrative supports alternative avenues of advancement across all four cybersecurity roles:

```
                  ┌──────────────────────────────────────────────┐
                  │          The Investigation Challenge          │
                  │   (e.g., Uncovering Eko Nexus Pipeline Leak)   │
                  └──────────────────────┬───────────────────────┘
                                         │
     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
     ▼                   ▼                               ▼                   ▼
 [ Blue Team ]     [ Purple Team ]                 [ Red Team ]        [ Independent ]
 Audit SIEM logs    Emulate prompt injection        Map unauthorized    Interview street
 & access records   & author Sigma detection rules  lateral network     contacts & claim
 to prove data path  to expose telemetry gaps       paths under RoE     bounty disclosures
```

### Alternative Advancement Paths
If a player lacks a specific skill or tool, the narrative provides contextual recovery routes:
- **Lacking Advanced Terminal Tool Clearance**: Speak with Uncle Segun or Mama Nkechi to obtain physical access leads, or consult Folake Davies to take on smaller IT support jobs to earn required credentials.
- **Damaged Relationship with Corporate Leadership (VP Femi)**: Advance through independent channels via Tunde Bakare and *The Lagos Inquirer*, bypassing corporate approval entirely.
- **Failed Social Pretexting Encounter**: If an interlocutor raises suspicion and terminates a call, the player can acquire physical access badges through authorized vendor verification or request help from lead analyst Amina.
