# Cyberlife — Project Vision & Game Design Philosophy

## 1. Executive Summary

**Cyberlife** is a browser-based, single-player 3D cybersecurity life RPG built on Three.js, TypeScript, and React. 

Set in a vibrant, dense, walkable urban neighborhood, Cyberlife merges three distinct genres into a seamless whole:
1. **The Tactical Depth of Hacker Simulator**: In-depth, authentic command-line interfaces, virtual workstations, synthetic networks, log analysis, vulnerability investigation, and incident response.
2. **The Exploration and Atmosphere of an Open-World Adventure**: A compact, hand-crafted neighborhood explorable in first-person or third-person, populated with physical buildings, apartments, cafes, server closets, and observant NPCs.
3. **The Life & Progression Simulation of The Sims**: Career trajectory, personal finances, apartment customization, physical fatigue, interpersonal relationships, reputation, and ethical dilemmas.

The player lives as an independent cybersecurity specialist operating in an era where modern autonomous AI agents, enterprise LLM workflows, and interconnected cloud APIs have transformed the threat landscape.

---

## 2. Core Creative Inspirations

### 2.1 Desktop-Driven Cybersecurity (Hacker Simulator)
Cybersecurity in popular culture is often misrepresented as 3D visual mazes or frantic mini-games. Cyberlife embraces realistic desktop ergonomics:
- Dual-mode computing: a full-screen, high-fidelity virtual desktop workstation and quick-access handheld mobile HUDs.
- Synthetically simulated Unix-like terminal environment with standard utilities (`grep`, `curl`, `nmap`, `ssh`, `cat`, `chmod`, `diff`).
- Authentic incident triage: parsing SIEM logs, inspecting JSON payloads, validating cryptographic hashes, verifying access control lists (ACLs), and reconstructing attack timelines.

### 2.2 Urban Exploration & Physical Infiltration (GTA Style)
Cybersecurity does not exist in a vacuum separated from the physical world:
- The player traverses a dense, atmospheric city block featuring residential lofts, corporate satellite offices, public Wi-Fi hotspots, electronics scrap shops, and community hangouts.
- Physical reconnaissance: identifying building security cameras, social engineering access badges from employees taking smoke breaks, dumpster diving for discarded credential notes, and plugging rogue dropboxes into unsecured wall jacks.
- Seamless transitions between physical foot navigation and digital keyboard work.

### 2.3 Personal Life, Housing, & Routine (The Sims)
Technical skills are balanced against the human realities of survival and career:
- Rent, energy, hydration, stress, and sleep cycles directly influence investigative focus and error rates.
- Earning bounties and consulting fees enables hardware upgrades (faster multi-monitor setups, hardware decryptors, portable SDR transceivers) and apartment improvements.
- Social networks: building trust with local shop owners, fellow researchers, enterprise sysadmins, and underground informants unlocks new tip-offs, missions, and alibis.

### 2.4 Modern AI-Era Threat Landscape
Unlike legacy hacking games focused solely on 1990s buffer overflows or port scans, Cyberlife is designed for the contemporary and emerging threat environment:
- Simulated autonomous AI agents operating with excessive permissions.
- Indirect prompt injection attacks embedded inside customer support tickets, resume uploads, and database records.
- Retrieval-Augmented Generation (RAG) context poisoning and vector database manipulation.
- Autonomous agent hallucination exploitation, tool-calling hijacking, and API token exfiltration.
- Supply chain tampering with synthetic machine learning model weights and public packages.

---

## 3. Educational & Conceptual Philosophy

Cyberlife is designed as an educational tool that imparts **transferable cybersecurity reasoning**:

- **Reasoning Over Exploitation**: The game teaches *how* security systems fail and how defenders verify truth—threat modeling, principle of least privilege, defense-in-depth, immutable audit trails, and root-cause remediation.
- **No Weaponized Payloads**: The game never contains or teaches functional, weaponized real-world malware code, 0-day exploits, or destructive hacking recipes. It teaches diagnostic logic, protocol behavior, and defensive validation.
- **Forensic Accuracy**: Players formulate hypotheses, collect and preserve evidence using cryptographic hashes, isolate compromised infrastructure, and author structured incident response reports.

---

## 4. The Non-Negotiable Simulation Boundary

Cyberlife maintains an ironclad, non-negotiable security boundary:

> **All cybersecurity activity takes place inside a fictional, game-defined simulation.**
>
> 1. The in-game virtual terminal **never** evaluates, bridges, or executes host operating-system commands.
> 2. The game **never** makes real network requests to external servers, IP addresses, or ports for gameplay purposes.
> 3. The game **never** accesses real user accounts, credentials, or private files.
> 4. All network topologies, DNS domains (`*.cedarline.internal`, `*.sim.net`), servers, routing tables, user databases, and AI agents exist exclusively as deterministic in-memory and persisted TypeScript data structures.

This architectural principle protects the user's host environment, eliminates browser sandbox security risks, and ensures 100% deterministic, offline-capable gameplay.

---

## 5. The First Playable Experience: The Aster Incident

The initial vertical slice centers on **The Aster Incident** at fictional company **Cedarline Services**:

```
[Physical World]
Neighborhood Cafe ──▶ Talk to Cedarline Sysadmin (Marcus) ──▶ Receive Suspicious Alert Tip-off
                                                                      │
                                                                      ▼
[Virtual Desktop]
Workstation Terminal ◀── Access Cedarline Internal Logs (VPN) ◀── Login with Temp Credentials
        │
        ├── 1. Triage: Inspect SIEM alerts; identify abnormal token consumption by agent "Aster".
        ├── 2. Investigate: Parse agent execution logs; discover indirect prompt injection via support form.
        ├── 3. Trace Privileges: Analyze IAM role; discover Aster was erroneously granted `AdminS3Write`.
        ├── 4. Containment: Revoke compromised API token; isolate customer data store.
        ├── 5. Remediation: Reconfigure agent system prompt guards; enforce strict least-privilege IAM policies.
        ├── 6. Validation: Run automated synthetic incident verification checks.
        └── 7. Reporting: Author and submit incident report; receive payout and reputation increase.
                                                                      │
                                                                      ▼
[Personal Life]
Apartment ──▶ Pay overdue rent, purchase workstation RAM upgrade, rest to restore stamina.
```

---

## 6. Technical Foundations & Product Configuration

- **Target Platform**: Desktop web browsers (Chrome, Edge, Firefox, Safari) with modern WebGL2 support. Keyboard and mouse optimized.
- **Graphics Engine**: Three.js rendering a low-poly stylized or realistic-ambient 3D environment with dynamic lighting, shadows, and interior/exterior spatial partitioning.
- **UI Architecture**: React-based HUD, dialogue overlays, window manager, and desktop applications composited over or alongside the WebGL canvas.
- **Core State Engine**: Headless, authoritative, deterministic TypeScript simulation engine decoupled from rendering.
- **Persistence**: Versioned, schema-validated local browser storage using IndexedDB.
- **Zero Cloud Runtime Dependency**: Fully playable standalone offline without requiring external AI APIs or cloud game servers.
