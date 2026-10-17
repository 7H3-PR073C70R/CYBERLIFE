# Contributing to Cyberlife

Thank you for contributing to **Cyberlife**, a browser-based 3D cybersecurity life RPG built with Three.js, TypeScript, and React.

To maintain architectural integrity, simulation safety, and sustainable incremental development, all contributors must adhere to the principles, boundaries, and workflows documented below.

---

## 1. Core Principles & Governance

### 1.1 Non-Negotiable Simulation Safety Boundary
- **Zero Real-World Execution**: Cyberlife is an educational and entertainment simulation. The virtual terminal, network tools, packet analyzers, and exploit engines must **never** execute host operating system commands, scan real network interfaces, connect to external domains, or access live credentials.
- **Purely Synthetic Targets**: All IP addresses, domains, certificates, logs, files, organizations, and identities exist strictly within the in-memory or persisted game simulation state.
- Any pull request attempting to bridge in-game terminal input to the host system or external networks will be immediately rejected and flagged as a security violation.

### 1.2 The Milestone Gate Rule
Development in Cyberlife follows strict sequential milestone gating (see [MILESTONES.md](file:///Users/protector/Documents/projects/cyberlife/docs/MILESTONES.md)):
- A milestone must satisfy **100% of its Acceptance Criteria and Definition of Done** before implementation begins on subsequent milestones.
- Feature creep, out-of-milestone prototyping in main branches, and premature abstraction are strictly prohibited.

### 1.3 Architectural Invariants (Clean Architecture)
- **Dependency Flow**: Source code dependencies must point **strictly inward**:
  `Presentation / Rendering` ➔ `Application Orchestration` ➔ `Domain & Simulation Engine`.
- **Headless Testability**: The simulation engine (`src/simulation`) and domain models (`src/domain`) must be 100% testable in a pure Node.js / headless environment without importing WebGL, Three.js, DOM elements, or React hooks.
- **Rendering vs. Authority**:
  - Three.js (`src/presentation/world`) is responsible **only** for rendering visual meshes, animations, and camera transformations. It owns zero authoritative gameplay state.
  - React components (`src/presentation/hud`, `desktop`, `dialogue`) display read-only state projections and dispatch user commands. They must never independently compute mission logic, economy transactions, or permission resolutions.

---

## 2. Development Workflow

### 2.1 Branching Strategy
- `main`: Production-ready, milestone-validated releases only.
- `milestone/m<N>-<name>`: Milestone integration branches (e.g., `milestone/m1-bootable-foundation`).
- `feature/<ticket-or-scope>`: Focused feature branches cut from the active milestone branch.
- `fix/<ticket-or-scope>`: Bug fixes for regressions or test failures.

### 2.2 Commit Conventions
We use the **Conventional Commits** specification (`<type>(<scope>): <short description>`):

- `feat(sim)`: New simulation engine capability or rule.
- `feat(presentation)`: New UI component, HUD overlay, or visual asset loader.
- `feat(mission)`: New mission content definition or objective tracker.
- `fix(cyber)`: Fix to a simulated terminal command or permission check.
- `test(domain)`: Unit or integration test addition.
- `docs(...)`: Documentation or architectural decision update.
- `refactor(...)`: Code change that neither fixes a bug nor adds a feature.
- `chore(...)`: Tooling, build pipeline, or linting updates.

*Example:* `feat(sim-cyber): implement synthetic ARP table lookup for local subnet`

---

## 3. Code Standards & Review Checklist

Before opening a pull request or requesting review, verify each of the following:

### Architectural Compliance
- [ ] No framework or UI imports in `src/domain` or `src/simulation`.
- [ ] No Three.js objects (`Scene`, `Mesh`, `Camera`) instantiated inside simulation logic.
- [ ] All gameplay state changes occur via validated `Command` dispatch yielding deterministic `DomainEvent` objects.
- [ ] Simulation state transitions are idempotent where required (e.g., mission reward delivery, evidence indexing).

### Security & Safety
- [ ] No hardcoded credentials, secret keys, or test tokens in code.
- [ ] In-game terminal parsing strictly checks commands against an allow-list of synthetic virtual tools.
- [ ] Input strings from simulated user input are sanitized and validated with runtime schemas (e.g., Zod) before ingestion.

### Quality & Testing
- [ ] Unit tests written for all new domain entities, value objects, and simulation rules.
- [ ] Strict TypeScript compilation passes with zero errors (`noImplicitAny`, `strictNullChecks`).
- [ ] Automated linter passes cleanly with zero warnings or errors.
- [ ] Deterministic test fixtures used; no reliance on wall-clock time or unseeded `Math.random()`.

---

## 4. Documentation Guidelines
- When adding or changing an architectural pattern, submit an **Architectural Decision Record (ADR)** in `docs/decisions/` using the standard format: Title, Status, Context, Decision, Consequences.
- Document all new simulated cyber tools and commands in [SIMULATION_RULES.md](file:///Users/protector/Documents/projects/cyberlife/docs/SIMULATION_RULES.md).
- Keep [MILESTONES.md](file:///Users/protector/Documents/projects/cyberlife/docs/MILESTONES.md) and [ACCEPTANCE_CRITERIA.md](file:///Users/protector/Documents/projects/cyberlife/docs/ACCEPTANCE_CRITERIA.md) updated as milestones are completed.

---

## 5. Getting Help & Discussing Architecture
- Review [DEVELOPMENT_GUIDE.md](file:///Users/protector/Documents/projects/cyberlife/docs/DEVELOPMENT_GUIDE.md) for architectural diagrams, step-by-step implementation tutorials, and common debugging tips.
- For high-level philosophical alignment, consult [VISION.md](file:///Users/protector/Documents/projects/cyberlife/docs/VISION.md).
