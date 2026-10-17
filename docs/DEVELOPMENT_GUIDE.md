# Cyberlife — Developer & Contributor Guide

Welcome to the Cyberlife developer guide. This document provides practical instructions, coding standards, and architectural step-by-step patterns for extending the game cleanly and safely.

---

## 1. Architectural Rules of Thumb

Before writing any code, memorize these four golden rules:

1. **Simulation Logic Never Imports Three.js or React**:
   If a file inside `src/simulation/` or `src/domain/` has `import * as THREE from 'three'` or `import React from 'react'`, it is an immediate design failure.
2. **Three.js Never Owns Gameplay Truth**:
   A 3D mesh does not decide if a door is unlocked, whether an API token is valid, or how much money the player has. It only reads positions, plays animations, and reflects state.
3. **All State Changes Flow Through Commands**:
   Never write `gameState.player.money += 500`. Create and dispatch an `AwardBountyCommand` to the simulation engine.
4. **Terminal Commands Are Purely Synthetic**:
   In-game terminal inputs must never touch Node's `child_process`, `exec`, or browser `fetch` to external URLs.

---

## 2. Directory Placement Guide

| If you are creating... | Place it in... | Notes |
|---|---|---|
| A pure business entity or value object | `src/domain/` | Zero framework dependencies |
| A domain event definition | `src/domain/events/` | Immutable, typed interface |
| Simulation logic (network, IAM, AI agent) | `src/simulation/cyber/` | Headless, deterministic |
| Economy, player stats, stamina curves | `src/simulation/economy/` | Pure math & state reducers |
| NPC knowledge and mission evaluation | `src/simulation/narrative/` | Condition evaluator |
| Command definitions & command handlers | `src/application/commands/` | Validates & orchestrates |
| Save/Load persistence adapters | `src/application/persistence/`| Implements domain port |
| Three.js scene, meshes, cameras, shaders | `src/presentation/world/` | Visual rendering only |
| React HUD, dialogue, or notification UI | `src/presentation/hud/` | Reactive UI |
| Virtual Desktop window or desktop app | `src/presentation/desktop/` | React window components |
| Static mission definitions & scenarios | `public/content/missions/` | Declarative JSON / schemas |

---

## 3. How-To Guides

### 3.1 How to Add a New Simulated Cyber Tool

To introduce a new command-line utility (e.g., `netstat` or `dns-lookup`):

1. **Define the Command Specification in Domain**:
   Create the tool contract in `src/domain/cyber/tools.ts`:
   ```typescript
   export interface ToolExecutionRequest {
     command: string;
     args: string[];
     currentHostId: string;
     userContext: SimulatedUserContext;
   }

   export interface ToolExecutionResult {
     stdout: string;
     stderr: string;
     exitCode: number;
   }
   ```

2. **Implement the Synthetic Evaluator in Simulation**:
   Create `src/simulation/cyber/tools/DnsLookupTool.ts`:
   - Parse flags and arguments safely without shell evaluation.
   - Query the simulation's virtual DNS table in `CyberSimulationState`.
   - Return formatted text output.
   - Never execute real DNS queries.

3. **Register in Tool Registry**:
   Add the tool name to `src/simulation/cyber/terminal/ToolRegistry.ts`:
   ```typescript
   registry.register('dns-lookup', new DnsLookupTool());
   ```

4. **Write a Headless Unit Test**:
   In `tests/unit/simulation/cyber/DnsLookupTool.test.ts`:
   - Initialize mock cyber state with a virtual domain record (`gateway.cedarline.internal -> 10.0.1.1`).
   - Execute the tool with mock arguments.
   - Assert `exitCode === 0` and `stdout` contains the expected IP.

---

### 3.2 How to Create a New Mission Scenario

Missions are authored declaratively in JSON with runtime Zod validation:

1. **Create the Scenario File**:
   Create `public/content/missions/<mission-id>.json`:
   ```json
   {
     "id": "mission_phish_contain",
     "title": "Phishing Triage at Cedarline",
     "organizationId": "org_cedarline",
     "stages": [
       {
         "id": "stage_triage",
         "description": "Inspect recent email logs for malicious attachment hashes",
         "requiredEvidenceIds": ["ev_phish_hash_01"],
         "reward": { "currency": 250, "reputation": 10 }
       }
     ]
   }
   ```

2. **Add Supporting Content**:
   - Add mock SIEM log entries to `public/content/organizations/cedarline/logs.json`.
   - Add NPC dialogue nodes in `public/content/dialogue/marcus.json`.

3. **Validate Mission Invariants**:
   Run the mission validator test to ensure all referenced evidence IDs, entity IDs, and organizations exist.

---

### 3.3 How to Add an Interactable 3D World Object

1. **Create the Entity in Domain**:
   Define its interaction metadata:
   ```typescript
   export interface InteractableTarget {
     id: string;
     type: 'WORKSTATION' | 'NPC' | 'DOOR' | 'DROPBOX';
     position: [number, number, number];
     interactionRadius: number;
     promptLabel: string;
   }
   ```

2. **Add 3D Representation in Presentation**:
   In `src/presentation/world/objects/WorkstationMesh.tsx`:
   - Mount Three.js mesh at the specified coordinates.
   - Register the entity with the `SpatialTriggerSystem`.

3. **Wire Interaction Command**:
   When the player enters the trigger radius and presses `E`, dispatch `TriggerInteractionCommand { targetId }`. The Application layer will route to the appropriate UI modal or virtual desktop.

---

## 4. Testing Standards & Conventions

We follow the Test Pyramid:

### 4.1 Unit Tests (`tests/unit/`)
- Fast, isolated, headless.
- Test domain entity invariants and simulation reducers.
- Target execution time: <10ms per test.

### 4.2 Integration Tests (`tests/integration/`)
- Test command dispatching, state updates, and event propagation across multiple simulation subsystems.
- Verify that a sequence of terminal commands results in correct SIEM log updates and mission stage completion.

### 4.3 End-to-End Tests (`tests/e2e/`)
- Executed via Playwright in a real headless browser.
- Tests the complete vertical slice: boots the web app, navigates 3D space, triggers workstation, opens terminal, inputs commands, submits report, and asserts save persistence.

---

## 5. Coding Standards Checklist

- **Strict TypeScript**: Never use `any`. Use `unknown` and perform explicit type narrowing or Zod validation.
- **Pure Functions in Reducers**: Simulation state transitions must not produce random outputs without an explicit seed. Never use `Date.now()` or `Math.random()` inside simulation reducers—inject the game clock or PRNG service.
- **Explicit Error Classes**: Throw domain-specific errors (e.g. `InvalidIpAddressError`) rather than generic `Error`.
- **Zero Secrets**: Never commit tokens, test passwords, or private keys. All virtual secrets must be generated deterministically in fixture factories.
