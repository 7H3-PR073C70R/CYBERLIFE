/**
 * Cyberlife — Milestone 14: Social Pretexting & Human-Centered Security Types
 *
 * Defines the authoritative contracts for interactive human security scenarios,
 * branching pretext dialogues, trust dynamics, verification challenges, and audit logs.
 *
 * STRICT SAFETY BOUNDARY:
 * Pure deterministic in-memory simulation. Zero real-world social engineering.
 * 100% fictional personas and organizational procedures.
 */

import {
  HumanTrustMetrics,
  SecurityClearanceLevel,
} from '../humanPhysical/types';

export type PretextVenue =
  | 'corporate_reception'
  | 'help_desk_phone'
  | 'server_room_entry'
  | 'finance_office'
  | 'broad_street_cafe'
  | 'secops_turnstile';

export type DialogueOptionTone =
  | 'PROFESSIONAL'
  | 'STRICT_PROCEDURE'
  | 'EMPATHETIC'
  | 'SKEPTICAL_CHALLENGE'
  | 'AUTHORITATIVE'
  | 'EVASIVE';

export interface PretextDialogueOption {
  readonly id: string;
  readonly text: string;
  readonly tone: DialogueOptionTone;
  readonly trustDelta: number;
  readonly suspicionDelta: number;
  readonly credibilityDelta: number;
  readonly authorityDelta: number;
  readonly requiredClearance?: SecurityClearanceLevel;
  readonly verificationAction?:
    | 'VERIFY_BADGE'
    | 'OUT_OF_BAND_CALLBACK'
    | 'CHECK_WORK_ORDER'
    | 'INSPECT_EMAIL_HEADERS'
    | 'SCAN_USB_AIRGAPPED'
    | 'CALL_SUPERVISOR';
  readonly nextNodeId: string;
  readonly auditLogMessage?: string;
}

export type PretextOutcomeStatus =
  | 'SUCCESS_VERIFIED'
  | 'POLICY_UPHELD'
  | 'SECURITY_BREACH_ALLOWED'
  | 'SUSPICION_RAISED'
  | 'FALSE_ACCUSATION'
  | 'THREAT_CONTAINED';

export interface PretextEncounterOutcome {
  readonly status: PretextOutcomeStatus;
  readonly title: string;
  readonly summary: string;
  readonly xpReward: number;
  readonly nairaRewardKobo: number;
  readonly storyFlag?: string;
  readonly generatedEvidenceSnippet?: string;
  readonly evidenceGenerated?: string;
  readonly feedbackNotes: readonly string[];
}

export interface PretextDialogueNode {
  readonly id: string;
  readonly speaker: 'NPC' | 'PLAYER' | 'SYSTEM';
  readonly speakerName: string;
  readonly text: string;
  readonly options?: readonly PretextDialogueOption[];
  readonly isTerminal?: boolean;
  readonly terminalOutcome?: PretextEncounterOutcome;
}

export interface PretextEncounterDefinition {
  readonly id: string;
  readonly title: string;
  readonly venue: PretextVenue;
  readonly venueLabel: string;
  readonly summary: string;
  readonly situationBriefing: string;
  readonly targetNpc: {
    readonly id: string;
    readonly name: string;
    readonly title: string;
    readonly department: string;
    readonly badgeNumber: string;
  };
  readonly initialMetrics: HumanTrustMetrics;
  readonly initialNodeId: string;
  readonly nodes: Record<string, PretextDialogueNode>;
  readonly learningObjectives: readonly string[];
}

export interface PretextSessionState {
  readonly encounterId: string;
  readonly currentNodeId: string;
  readonly metrics: HumanTrustMetrics;
  readonly history: readonly {
    readonly nodeId: string;
    readonly chosenOptionId?: string;
    readonly timestamp: string;
  }[];
  readonly isCompleted: boolean;
  readonly finalOutcome?: PretextEncounterOutcome;
  readonly auditEvents: readonly string[];
}
