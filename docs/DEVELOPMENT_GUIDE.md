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

### 3.3 How to Add a Building or Lagos Environmental Prop

1. **Instantiate a `Building` with Architectural Style in `WorldEnvironment.ts`**:
   `Building` supports authentic Lagos Island architectural styles:
   - `'AFRO_BRAZILIAN'`: Arched window hoods, 2nd-floor wrought-iron balcony, parapet roof.
   - `'COMMERCIAL_TOWER'`: Horizontal window ribbons, corporate entrance canopy, rooftop chillers/antenna.
   - `'MARKET_STOREFRONT'`: Corrugated roll-down metal shutters, striped canvas awnings, shop signs.
   - `'MODERN_OFFICE'`: Clean corporate facade.

   ```typescript
   const boutique = new Building({
     name: 'Eko Fashion House',
     x: 15,
     z: -14,
     width: 10,
     height: 8,
     depth: 8,
     style: 'MARKET_STOREFRONT',
     color: 0xfef3c7,
     trimColor: 0x78350f,
     accentColor: 0xd97706,
     awningColors: [0xd97706, 0x15803d], // Amber & Green stripes
     entranceSide: 'SOUTH',
     hasWaterTank: true, // Adds rooftop GeePee tank
   });
   this.buildings.push(boutique);
   this.group.add(boutique.getMesh());
   ```

2. **Register Solid Collision Obstacle**:
   Always register the building's bounding box with `CollisionWorld` so the player cannot walk through walls:
   ```typescript
   const bounds = boutique.getBoundingBox();
   this.collisionWorld.addObstacle(
     bounds.minX,
     bounds.maxX,
     bounds.minZ,
     bounds.maxZ,
     'Building: Eko Fashion House'
   );
   ```

3. **Add Props or Street Furniture via `LagosProps`**:
   Use procedural generators in `src/presentation/world/entities/LagosProps.ts`:
   - `LagosProps.createDanfoMinibus(x, z, rotationY)`: Lagos yellow minibus with twin black stripes.
   - `LagosProps.createMarketStall(x, z, rotationY, color1, color2, name)`: Balogun market stall with canopy.
   - `LagosProps.createUtilityPole(x, z)`: Concrete pole with cross-arms and transformer.
   - `LagosProps.createStreetSign(x, z, streetName, rotationY)`: Lagos green & white enamel street sign.
   - `LagosProps.createPalmTree(x, z, height)`: Tropical royal palm with segmented trunk.
   - `LagosProps.createSeawall(z, minX, maxX)`: Concrete seawall with railings and mooring bollards.
   - `LagosProps.createTinubuMonument(x, z)`: Tinubu Square central fountain & obelisk monument.

   If the prop returns an `aabb`, register it with `this.collisionWorld.addObstacle(...)` so player movement cleanly collides and slides along it.

---

### 3.4 How to Define a Labelled Interactable

1. **Create an `InteractableMarker`**:
   ```typescript
   const marker = new InteractableMarker(x, z, accentColor, 'Cafe Entrance');
   this.markers.push(marker);
   this.group.add(marker.getMesh());
   ```

2. **Register in `InteractionRegistry`**:
   ```typescript
   this.interactionRegistry.register({
     id: 'interact_cafe_entrance',
     name: 'Corner Cyber Cafe',
     promptAction: 'enter the cafe to meet Marcus [E]',
     description: 'A bustling neighborhood cafe popular with Cedarline engineering staff.',
     position: [x, 0, z],
     radius: 2.5,
     targetLocationId: 'cafe_interior', // optional transition target
   });
   ```

3. **Handle Activation**:
   If `targetLocationId` is specified, `WorldSceneManager.triggerNearbyInteraction()` will automatically transition scenes. For dialogs or bulletins, handle the ID in the interaction callback.

---

### 3.5 How to Add a Location & Spawn Point

1. **Define Location in `src/presentation/world/worldConfig.ts`**:
   ```typescript
   cafeInterior: {
     id: 'cafe_interior',
     name: 'Corner Cyber Cafe — Seating Area',
     description: 'Warm cafe booths with public Wi-Fi and chatter.',
     type: 'INTERIOR',
     spawnPosition: [0, 0, 1.5],
     spawnYaw: 0, // radians facing North
   } as LocationDefinition,
   ```

2. **Add Interior Construction in `WorldEnvironment.ts`**:
   In `buildInteriorScene(locationId)`:
   - Handle the new ID, set room dimensions, floor, walls, and lighting.
   - Always add an exit door marker and register `interact_exit_door` with `targetLocationId: 'neighborhood'`.

---

### 3.6 How to Test Movement and Collision Logic

Movement and collision algorithms are 100% decoupled from WebGL:
1. **Collision Tests (`tests/unit/presentation/world/CollisionWorld.test.ts`)**:
   - Instantiate `new CollisionWorld(boundaries)`.
   - Add obstacles with `addObstacle()`.
   - Call `resolveMovement(startX, startZ, deltaX, deltaZ, radius)` and assert `result.x`, `result.z`, `result.isBlocked`, `result.isSliding`.
2. **Player Movement Tests (`tests/unit/presentation/world/PlayerController.test.ts`)**:
   - Dispatch synthetic keyboard events (`keydown`/`keyup`) on `window`.
   - Call `playerController.update(deltaTime, cameraYaw)`.
   - Assert updated coordinates and normalized diagonal velocity.

---

### 3.7 How to Avoid Duplicate Listeners and Render Loops

- **Single Animation Loop**: Only `WorldSceneManager` runs `requestAnimationFrame`. React re-renders must never start secondary loops.
- **Controlled Event Listeners**:
  - `PlayerController` and `WorldCameraController` register window listeners in constructor and remove them completely in `dispose()`.
  - `LocationTransitionController` cleans up transition timers.
  - `WorldViewport` uses `useRef<WorldSceneManager>` and cleans up in the `useEffect` unmount callback:
    ```typescript
    useEffect(() => {
      initializeScene();
      return () => {
        managerRef.current?.dispose();
        managerRef.current = null;
      };
    }, [initializeScene]);
    ```
- **Safe Resource Cleanup**: Use `Set<THREE.BufferGeometry>` and `Set<THREE.Material>` in `clear()` and `dispose()` methods so shared meshes are never double-disposed.

---

### 3.8 How to Add a New Simulation Command, Event, and Invariant Rule

The simulation layer is 100% headless and authoritative. To extend it:

#### Step 1: Define the Command in `src/simulation/commands/types.ts`
Add the command interface to `SimulationCommand`:
```typescript
export interface MyNewCustomCommand {
  readonly type: 'MyNewCustomCommand';
  readonly targetId: string;
  readonly amount: number;
}

export type SimulationCommand =
  | AdvanceSimulationTimeCommand
  // ... existing commands
  | MyNewCustomCommand;
```

#### Step 2: Define Associated Domain Events in `src/simulation/events/types.ts`
```typescript
export interface MyCustomEventPayload {
  readonly targetId: string;
  readonly newAmount: number;
}

export type SimulationEvent =
  // ... existing events
  | TypedSimulationEvent<'MY_CUSTOM_EVENT', MyCustomEventPayload>;
```

#### Step 3: Implement Pure Reducer Logic in `src/simulation/commands/commandHandler.ts`
1. Validate command arguments (check for non-finite numbers, empty strings, missing targets).
2. If invalid, return `{ success: false, state: currentState, events: [], errorCode: 'INVALID_ARGUMENT', message: '...' }`.
3. If valid, calculate candidate state `nextState`.
4. Check if delta occurred; if `isEqual(nextState, currentState)`, return `{ success: true, isNoOp: true, state: currentState, events: [] }`.
5. Check invariants: `validateSimulationState(nextState)`.
6. Return `{ success: true, state: nextState, events: [createSimulationEvent('MY_CUSTOM_EVENT', payload, revision + 1, timestamp)] }`.

#### Step 4: Write Headless Unit Tests in `tests/unit/simulation/`
```typescript
it('applies MyNewCustomCommand deterministically and emits MY_CUSTOM_EVENT', () => {
  const state = createInitialSimulationState();
  const result = handleCommand(state, {
    type: 'MyNewCustomCommand',
    targetId: 'target_01',
    amount: 10,
  });

  expect(result.success).toBe(true);
  expect(result.events[0].type).toBe('MY_CUSTOM_EVENT');
  expect(result.state.metadata.revision).toBe(state.metadata.revision + 1);
});
```

#### Step 5: Consume in React via `useSimulation()` or `useOptionalSimulation()`
```tsx
import { useSimulation } from '@/application/simulation';

export const MyComponent: React.FC = () => {
  const { state, dispatch } = useSimulation();

  const handleAction = () => {
    dispatch({
      type: 'MyNewCustomCommand',
      targetId: 'target_01',
      amount: 10,
    });
  };

  return <div>Current Funds: {Money.fromKobo(state.player.moneyKobo).format()}</div>;
};
```

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
