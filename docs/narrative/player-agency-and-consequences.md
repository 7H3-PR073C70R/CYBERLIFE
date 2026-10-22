# Cyberlife — Player Agency, Ethics & Consequence Architecture

## 1. Multi-Dimensional Player Agency

Cyberlife rejects simplistic binary morality ("good vs. evil" karma meters). In the high-stakes world of West African enterprise cybersecurity, every meaningful choice involves competing legitimate priorities, material trade-offs, and unforeseen second-order consequences.

```
                                [ Player Decisions ]
                                         │
        ┌───────────────────┬────────────┴────────────┬───────────────────┐
        ▼                   ▼                         ▼                   ▼
 [ Faction Standing ] [ Interpersonal Trust ] [ Evidence Integrity ] [ Career & Financial ]
  Access to subnets,   NPC willingness to      Courtroom / audit      Bounties, rent,
  contracts & venues   share secrets & alibis  admissibility score     hardware upgrades
```

---

## 2. The Four Narrative Ethics Alignments

Rather than forcing the player into an artificial class, Cyberlife tracks how the player operates through four distinct professional philosophies:

```
                  [ Strict Procedural ] ◄──────► [ Uncompromising Truth ]
                   (Chain of Custody,              (Public Whistleblowing,
                    Corporate Rules)                Full Transparency)
                           ▲                               ▲
                           │                               │
                           ▼                               ▼
                  [ Ethical Mentor ]   ◄──────► [ Pragmatic Commercial ]
                   (Protecting Vulnerable         (Client Risk Management,
                    Junior Colleagues)             Bounties & Continuity)
```

1. **Strict Procedural (The Compliance Specialist)**:
   - Adheres strictly to the corporate incident response handbook, authorization scopes, and management hierarchy.
   - *Advantage*: High trust with senior leadership (VP Michael) and regulatory bodies (NDSRC); avoids legal liability.
   - *Cost*: Vulnerable junior employees (Barry) may be sacrificed to protect corporate continuity.

2. **Ethical Mentor (The Defender of People)**:
   - Prioritizes protecting human beings from being crushed by corporate scapegoating.
   - *Advantage*: Lifelong loyalty from operational colleagues (Barry, Blessing, Mercy); unlocks grassroots alibis and insider technical tips.
   - *Cost*: Risk of executive reprimand or termination for failing to report procedural infractions immediately.

3. **Uncompromising Truth (The Whistleblower & Investigative Crusader)**:
   - Insists on full unvarnished public disclosure when systemic fraud, data tampering, or safety risks are uncovered.
   - *Advantage*: Allied status with *The Lagos Inquirer*, CRCII, and independent researchers; shifts public policy.
   - *Cost*: Corporate blacklisting; high legal exposure; loss of lucrative enterprise consulting retainers.

4. **Pragmatic Commercial (The Independent Bounty Hunter & Fixer)**:
   - Balances client risk, bounty payouts, and personal financial survival in an expensive city.
   - *Advantage*: Maximizes income (paying apartment rent, purchasing high-end forensic workstation hardware, hiring specialized assistance).
   - *Cost*: Viewed with suspicion by both strict corporate officers and ideological activists.

---

## 3. Evidence Integrity & Investigative Confidence

In Cyberlife, truth is not established by a single dialogue choice. It requires **evidence synthesis**:

```
 [ Raw Findings ] ──▶ [ Evidence Preservation ] ──▶ [ Corroboration ] ──▶ [ Formal Conclusion ]
 (Logs, PCAPs,         (Cryptographic Hashing,       (Correlating multi-    (Structured Report
  ACL configs)          Forensic Isolation)           party testimony)       with confidence score)
```

- **Raw Findings**: Volatile logs, active network connections, terminal outputs.
- **Evidence Preservation**: Computing deterministic SHA-256 hashes and packaging artifacts inside the Incident Portal before remediation alters system state.
- **Corroboration Matrix**: Connecting digital telemetry (e.g. `svc-aster` SMB read on `filesrv-01`) to human factors (Barry’s panicked configuration) and organizational context (executive deployment rush).
- **Investigative Confidence Score (0–100%)**: Based on evidence completeness. Presenting an assessment with low confidence (<60%) risks professional embarrassment and dismissal by stakeholders.

---

## 4. Consequence Matrices & World State Persistence

Player actions permanently modify world flags, altering NPC behaviors, available contracts, and physical access across Lagos Island:

| Player Choice | Immediate Result | Faction Impact | Long-Term Narrative Consequence |
|---|---|---|---|
| **Protect Barry** | Barry quietly remediates `svc-aster` IAM policy to `kb-assistant`; no formal infraction filed. | **Cedarline**: Neutral<br>**Barry**: +30 (Allied) | Barry stays employed; provides backdoor access to Cedarline staging subnets in Arc 2. |
| **Formally Cite Barry in Report** | Barry is named as sole root cause; VP Michael terminates Barry’s contract. | **Cedarline**: +25 (Favored)<br>**Barry**: -60 (Hostile) | Barry is evicted; refuses to speak to player; later resurfaces working for gray-hat brokers. |
| **Discreet Enterprise Containment** | Issue remediated quietly; VP Michael presents clean audit to acquisition partners. | **Cedarline**: +40 (Allied)<br>**Inquirer**: -20 (Distrusted) | Unlocks high-paying corporate retainers (₦500,000+); hides the Eko Nexus pipeline vulnerability. |
| **Whistleblow to The Lagos Inquirer** | Hand over preserved forensic evidence package to journalist Mary. | **The Inquirer**: +50 (Allied)<br>**Cedarline**: -80 (Hostile) | Front-page headline triggers NDSRC emergency audit; Cedarline terminates player’s access; player must operate out of independent lofts. |
| **Claim Bug Bounty on 0xLagos** | Disclose indirect prompt injection vector through independent vulnerability forum. | **0xLagos**: +40 (Allied)<br>**Cedarline**: -30 (Distrusted) | Instant bounty payout (₦300,000 cash); Tsharp shares zero-day analysis scripts; VP Michael demands an explanation. |

---

## 5. Failure Philosophy & Recovery Paths

**Failure in Cyberlife changes the story—it never abruptly ends it.**

When a player makes a mistake, triggers a security alarm, damages a relationship, or submits an incomplete report:

1. **The Investigation Reroutes**:
   - If the player is locked out of Cedarline corporate servers, the investigation shifts to physical reconnaissance, street-level merchant intelligence in Balogun Market, or independent PCAP analysis with Tsharp.
2. **Rebuilding Burnt Bridges**:
   - An estranged NPC (e.g. VP Michael) can be re-approached by successfully completing an emergency Blue Team triage ticket or obtaining an introduction through recruiter Goodness.
3. **Financial Pressures as Narrative Drivers**:
   - If the player loses a corporate contract, monthly rent and workstation electricity bills force them to take on informal IT support gigs, electronics repair for Mama Esther, or competitive bug bounties.
4. **Learning from Diagnostic Errors**:
   - Submitting an incorrect root-cause assessment prompts constructive, in-character feedback from Lead Analyst Blessing rather than a generic "Game Over" screen, reinforcing real-world analytical reasoning.
