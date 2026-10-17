# Test Architecture & Verification (`tests/`)

Cyberlife enforces strict testability through the Test Pyramid.

## Directory Organization
- `unit/`: Fast, isolated tests for domain entities, value objects, invariants, and simulation reducers. Runs in Node.js / Vitest in milliseconds without DOM or WebGL.
- `integration/`: Tests multi-step command sequences, mission objective progression, and persistence adapters.
- `e2e/`: Full browser end-to-end tests (via Playwright) running against the booted Vite web application. Verifies 3D canvas mount, desktop window management, and full mission completion.
- `fixtures/`: Deterministic test mock data, synthetic network topologies, sample SIEM logs, and golden save game payloads.

## Invariant
All tests must execute deterministically without relying on unseeded randomness or wall-clock timestamps.
