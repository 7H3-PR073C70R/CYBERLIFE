# Cybersecurity Simulation Subsystem (`src/simulation/cyber/`)

The core cyber investigation engine.

## Subsystems
- `network/`: Synthetic network graphs, RFC 1918 subnets, routers, DNS tables, virtual hosts, open ports, and synthetic firewall ACLs.
- `iam/`: Synthetic users, roles, service accounts, API tokens, and access policy evaluation.
- `siem/`: Synthetic security information and event logs, log generator, cryptographic SHA-256 hash generator.
- `ai_agent/`: Simulated autonomous AI agent ("Aster"): system prompt template, context window, tool-calling execution cycle, prompt injection vulnerability evaluator.
- `terminal/`: In-game terminal AST command parser, allow-list validator, and tool implementations (`nmap`, `curl`, `grep`, `cat`, `ssh`, etc.).

## Absolute Safety Rule
Never connect to real external sockets, interfaces, or host OS processes.
