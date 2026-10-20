import { HumanoidPalette } from '../../presentation/world/entities/HumanoidCharacter';

/**
 * Bounded relationship scale from -100 (Hostile) to +100 (Trusted).
 */
export const MIN_RELATIONSHIP = -100;
export const MAX_RELATIONSHIP = 100;

export type RelationshipBand = 'HOSTILE' | 'DISTRUSTFUL' | 'NEUTRAL' | 'FRIENDLY' | 'TRUSTED';

export interface RelationshipBandDefinition {
  readonly band: RelationshipBand;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly color: string;
}

export const RELATIONSHIP_BANDS: readonly RelationshipBandDefinition[] = [
  { band: 'HOSTILE', label: 'Hostile', min: -100, max: -51, color: '#ef4444' },
  { band: 'DISTRUSTFUL', label: 'Distrustful', min: -50, max: -16, color: '#f97316' },
  { band: 'NEUTRAL', label: 'Neutral', min: -15, max: 15, color: '#94a3b8' },
  { band: 'FRIENDLY', label: 'Friendly', min: 16, max: 50, color: '#38bdf8' },
  { band: 'TRUSTED', label: 'Trusted', min: 51, max: 100, color: '#10b981' },
] as const;

export function clampRelationship(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(MIN_RELATIONSHIP, Math.min(MAX_RELATIONSHIP, Math.round(value)));
}

export function getRelationshipBand(value: number): RelationshipBand {
  const clamped = clampRelationship(value);
  for (const def of RELATIONSHIP_BANDS) {
    if (clamped >= def.min && clamped <= def.max) {
      return def.band;
    }
  }
  return 'NEUTRAL';
}

export function getRelationshipBandLabel(band: RelationshipBand): string {
  const match = RELATIONSHIP_BANDS.find(b => b.band === band);
  return match?.label ?? 'Neutral';
}

/**
 * NPC Knowledge boundaries: What the NPC knows, suspects, or does not know.
 */
export interface NpcKnowledgeBoundaries {
  readonly knownFacts: readonly string[];
  readonly suspectedFacts: readonly string[];
  readonly unknownFacts: readonly string[];
}

/**
 * Single schedule window for an NPC.
 */
export interface NpcScheduleEntry {
  readonly startHour: number; // 0-23
  readonly endHour: number; // 0-23 (if endHour < startHour, wraps midnight)
  readonly locationId: string; // 'neighborhood' | 'cedarline_interior' | 'apartment_interior'
  readonly position: readonly [number, number, number];
  readonly yaw: number;
  readonly activity: string;
  readonly animationState?: 'IDLE' | 'WALK' | 'SEATED_IDLE' | 'TYPING' | 'MOUSE_USE';
}

/**
 * Static NPC profile specification.
 */
export interface NpcProfile {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly organization?: string;
  readonly bio: string;
  readonly personality: string;
  readonly voiceTone: string;
  readonly palette: HumanoidPalette;
  readonly initialRelationship: number;
  readonly knowledgeBoundaries: NpcKnowledgeBoundaries;
  readonly schedule: readonly NpcScheduleEntry[];
}

/**
 * Authoritative in-memory state of an NPC's session memory.
 */
export interface NpcMemoryState {
  readonly met: boolean;
  readonly metAtSimulationTime?: number;
  readonly conversationCount: number;
  readonly topicsDiscussed: readonly string[];
  readonly choicesMade: readonly string[];
  readonly sharedFacts: readonly string[];
  readonly commitments: readonly string[];
  readonly lastInteractionTime?: number;
}

/**
 * Authoritative simulation state for a single NPC.
 */
export interface NpcSimulationState {
  readonly id: string;
  readonly relationship: number; // -100 to +100
  readonly memory: NpcMemoryState;
}

/**
 * Active in-game dialogue session state (if a conversation is ongoing).
 */
export interface ActiveDialogueState {
  readonly npcId: string;
  readonly currentNodeId: string;
  readonly lastChoiceId?: string;
  readonly lastRelationshipDelta?: {
    readonly delta: number;
    readonly reason: string;
    readonly timestamp: number;
  };
  readonly lastFactionDelta?: {
    readonly factionId: string;
    readonly delta: number;
    readonly reason: string;
    readonly timestamp: number;
  };
}
