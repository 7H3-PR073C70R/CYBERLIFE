/**
 * Cyberlife — Milestone 10: Authoritative Onboarding Command Handlers
 *
 * Provides pure, deterministic handlers for:
 * - Completing an introductory onboarding step
 * - Skipping onboarding
 * - Resetting onboarding progress
 * - Dismissing contextual hints
 * - Switching guidance modes
 */

import { SimulationState } from '../core/types';
import { CommandResult } from '../commands/types';
import { createSimulationEvent } from '../events/eventFactory';
import { validateSimulationState } from '../core/invariants';
import { deepFreeze } from '../core/stateUtils';
import { GuidanceMode, OnboardingSimulationState } from './types';

const DEFAULT_ONBOARDING_STATE: OnboardingSimulationState = {
  introCompleted: false,
  introSkipped: false,
  completedStepIds: [],
  dismissedHintIds: [],
  guidanceMode: 'guided',
  activeStepId: 'step_intro_welcome',
};

export function handleCompleteOnboardingStep(
  state: Readonly<SimulationState>,
  stepId: string,
  nextStepId?: string | null
): CommandResult {
  const currentOnboarding = state.onboarding ?? DEFAULT_ONBOARDING_STATE;
  const currentCompleted = currentOnboarding.completedStepIds;

  const nextCompleted = currentCompleted.includes(stepId)
    ? currentCompleted
    : [...currentCompleted, stepId];

  const isIntroCompleted =
    nextStepId === null ||
    stepId === 'step_manual_commands_objectives' ||
    nextCompleted.length >= 8;

  const nextActiveStep = isIntroCompleted ? null : (nextStepId ?? currentOnboarding.activeStepId);

  const nextRevision = state.metadata.revision + 1;
  const event = createSimulationEvent(
    'ONBOARDING_STEP_COMPLETED',
    state.time.simulationTimeSeconds,
    nextRevision,
    {
      stepId,
      nextStepId: nextActiveStep,
      totalCompleted: nextCompleted.length,
      isIntroCompleted,
    }
  );

  const nextState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    onboarding: {
      ...currentOnboarding,
      completedStepIds: nextCompleted,
      activeStepId: nextActiveStep,
      introCompleted: isIntroCompleted ? true : currentOnboarding.introCompleted,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Completed onboarding step "${stepId}"`,
  };
}

export function handleSkipOnboarding(state: Readonly<SimulationState>): CommandResult {
  const currentOnboarding = state.onboarding ?? DEFAULT_ONBOARDING_STATE;

  const nextRevision = state.metadata.revision + 1;
  const event = createSimulationEvent(
    'ONBOARDING_SKIPPED',
    state.time.simulationTimeSeconds,
    nextRevision,
    {
      timestamp: state.time.simulationTimeSeconds,
    }
  );

  const nextState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    onboarding: {
      ...currentOnboarding,
      introSkipped: true,
      introCompleted: true,
      activeStepId: null,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: 'Onboarding introduction skipped',
  };
}

export function handleResetOnboarding(state: Readonly<SimulationState>): CommandResult {
  const nextRevision = state.metadata.revision + 1;
  const event = createSimulationEvent(
    'ONBOARDING_RESET',
    state.time.simulationTimeSeconds,
    nextRevision,
    {
      timestamp: state.time.simulationTimeSeconds,
    }
  );

  const nextState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    onboarding: {
      introCompleted: false,
      introSkipped: false,
      completedStepIds: [],
      dismissedHintIds: [],
      guidanceMode: 'guided',
      activeStepId: 'step_intro_welcome',
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: 'Onboarding reset to initial state',
  };
}

export function handleDismissGuidanceHint(
  state: Readonly<SimulationState>,
  hintId: string
): CommandResult {
  const currentOnboarding = state.onboarding ?? DEFAULT_ONBOARDING_STATE;
  const currentDismissed = currentOnboarding.dismissedHintIds;

  if (currentDismissed.includes(hintId)) {
    return {
      success: true,
      state,
      events: [],
      message: `Hint "${hintId}" already dismissed (no-op)`,
      isNoOp: true,
    };
  }

  const nextDismissed = [...currentDismissed, hintId];
  const nextRevision = state.metadata.revision + 1;
  const event = createSimulationEvent(
    'GUIDANCE_HINT_DISMISSED',
    state.time.simulationTimeSeconds,
    nextRevision,
    {
      hintId,
    }
  );

  const nextState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    onboarding: {
      ...currentOnboarding,
      dismissedHintIds: nextDismissed,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Dismissed guidance hint "${hintId}"`,
  };
}

export function handleSetGuidanceMode(
  state: Readonly<SimulationState>,
  mode: GuidanceMode
): CommandResult {
  const currentOnboarding = state.onboarding ?? DEFAULT_ONBOARDING_STATE;

  if (currentOnboarding.guidanceMode === mode) {
    return {
      success: true,
      state,
      events: [],
      message: `Guidance mode already set to "${mode}" (no-op)`,
      isNoOp: true,
    };
  }

  const nextRevision = state.metadata.revision + 1;
  const event = createSimulationEvent(
    'GUIDANCE_MODE_CHANGED',
    state.time.simulationTimeSeconds,
    nextRevision,
    {
      mode,
    }
  );

  const nextState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    onboarding: {
      ...currentOnboarding,
      guidanceMode: mode,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Guidance mode set to "${mode}"`,
  };
}
