/**
 * Cyberlife — Milestone 10: Onboarding & Guided Learning Simulation Types
 *
 * Defines authoritative domain models for player onboarding progress,
 * guided steps, contextual hints, and learning preferences.
 */

export type GuidanceMode = 'guided' | 'experienced';

export interface OnboardingSimulationState {
  readonly introCompleted: boolean;
  readonly introSkipped: boolean;
  readonly completedStepIds: ReadonlyArray<string>;
  readonly dismissedHintIds: ReadonlyArray<string>;
  readonly guidanceMode: GuidanceMode;
  readonly activeStepId: string | null;
}

export interface OnboardingStepDefinition {
  readonly id: string;
  readonly stepNumber: number;
  readonly totalSteps: number;
  readonly title: string;
  readonly category:
    'welcome' | 'movement' | 'interaction' | 'workstation' | 'terminal' | 'cyber' | 'objectives';
  readonly description: string;
  readonly controlsHint?: string;
  readonly whyItMatters: string;
  readonly actionPrompt: string;
  readonly nextStepId?: string;
  readonly prevStepId?: string;
}

export type HintPriority = 'high' | 'medium' | 'low';

export interface ContextualHintDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly controlsHint?: string;
  readonly priority: HintPriority;
  readonly expectedOutcome: string;
  readonly recoveryGuidance: string;
  readonly fieldGuideTopic?: string;
}
