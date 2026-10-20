# Cyberlife — Factions & Organizations Guide

## 1. Faction Architecture & Standing System

In Cyberlife, organizations are not monolithic good-or-evil entities. Each faction contains competing internal factions, personal ambitions, economic constraints, and varying levels of technical competence.

### 1.1 Faction Standing Spectrum

Standing with each organization is tracked on a continuous scale from **-100 to +100**, mapped to five qualitative reputation bands:

| Standing Range | Reputation Band | Operational Impact |
|---|---|---|
| **-100 to -50** | **Hostile** | Denied physical access to facilities; barred from corporate contracts; security guards question or detain player; active counter-investigations launched. |
| **-49 to -15** | **Distrusted** | Heavy surveillance; cold interpersonal interactions; access restricted to public areas; higher consulting bond requirements. |
| **-14 to +14** | **Neutral** | Standard commercial access; public job board listings available; strictly professional interactions. |
| **+15 to +49** | **Favored** | Priority incident response contracts; access to private lounges and internal subnets; discounted technical services and training. |
| **+50 to +100** | **Allied** | Executive consulting retainers; unrestricted physical clearance; sensitive internal intelligence sharing; exclusive specialized hardware. |

---

## 2. Comprehensive Faction Profiles

```
  [ Cedarline Services ] ◄────── Conflict: Incident Liability ──────► [ Eko Merchant Bank ]
            │                                                                  │
            ├──────── Contracted Cover-up ───────► [ Krest Incident Response ] │
            │                                                                  │
  Conflict: Transparency                                              Regulatory Scrutiny
            ▼                                                                  ▼
  [ The Lagos Inquirer ] ◄── Mutual Defense ──► [ CRCII ] ◄────► [ NDSRC Regulatory Comm. ]
            ▲                                                        │
            │               Community Intel                          │
  [ 0xLagos Syndicate ] ◄──────────────────────► [ Balogun Traders Union ]
```

---

### 2.1 Cedarline Services Ltd.
*Enterprise Cloud Infrastructure & Logistics Platforms*
- **Headquarters**: Floors 14–18, Cedarline Marina Tower, Marina Waterfront.
- **Leadership**: Femi Martins (VP of Technology & Operations); Board chaired by offshore logistics investors.
- **Public Image**: West Africa’s premier enterprise cloud provider, celebrated for modernizing port logistics and supply chain analytics.
- **Operational Capabilities**: Multi-tenant Kubernetes clusters, high-throughput cloud storage, enterprise SIEM and telemetry pipelines, automated customer agent loops ("Aster").
- **Internal Disagreements**:
  - *Engineering vs. Management*: Lead AI Engineer Dr. Elena Chen and Lead Analyst Amina (Temitope Blessing) insist on rigorous security controls and ethical least-privilege policies. VP Femi Martins is driven by contractual SLA penalties, board reviews, and acquisition deadlines.
- **Incentives & Vulnerabilities**: Under intense pressure to finalize a major international acquisition. A confirmed data breach or regulatory fine could collapse the transaction.
- **What It Conceals**: The fact that executive management knowingly authorized emergency deployment shortcuts, overriding security reviews.
- **Player Opportunities**:
  - Internal SOC analyst roles; incident response bounties; workstation upgrades; high-paying enterprise contracts.

---

### 2.2 Eko Merchant Bank (EMB)
*Tier-1 Commercial & Investment Banking Group*
- **Headquarters**: Eko Merchant Plaza, 45 Broad Street.
- **Leadership**: Chief Risk Officer Oladipo Cole; Managing Director Funke Sanusi.
- **Public Image**: The bedrock of Nigerian commercial banking, conservative, rock-solid, and impeccably audited.
- **Operational Capabilities**: Core banking mainframes, interbank payment clearing gateways, air-gapped SWIFT terminals, strict biometric and physical security turnstiles.
- **Internal Disagreements**:
  - *Old Guard vs. Modernizers*: Veteran risk officers distrust automated AI pipelines and cloud integrations; younger fintech product managers push for open-banking APIs and rapid clearing with Cedarline.
- **What It Conceals**: Significant exposure to unhedged logistics credit lines and anomalous cross-tenant data queries leaked through Cedarline’s shared pipeline.
- **Player Opportunities**:
  - High-clearance Blue Team audits; authorized penetration testing of web banking portals (`webproxy` BOLA testing); financial consulting retainers.

---

### 2.3 Krest Incident Response & Data Solutions
*Elite Private Cybersecurity & Digital Forensics MSSP*
- **Headquarters**: Broad Street Financial Annex, Marina.
- **Leadership**: Chidi Okonkwo (Managing Director of Incident Response).
- **Public Image**: The gold standard in high-end cybersecurity consulting—discreet, formidable, and internationally certified.
- **Operational Capabilities**: Deep-packet forensic carving, commercial threat intelligence feeds, high-priced legal defense consulting, rapid incident containment teams.
- **Culture & Vulnerabilities**: Ruthlessly pragmatic. Krest views incidents as commercial opportunities to sell expensive multi-year retainer contracts. Their loyalty is to executive management, not to truth or junior staff.
- **What It Conceals**: Routine use of aggressive non-disclosure agreements (NDAs) and selective evidence retention to sanitize client reputations before regulatory audits.
- **Player Opportunities**:
  - Specialized forensic investigations; advanced tool access; lucrative corporate contractor rates—at the cost of potential ethical compromises.

---

### 2.4 0xLagos Research Syndicate & Bug Bounty Network
*Decentralized White-Hat Collective & Vulnerability Researchers*
- **Gathering Venues**: Marina Seawall Promenade; local tech incubator lofts; encrypted forums.
- **Leadership**: Informal consensus; prominent voices include Tunde "ZeroDay" Bakare and cryptographic researcher "NaijaCipher".
- **Public Image**: Seen by corporate executives as mischievous troublemakers; viewed by young developers as folk heroes defending the open internet.
- **Operational Capabilities**: Novel zero-day research, prompt injection fuzzing, reverse engineering, community threat intelligence sharing.
- **Internal Disagreements**:
  - *Responsible Disclosure vs. Full Public Drops*: Tunde advocates for verified responsible disclosure with reasonable bounty deadlines; radical members want immediate public dumps to humiliate negligent corporations.
- **Player Opportunities**:
  - Unofficial bug bounty payouts; custom open-source security tool scripts; independent reconnaissance intelligence; alternative investigation leads when corporate access is blocked.

---

### 2.5 The Lagos Inquirer (The Wire & Watchdog)
*Independent Investigative Journalism Bureau*
- **Office Location**: 2nd Floor, Heritage Building, Tinubu Square.
- **Leadership**: Kemi Adeyemi (Chief Investigative Editor).
- **Public Image**: Respected, fearless print and digital news organization with a history of exposing grand corruption and corporate misconduct.
- **Operational Capabilities**: Deep network of public and private sources, secure whistleblower dropboxes, public records litigation, wide media distribution reach.
- **Vulnerabilities**: Under constant threat of defamation lawsuits, political pressure, and targeted digital surveillance by state and corporate actors.
- **Player Opportunities**:
  - Whistleblower bounty compensation; public exposure of corrupt executives; reputational immunity against corporate defamation; media protection for vulnerable NPCs like Marcus.

---

### 2.6 Civic Rights & Cyber Integrity Initiative (CRCII)
*Digital Rights, Consumer Privacy & Algorithmic Accountability NGO*
- **Office Location**: Civic Chambers, Tinubu Square.
- **Leadership**: Barrister Zainab Al-Hassan (Executive Director).
- **Public Image**: Principled civil society champions advocating for data privacy legislation, tenant protection, and digital rights for ordinary citizens.
- **Operational Capabilities**: Public-interest legal defense, algorithmic impact audits, consumer fraud legal clinics, policy advocacy with the legislature.
- **Incentives & Vulnerabilities**: Modest funding, reliant on donor grants; often out-resourced by corporate legal teams, yet possessing immense moral authority and legal standing.
- **Player Opportunities**:
  - Public-interest forensic audits; legal defense against corporate intimidation; assistance with regulatory complaints; community solidarity.

---

### 2.7 Balogun Traders Electronic Union
*Merchant Cooperative & Informal Electronics Trade Network*
- **Territory**: Balogun Market Central Arcade, Broad Street Outer Perimeter.
- **Leadership**: Mama Nkechi (Chairwoman & Trade Matriarch).
- **Public Image**: The bustling heart of Lagos retail commerce; hundreds of small business owners selling phones, laptops, adapters, and consumer goods.
- **Operational Capabilities**: Massive informal human surveillance network across Lagos Island; component-level hardware repair skills; grey-market supply lines; rapid grassroots word-of-mouth.
- **Vulnerabilities**: Targeted daily by sophisticated SMS phishing syndicates, counterfeit mobile POS firmware, and predatory micro-lending apps.
- **Player Opportunities**:
  - Discounted computer hardware components and mobile devices; physical intelligence on suspicious visitors and courier drops; community goodwill; safe-house access.

---

### 2.8 National Digital Security Regulatory Commission (NDSRC)
*Statutory Cybersecurity & Critical Infrastructure Authority*
- **Headquarters**: Federal Secretariat Complex, Marina.
- **Leadership**: Babatunde Lawal (Chief Compliance Inspector).
- **Public Image**: Official government regulatory commission tasked with enforcing national cybersecurity standards and investigating major breaches.
- **Operational Capabilities**: Legal subpoena authority, statutory audit power, ability to levy enterprise compliance fines and suspend operating licenses.
- **Internal Disagreements**:
  - *Dedicated Inspectors vs. Political Appointees*: Technical investigators like Babatunde Lawal are eager to enforce real security; politically connected commissioners are reluctant to antagonize powerful bank executives.
- **Player Opportunities**:
  - Official state-sanctioned expert witness appointments; certified compliance auditor credentials; immunity for authorized penetration testing; legal leverage against abusive employers.
