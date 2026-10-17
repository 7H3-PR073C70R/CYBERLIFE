# ADR-001: Strict Virtual Sandbox Isolation for Cybersecurity Tools and Command Execution

- **Status**: Accepted
- **Date**: 2026-10-17
- **Deciders**: Lead Software Architect & Core Engineering Team

---

## Context

Cyberlife simulates in-depth cybersecurity operations, including terminal command-line workflows, network reconnaissance, authentication audits, log analysis, and vulnerability remediation. 

In many technical games or educational software, naive implementations attempt to bridge virtual terminal inputs to host processes (e.g. running local shell commands via WebSockets or local daemons) or attempt to perform live network requests against external targets. In a browser-based application, this presents severe risks:
1. **Host Security Vulnerability**: Any bridge to host processes or uncontained evaluation opens the player's operating system to arbitrary code execution, command injection, and browser sandbox escapes.
2. **Legal & Ethical Risks**: Performing live network scans or probe requests against external networks or IP addresses violates acceptable use policies and cybersecurity laws.
3. **Flaky & Non-Deterministic Gameplay**: Relying on live external networks or third-party APIs introduces latency, offline unplayability, and non-reproducible bugs.

---

## Decision

We decide that **all cybersecurity activity takes place strictly inside a fictional, game-defined simulation**:

1. **Synthetic Shell & Command Parser**:
   - The in-game terminal does not execute host OS commands or pass inputs to any operating system shell (`bash`, `sh`, `zsh`, `cmd.exe`).
   - Terminal input is parsed by a custom abstract syntax tree (AST) parser in `src/simulation/cyber/terminal/` and matched against an allow-list of synthetic virtual tools (`nmap`, `curl`, `grep`, `cat`, `ssh`, `siem-query`, etc.).
2. **Synthetic Network & IAM Stack**:
   - All network graphs, subnets (RFC 1918), IP routing tables, DNS resolvers, and IAM roles exist strictly as in-memory and persisted TypeScript data models.
   - The virtual terminal and simulated applications query only this virtual network graph.
3. **Synthetic AI Agent Evaluation**:
   - The simulated AI agent ("Aster") operates within a deterministic mock execution harness with modeled tool calling. It does not invoke live third-party LLM APIs during standard gameplay.

---

## Consequences

### Positive
- **Guaranteed Safety**: Zero risk of compromising the player's host system, files, or network.
- **100% Offline Capability**: The game runs fully self-contained in any standard modern desktop web browser without external server backends.
- **Deterministic Headless Testing**: All tools, commands, and scenarios can be verified in fast automated unit and integration tests without network mocks.
- **Pedagogical Purity**: Focuses player learning on transferable conceptual reasoning (least privilege, threat modeling, evidence hashing) rather than ephemeral tool-specific quirks.

### Negative / Trade-offs
- **Content Authoring Overhead**: Every simulated host, network record, log line, and tool output must be explicitly defined in content fixtures.
- **Tool Scope Limitation**: Only virtual tools implemented in the simulation registry are available to the player; arbitrary arbitrary shell scripts cannot be run unless explicitly simulated.
