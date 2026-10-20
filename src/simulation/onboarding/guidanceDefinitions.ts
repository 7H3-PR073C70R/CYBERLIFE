/**
 * Cyberlife — Milestone 10: Contextual Guidance Hint Definitions
 *
 * Provides data-driven contextual hints triggered by authoritative
 * simulation state and player interactions.
 */

import { ContextualHintDefinition } from './types';
import { SimulationState } from '../core/types';

export interface EvaluatedGuidanceHint extends ContextualHintDefinition {
  readonly isEligible: boolean;
  readonly isCompleted: boolean;
  readonly isDismissed: boolean;
}

export const CONTEXTUAL_HINTS: readonly ContextualHintDefinition[] = [
  {
    id: 'hint_world_movement',
    title: 'Explore Lagos Island',
    description:
      'Use WASD or arrow keys to navigate the streets of Lagos Island. Press [V] to toggle between 1st and 3rd person camera views.',
    controlsHint: '[W][A][S][D] / [V] Camera',
    priority: 'high',
    expectedOutcome: 'Freely move around the neighborhood and discover buildings.',
    recoveryGuidance: 'Click the canvas to ensure mouse/keyboard focus is active.',
    fieldGuideTopic: 'basics',
  },
  {
    id: 'hint_approach_interaction',
    title: 'Nearby Interaction Available',
    description:
      'You are close to an interactive person or location. Press [E] to talk, read noticeboards, or enter buildings.',
    controlsHint: 'Press [E] to interact',
    priority: 'high',
    expectedOutcome: 'Opens dialogue tree or changes location.',
    recoveryGuidance: 'Walk directly onto the turquoise glowing circular marker.',
    fieldGuideTopic: 'basics',
  },
  {
    id: 'hint_workstation_access',
    title: 'Boot Virtual Desktop',
    description:
      'Approach your physical workstation desk and press [E] to access the simulated Heron OS workstation.',
    controlsHint: 'Press [E] at computer desk',
    priority: 'high',
    expectedOutcome:
      'Launches full virtual desktop with Terminal, Field Guide, and Incident Portal.',
    recoveryGuidance: 'Ensure you are standing in front of the chair facing the screen.',
    fieldGuideTopic: 'basics',
  },
  {
    id: 'hint_terminal_first_command',
    title: 'Try Your First Terminal Command',
    description:
      'The simulated terminal requires manual typing. Type "whoami" to view your security persona or "status" to check workstation health.',
    controlsHint: 'Type "whoami" and press [Enter]',
    priority: 'medium',
    expectedOutcome: 'Terminal prints your authenticated credentials and role.',
    recoveryGuidance: 'Click inside the black terminal prompt line to focus the cursor.',
    fieldGuideTopic: 'basics',
  },
  {
    id: 'hint_evidence_preservation',
    title: 'Forensic Evidence Preservation',
    description:
      'Before modifying system configuration, take a digital snapshot of volatile evidence. Preserved artifacts are locked with SHA-256 hashes to maintain chain of custody.',
    controlsHint: 'Use "evidence list" or Incident Portal',
    priority: 'high',
    expectedOutcome: 'Guarantees uncorrupted evidence records for the post-incident audit.',
    recoveryGuidance: 'Inspect EVD-2026-004 in the incident portal before executing containment.',
    fieldGuideTopic: 'concepts',
  },
  {
    id: 'hint_containment_order',
    title: 'Incident Order of Operations',
    description:
      'Always isolate affected systems before changing permissions. Sever unauthorized SMB routes with "aster-admin contain" to halt lateral movement.',
    controlsHint: 'Run "aster-admin contain"',
    priority: 'high',
    expectedOutcome: 'Restricts Aster service to isolated operating mode.',
    recoveryGuidance: 'Verify containment status with "aster-admin status".',
    fieldGuideTopic: 'concepts',
  },
  {
    id: 'hint_remediation_least_privilege',
    title: 'Enforce Least Privilege',
    description:
      'Replace overprivileged wildcard access with role "kb-assistant". Services should only receive the minimum permissions necessary for their business function.',
    controlsHint: 'aster-admin remediate --role=kb-assistant',
    priority: 'high',
    expectedOutcome: 'Removes unnecessary file server and database scopes.',
    recoveryGuidance: 'Review active scopes in the Incident Portal policy tab.',
    fieldGuideTopic: 'concepts',
  },
  {
    id: 'hint_verification_testing',
    title: 'Empirical Verification Required',
    description:
      'Never close an incident based on assumption. Run automated verification tests to confirm legitimate documents remain accessible while SMB access is denied.',
    controlsHint: 'Run "aster-admin verify"',
    priority: 'high',
    expectedOutcome: 'Validates system state against simulated service boundaries.',
    recoveryGuidance: 'If verification fails, review remediation role configuration.',
    fieldGuideTopic: 'concepts',
  },
  {
    id: 'hint_career_job_board',
    title: 'Evaluate Career Tickets',
    description:
      'Open the Career app to browse available assignments. Review required skills, XP reward, and payment before accepting.',
    controlsHint: 'Open Career Hub (💼) on desktop',
    priority: 'medium',
    expectedOutcome: 'Earn money in kobo and experience points toward career promotion.',
    recoveryGuidance: 'Check skill requirements before attempting senior tickets.',
    fieldGuideTopic: 'concepts',
  },
  {
    id: 'hint_save_reminder',
    title: 'Local Game Persistence',
    description:
      'Your progress can be saved to browser IndexedDB at any time. Click the Save indicator in the top HUD or open the Save Vault desktop app.',
    controlsHint: 'Click HUD Save Indicator',
    priority: 'low',
    expectedOutcome: 'Stores authoritative simulation state across browser reloads.',
    recoveryGuidance: 'If IndexedDB is blocked, backup storage maintains in-session state.',
    fieldGuideTopic: 'safety',
  },
] as const;

/**
 * Pure evaluator determining which hint is eligible to be presented based on simulation state.
 */
export function evaluateActiveGuidanceHint(
  state: SimulationState,
  context?: {
    isNearInteraction?: boolean;
    isDesktopOpen?: boolean;
    isTerminalActive?: boolean;
  }
): ContextualHintDefinition | null {
  const onboarding = state.onboarding;
  const dismissedSet = new Set(onboarding?.dismissedHintIds ?? []);
  const completedSet = new Set(onboarding?.completedStepIds ?? []);

  // If guidance mode is set to experienced and not in intro, suppress routine hints
  if (onboarding?.guidanceMode === 'experienced' && onboarding?.introCompleted) {
    return null;
  }

  // 1. Mission-specific hints take precedence during incident phases
  const missionPhase = state.mission?.phase;
  if (missionPhase === 'evidence_preservation' && !dismissedSet.has('hint_evidence_preservation')) {
    return CONTEXTUAL_HINTS.find(h => h.id === 'hint_evidence_preservation') ?? null;
  }
  if (missionPhase === 'containment' && !dismissedSet.has('hint_containment_order')) {
    return CONTEXTUAL_HINTS.find(h => h.id === 'hint_containment_order') ?? null;
  }
  if (missionPhase === 'remediation' && !dismissedSet.has('hint_remediation_least_privilege')) {
    return CONTEXTUAL_HINTS.find(h => h.id === 'hint_remediation_least_privilege') ?? null;
  }
  if (missionPhase === 'verification' && !dismissedSet.has('hint_verification_testing')) {
    return CONTEXTUAL_HINTS.find(h => h.id === 'hint_verification_testing') ?? null;
  }

  // 2. Workstation and Terminal hints
  if (context?.isDesktopOpen) {
    if (context.isTerminalActive && !dismissedSet.has('hint_terminal_first_command')) {
      return CONTEXTUAL_HINTS.find(h => h.id === 'hint_terminal_first_command') ?? null;
    }
    if (
      !dismissedSet.has('hint_career_job_board') &&
      state.jobs &&
      state.jobs.activeJobs.length === 0
    ) {
      return CONTEXTUAL_HINTS.find(h => h.id === 'hint_career_job_board') ?? null;
    }
  }

  // 3. World interaction hints
  if (context?.isNearInteraction && !dismissedSet.has('hint_approach_interaction')) {
    return CONTEXTUAL_HINTS.find(h => h.id === 'hint_approach_interaction') ?? null;
  }

  // 4. Default movement hint for fresh sessions
  if (!dismissedSet.has('hint_world_movement') && !completedSet.has('step_movement_camera')) {
    return CONTEXTUAL_HINTS.find(h => h.id === 'hint_world_movement') ?? null;
  }

  return null;
}
