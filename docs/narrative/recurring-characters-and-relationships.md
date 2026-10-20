# Cyberlife — Recurring Characters & Interpersonal Dynamics

## 1. The Core Cast Overview

Cyberlife features an interconnected ensemble cast rooted in the social fabric of Lagos Island. Characters have distinct jobs, personal anxieties, financial stakes, and bounded fields of perception. They do not act as omniscient quest dispensers; their dialogue and willingness to assist evolve based on the player’s proven reliability, ethical choices, and investigative evidence.

```
                  [ Femi Martins ] (VP Operations)
                   ▲            ▲
     Direct Report │            │ Commercial Pressure
                   │            ▼
   [ Marcus Adebayo ] ◄──► [ Dr. Elena Chen ]
         │ (Panic)               │ (AI Ethics)
         │                       │
         ▼                       ▼
   [ Temitope Blessing ] ◄─ Mentor ─► [ Player (Tade) ] ◄── Mutual Respect ──► [ Tunde Bakare ]
   (Lead SOC Analyst)                       ▲                                 (0xLagos Researcher)
                                            │ Professional Referrals                   │
                                            ▼                                          ▼
                                   [ Folake Davies ]                         [ Kemi Adeyemi ]
                                   (Talent Liaison)                         (Investigative Press)
                                            │                                          │
                   ┌────────────────────────┴────────────────────────┐                 ▼
                   ▼                                                 ▼       [ Babatunde Lawal ]
           [ Mama Nkechi ]                                    [ Uncle Segun ]     (NDSRC Regulator)
       (Balogun Trade Leader)                              (Tinubu Civic Elder)
```

---

## 2. Character Profiles & Behavioral Contracts

---

### 2.1 Temitope Blessing ("Amina")
- **Stable ID**: `npc_amina`
- **Role**: Lead Security Analyst, Cedarline Services Ltd.
- **Affiliation**: Cedarline Services (SOC Team)
- **Primary Venue**: Cedarline SOC Console, Floor 14, Marina Tower.
- **Background & Motivations**:
  - Over a decade defending West African banking and logistics backbones. Calm, exacting, and fiercely dedicated to mentoring the next generation of analysts.
  - Motivated by procedural discipline, forensic rigor, and preventing real-world harm.
- **Public Persona vs. Private Concerns**:
  - *Public*: The unflappable rock of the SOC; demands strict adherence to chain of custody and incident response phases.
  - *Private*: Deeply worried that executive shortcuts and political infighting are compromising the team's defensive integrity; feels protective of Marcus despite his mistakes.
- **Knowledge Boundaries**:
  - *Knows*: Exact telemetry timestamps, SIEM alert thresholds, incident lifecycle protocols, evidence hashing rules.
  - *Believes*: Marcus made an honest, pressured error, but svc-aster's over-scoping must be formally contained.
  - *Cannot Know*: The full content of executive board meetings or external broker transactions between Femi Martins and Krest IR.
- **Story Progression**:
  - If player behaves procedurally: Promotes player to official incident lead; writes glowing professional evaluations.
  - If player uncovers executive cover-up: Reaches an agonizing moral crossroads—defend Cedarline's corporate survival or stand with the truth.

---

### 2.2 Marcus Adebayo
- **Stable ID**: `npc_marcus`
- **Role**: Junior Infrastructure Administrator, Cedarline Services Ltd.
- **Affiliation**: Cedarline Infrastructure Operations
- **Primary Venue**: Server Rack Room, Cedarline Interior (takes nervous phone calls outside Broad Street).
- **Background & Motivations**:
  - Second-year systems administrator supporting his extended family in Ebute Metta. Terrified of losing his livelihood.
- **Public Persona vs. Private Concerns**:
  - *Public*: Busy, hurried technician checking patch cables and server cooling.
  - *Private*: Consumed by acute panic. He assigned `corporate-admin` to `svc-aster` under direct executive threat, failed to roll it back, and now realizes he is being positioned as the sole scapegoat.
- **Knowledge Boundaries**:
  - *Knows*: Exact root credentials, how the wildcard role was assigned, executive orders received via chat, internal server IP schemes.
  - *Believes*: He will be blacklisted across the Nigerian tech industry if the incident report names him personally.
  - *Cannot Know*: Deep AI prompt injection mechanics or how the external support ticket was constructed.
- **Relationship Dynamics**:
  - *If Protected*: Becomes a lifelong ally; secretly shares internal network architecture maps and warns player of upcoming executive moves.
  - *If Exposed/Scapegoated*: Terminated from Cedarline; distrusts player completely; retreats to informal IT repairs in Balogun Market.

---

### 2.3 Dr. Elena Chen
- **Stable ID**: `npc_elena`
- **Role**: Lead AI Engineer & Architect, Cedarline Services Ltd.
- **Affiliation**: Applied Machine Learning Division
- **Primary Venue**: Engineering Lab, Marina Tower; evening walks along Marina Seawall.
- **Background & Motivations**:
  - Former academic researcher who designed Aster's autonomous tool-calling loop and retrieval-augmented generation (RAG) context engine.
  - Passionate about the transformative potential of agentic AI, but fiercely protective of mathematical rigor and safety boundaries.
- **Public Persona vs. Private Concerns**:
  - *Public*: Razor-sharp, analytical, intellectually commanding.
  - *Private*: Tormented by the realization that her agent architecture was weaponized; frustrated that management treated prompt safety as a secondary cosmetic feature.
- **Knowledge Boundaries**:
  - *Knows*: Model weights, vector database indices, system prompt structure, tokenizer boundaries, tool schema definitions.
  - *Believes*: The prompt injection was crafted by someone who possessed her private API architecture documents.
  - *Cannot Know*: Real-time network firewall logs or physical access badge logs.

---

### 2.4 Femi Martins
- **Stable ID**: `npc_femi`
- **Role**: VP of Technology & Operations, Cedarline Services Ltd.
- **Affiliation**: Executive Management
- **Primary Venue**: Executive Suite, Floor 18; Marina Tower Lobby.
- **Background & Motivations**:
  - Seasoned executive driving Cedarline towards a landmark international acquisition. Numbers-focused, politically astute, under enormous pressure from European and Asian private equity partners.
- **Public Persona vs. Private Concerns**:
  - *Public*: Visionary tech leader championing African technological innovation on international stages.
  - *Private*: Terrified that a public breach notification will trigger contractual clawback clauses and collapse the acquisition.
- **Knowledge Boundaries**:
  - *Knows*: Board resolutions, acquisition timelines, vendor contract penalties, Krest IR consulting retainer scope.
  - *Believes*: Cybersecurity is an enterprise risk management game of managing liability and PR perception, not an academic pursuit of absolute truth.
  - *Cannot Know*: Low-level Linux command syntax, Wireshark packet details, or terminal tool outputs.
- **Player Dynamics**:
  - If player delivers a discreet, contained resolution: Rewards player with high-paying consulting retainers and executive endorsements.
  - If player leaks findings or whistleblows: Becomes a formidable adversary, threatening breach of contract and legal action.

---

### 2.5 Mama Nkechi
- **Stable ID**: `npc_nkechi`
- **Role**: Chairwoman & Merchant Matriarch, Balogun Traders Electronic Union
- **Primary Venue**: Central Electronics Stall, Balogun Market.
- **Background & Motivations**:
  - Has run Balogun electronics stalls for over 25 years. Protective of young market apprentices and deeply knowledgeable about the human pulse of Lagos commerce.
- **Public Persona vs. Private Concerns**:
  - *Public*: Energetic, sharp-tongued, warm trader negotiating prices with flair in Nigerian Pidgin.
  - *Private*: Deeply angry that local market traders are losing their life savings to sophisticated POS banking fraud while big banks ignore their complaints.
- **Knowledge Boundaries**:
  - *Knows*: Every courier, technician, and suspicious character passing through Balogun; counterfeit hardware origins; street-level cash flows.
  - *Believes*: Big corporate tech firms look down on market traders until their systems crash and they need cheap hardware parts.
  - *Cannot Know*: Internal enterprise network architectures or cryptographic algorithms.
- **Services Provided**:
  - Hardware components, USB adapters, mobile burner devices; street intelligence; alibis and safe storage.

---

### 2.6 Uncle Segun
- **Stable ID**: `npc_segun`
- **Role**: Community Elder & Historian, Tinubu Square Civic Association
- **Primary Venue**: Tinubu Square Monument Gardens.
- **Background & Motivations**:
  - Retired civil servant from the Federal Ministry of Communications. Spends his retirement reading newspapers and observing the endless cycle of Lagos history.
- **Personality & Role**:
  - Philosophical, gentle, resonant. Serves as the player’s moral compass, offering historical perspective when corporate pressures threaten to compromise ethical clarity.
- **Dialogue Function**:
  - Reminds player that institutions come and go, but personal reputation and human integrity endure across generations.

---

### 2.7 Folake Davies
- **Stable ID**: `npc_folake`
- **Role**: Senior Technology Talent Liaison, Eko Tech Partners
- **Primary Venue**: Broad Street Sidewalk Café / Co-working Lounge.
- **Background & Motivations**:
  - High-energy recruiter connecting top-tier technical specialists with African fintechs and multinational security operations.
- **Dialogue & Services**:
  - Offers active contract listings, career advancement opportunities, and industry intelligence on salary benchmarks and skill requirements.

---

### 2.8 Tunde "ZeroDay" Bakare
- **Stable ID**: `npc_tunde`
- **Role**: Independent Security Researcher & Bounty Hunter, 0xLagos Syndicate
- **Primary Venue**: Marina Seawall Promenade (leaning against railings with laptop).
- **Background & Motivations**:
  - Prodigious white-hat researcher who refuses to work inside a corporate cubicle. Fiercely independent and proud of finding zero-days before syndicates exploit them.
- **Knowledge & Collaboration**:
  - Understands cutting-edge attack vectors; provides alternative threat intelligence and bug bounty submission paths outside official corporate channels.

---

### 2.9 Kemi Adeyemi (Narrative Arc 2/3 Extension)
- **Stable ID**: `npc_kemi`
- **Role**: Chief Investigative Editor, *The Lagos Inquirer*
- **Primary Venue**: Heritage Building Newsroom, Tinubu Square.
- **Narrative Role**: The courageous journalist who evaluates player-provided forensic evidence. Demands cryptographic proof and corroborated records before publishing investigative exposés.

---

### 2.10 Babatunde Lawal (Narrative Arc 2/3 Extension)
- **Stable ID**: `npc_babatunde`
- **Role**: Chief Compliance Inspector, NDSRC
- **Primary Venue**: Federal Secretariat Offices, Marina.
- **Narrative Role**: The rigorous public-sector regulator who can legally subpoena enterprise logs and enforce statutory protections for whistleblowers if presented with verified proof.
