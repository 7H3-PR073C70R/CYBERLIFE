import * as THREE from 'three';
import { HumanoidCharacter, HumanoidPalette } from './HumanoidCharacter';

export interface PedestrianWaypoint {
  x: number;
  z: number;
}

export interface PedestrianAgent {
  character: HumanoidCharacter;
  waypoints: PedestrianWaypoint[];
  currentWaypointIndex: number;
  speed: number;
  position: THREE.Vector3;
  targetYaw: number;
  currentYaw: number;
  pauseTimer: number;
}

const NPC_PALETTES: HumanoidPalette[] = [
  // 1. Lagos Tech Entrepreneur / Modern Urban
  {
    skin: 0x4d2d1d,
    hair: 0x111111,
    jacket: 0x0284c7, // Sky cyan jacket
    jacketTrim: 0xf8fafc,
    pants: 0x1e293b,
    shoes: 0xffffff,
    accent: 0x38bdf8,
  },
  // 2. Marina Corporate Professional (Emerald & Gold)
  {
    skin: 0x6e4732,
    hair: 0x1c1917,
    jacket: 0x065f46, // Deep emerald blazer
    jacketTrim: 0xf59e0b, // Gold trim
    pants: 0x0f172a,
    shoes: 0x78350f, // Polished leather
    accent: 0x10b981,
  },
  // 3. Balogun Market Merchant / Vibrant Ankara Indigo
  {
    skin: 0x543220,
    hair: 0x0f0f0f,
    jacket: 0x4338ca, // Rich indigo
    jacketTrim: 0xf43f5e, // Coral pink accent
    pants: 0x312e81,
    shoes: 0xe2e8f0,
    accent: 0xec4899,
  },
  // 4. Broad Street Cyber Researcher
  {
    skin: 0x3d2012,
    hair: 0x18181b,
    jacket: 0xd97706, // Warm terracotta amber
    jacketTrim: 0x00e5ff,
    pants: 0x18181b,
    shoes: 0xffffff,
    accent: 0xfbbf24,
  },
  // 5. Marina Waterfront Commuter
  {
    skin: 0x5c3826,
    hair: 0x09090b,
    jacket: 0x475569, // Slate trench
    jacketTrim: 0x38bdf8,
    pants: 0x1e293b,
    shoes: 0x0f172a,
    accent: 0x0284c7,
  },
];

export class PedestrianSystem {
  private group: THREE.Group;
  private agents: PedestrianAgent[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PedestrianSystem';

    this.spawnPedestrians();
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  private spawnPedestrians(): void {
    // 5 authored, believable pedestrian routes on safe sidewalks
    const routes: PedestrianWaypoint[][] = [
      // Route 1: Broad Street West Sidewalk (Cedarline side)
      [
        { x: -8.5, z: -28 },
        { x: -8.5, z: 12 },
        { x: -7.5, z: 14 },
        { x: -7.5, z: -28 },
      ],
      // Route 2: Broad Street East Sidewalk (Apartment side)
      [
        { x: 8.5, z: 14 },
        { x: 8.5, z: -8 },
        { x: 9.5, z: -8 },
        { x: 9.5, z: 14 },
      ],
      // Route 3: Marina Waterfront Promenade (East-West stroll)
      [
        { x: -26, z: 17.5 },
        { x: 26, z: 17.5 },
        { x: 26, z: 18.5 },
        { x: -26, z: 18.5 },
      ],
      // Route 4: Balogun Market Concourse
      [
        { x: 10, z: -14.5 },
        { x: 28, z: -14.5 },
        { x: 28, z: -13.5 },
        { x: 10, z: -13.5 },
      ],
      // Route 5: Tinubu Square Walkway
      [
        { x: 14, z: -26 },
        { x: 26, z: -26 },
        { x: 26, z: -32 },
        { x: 14, z: -32 },
      ],
    ];

    routes.forEach((route, idx) => {
      const palette = NPC_PALETTES[idx % NPC_PALETTES.length];
      const character = new HumanoidCharacter(palette);

      const startWp = route[0];
      if (!startWp) return;

      const agent: PedestrianAgent = {
        character,
        waypoints: route,
        currentWaypointIndex: 1 % route.length,
        speed: 1.1 + (idx % 3) * 0.2, // between 1.1m/s and 1.5m/s (natural walking pace)
        position: new THREE.Vector3(startWp.x, 0, startWp.z),
        targetYaw: 0,
        currentYaw: 0,
        pauseTimer: (idx % 2) * 1.5,
      };

      character.setPosition(startWp.x, 0, startWp.z);
      this.agents.push(agent);
      this.group.add(character.getMesh());
    });
  }

  public update(deltaTime: number): void {
    this.agents.forEach(agent => {
      if (agent.pauseTimer > 0) {
        agent.pauseTimer -= deltaTime;
        agent.character.update(deltaTime, false);
        return;
      }

      const targetWp = agent.waypoints[agent.currentWaypointIndex];
      if (!targetWp) return;

      const dx = targetWp.x - agent.position.x;
      const dz = targetWp.z - agent.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.6) {
        // Reached waypoint: advance to next
        agent.currentWaypointIndex = (agent.currentWaypointIndex + 1) % agent.waypoints.length;
        // Occasional brief pause at destination
        if (Math.random() < 0.25) {
          agent.pauseTimer = 2.0 + Math.random() * 2.5;
        }
        return;
      }

      // Compute desired yaw angle
      agent.targetYaw = Math.atan2(dx, dz);

      // Smooth yaw rotation
      let diff = agent.targetYaw - agent.currentYaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      agent.currentYaw += diff * Math.min(1.0, 5.0 * deltaTime);
      agent.character.setRotation(agent.currentYaw);

      // Move forward along yaw
      const moveStep = agent.speed * deltaTime;
      agent.position.x += (dx / dist) * moveStep;
      agent.position.z += (dz / dist) * moveStep;
      agent.character.setPosition(agent.position.x, 0, agent.position.z);

      // Animate walking cycle
      agent.character.update(deltaTime, true, agent.speed / 1.3);
    });
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public dispose(): void {
    this.agents.forEach(a => a.character.dispose());
    this.agents = [];
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
