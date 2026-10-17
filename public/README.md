# Public Static Assets & Content

This directory contains static binary assets and declarative content definitions served directly by Vite without JavaScript bundling.

## Directory Structure
- `assets/`: Static 3D models, textures, environment maps, and audio effects.
  - `environment/`: GLTF/GLB models for buildings, street props, and foliage.
  - `characters/`: Character meshes, rigs, and animations.
  - `props/`: Interactable item models (workstations, terminals, coffee cups, notes).
  - `audio/`: Ambient city audio, keyboard clicks, terminal chimes, UI audio cues.
- `content/`: Declarative scenario definitions, organizations, and dialogue scripts.
  - `missions/`: JSON mission definitions (e.g., `aster-incident.json`).
  - `organizations/`: Fictional company topologies, employees, and simulated SIEM logs.
  - `dialogue/`: Branching dialogue trees and conditional conversation nodes.

All content in this directory is validated at runtime against strict domain schemas.
