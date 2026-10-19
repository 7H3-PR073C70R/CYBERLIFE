import { describe, it, expect } from 'vitest';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { validateSimulationState } from '@/simulation/core/invariants';
import { handleCommand } from '@/simulation/commands/commandHandler';
import { ONBOARDING_STEPS } from '@/simulation/onboarding/stepDefinitions';
import { evaluateActiveGuidanceHint } from '@/simulation/onboarding/guidanceDefinitions';
import { migrateSaveRecord } from '@/application/persistence/migrations';

describe('Milestone 10: Onboarding & Guided Learning System', () => {
  describe('Initial State & Invariants', () => {
    it('initializes with valid authoritative onboarding state', () => {
      const state = createInitialSimulationState();

      expect(state.onboarding).toBeDefined();
      expect(state.onboarding?.introCompleted).toBe(false);
      expect(state.onboarding?.introSkipped).toBe(false);
      expect(state.onboarding?.activeStepId).toBe('step_intro_welcome');
      expect(state.onboarding?.completedStepIds).toEqual([]);
      expect(state.onboarding?.dismissedHintIds).toEqual([]);
      expect(state.onboarding?.guidanceMode).toBe('guided');

      expect(() => validateSimulationState(state)).not.toThrow();
    });

    it('rejects invalid guidanceMode invariant violations', () => {
      const state = JSON.parse(JSON.stringify(createInitialSimulationState()));
      if (!state.onboarding) throw new Error('Onboarding state missing');

      state.onboarding.guidanceMode = 'super-expert' as unknown as 'guided';
      expect(() => validateSimulationState(state)).toThrow(/guidanceMode must be/i);
    });

    it('rejects duplicate completedStepIds in invariant check', () => {
      const state = JSON.parse(JSON.stringify(createInitialSimulationState()));
      if (!state.onboarding) throw new Error('Onboarding state missing');

      state.onboarding.completedStepIds = ['step_intro_welcome', 'step_intro_welcome'];
      expect(() => validateSimulationState(state)).toThrow(/Duplicate step ID/i);
    });

    it('rejects duplicate dismissedHintIds in invariant check', () => {
      const state = JSON.parse(JSON.stringify(createInitialSimulationState()));
      if (!state.onboarding) throw new Error('Onboarding state missing');

      state.onboarding.dismissedHintIds = ['hint_world_movement', 'hint_world_movement'];
      expect(() => validateSimulationState(state)).toThrow(/Duplicate hint ID/i);
    });
  });

  describe('Step Progression and First-Launch Flow', () => {
    it('advances through introductory steps until completion', () => {
      let state = createInitialSimulationState();

      expect(state.onboarding?.activeStepId).toBe(ONBOARDING_STEPS[0]?.id);

      // Complete step 0 (step_intro_welcome)
      const res1 = handleCommand(state, {
        type: 'CompleteOnboardingStep',
        stepId: 'step_intro_welcome',
        nextStepId: 'step_movement_camera',
      });
      state = res1.state;

      expect(state.onboarding?.activeStepId).toBe('step_movement_camera');
      expect(state.onboarding?.completedStepIds).toContain('step_intro_welcome');
      expect(state.onboarding?.introCompleted).toBe(false);

      // Complete remaining steps until the end
      for (let i = 1; i < ONBOARDING_STEPS.length; i++) {
        const step = ONBOARDING_STEPS[i];
        if (!step) continue;
        const nextStep = ONBOARDING_STEPS[i + 1];
        const res = handleCommand(state, {
          type: 'CompleteOnboardingStep',
          stepId: step.id,
          nextStepId: nextStep ? nextStep.id : null,
        });
        state = res.state;
      }

      // After completing all 8 steps
      expect(state.onboarding?.introCompleted).toBe(true);
      expect(state.onboarding?.activeStepId).toBeNull();
      expect(state.onboarding?.completedStepIds.length).toBe(ONBOARDING_STEPS.length);
      expect(() => validateSimulationState(state)).not.toThrow();
    });

    it('is idempotent when completing an already completed step', () => {
      let state = createInitialSimulationState();
      const res1 = handleCommand(state, {
        type: 'CompleteOnboardingStep',
        stepId: 'step_intro_welcome',
        nextStepId: 'step_movement_camera',
      });
      state = res1.state;

      // Repeat completion of the same step
      const res2 = handleCommand(state, {
        type: 'CompleteOnboardingStep',
        stepId: 'step_intro_welcome',
        nextStepId: 'step_movement_camera',
      });

      // No duplicate added
      expect(
        res2.state.onboarding?.completedStepIds.filter((s: string) => s === 'step_intro_welcome')
          .length
      ).toBe(1);
    });

    it('allows skipping the introduction flow', () => {
      let state = createInitialSimulationState();

      const res = handleCommand(state, {
        type: 'SkipOnboarding',
      });
      state = res.state;

      expect(state.onboarding?.introSkipped).toBe(true);
      expect(state.onboarding?.introCompleted).toBe(true);
      expect(state.onboarding?.activeStepId).toBeNull();
      expect(() => validateSimulationState(state)).not.toThrow();
    });

    it('allows resetting the introduction without corrupting world state', () => {
      let state = createInitialSimulationState();
      // Skip first
      state = handleCommand(state, { type: 'SkipOnboarding' }).state;
      expect(state.onboarding?.introSkipped).toBe(true);

      // Now reset
      state = handleCommand(state, { type: 'ResetOnboarding' }).state;
      expect(state.onboarding?.introCompleted).toBe(false);
      expect(state.onboarding?.introSkipped).toBe(false);
      expect(state.onboarding?.activeStepId).toBe('step_intro_welcome');
      expect(state.onboarding?.completedStepIds).toEqual([]);
      expect(() => validateSimulationState(state)).not.toThrow();
    });
  });

  describe('Contextual Guidance & Dismissal', () => {
    it('evaluates active contextual hints based on simulation conditions', () => {
      const state = createInitialSimulationState();

      // At start in world, movement hint is eligible
      const hint = evaluateActiveGuidanceHint(state);
      expect(hint).not.toBeNull();
      expect(hint?.id).toBe('hint_world_movement');
    });

    it('dismisses a hint without mutating underlying gameplay attributes', () => {
      let state = createInitialSimulationState();

      const res = handleCommand(state, {
        type: 'DismissGuidanceHint',
        hintId: 'hint_world_movement',
      });
      state = res.state;

      expect(state.onboarding?.dismissedHintIds).toContain('hint_world_movement');

      // Now evaluating hints will not return the dismissed hint
      const nextHint = evaluateActiveGuidanceHint(state);
      expect(nextHint?.id).not.toBe('hint_world_movement');
    });

    it('respects guidanceMode settings', () => {
      let state = createInitialSimulationState();

      // Set to experienced
      state = handleCommand(state, {
        type: 'SetGuidanceMode',
        mode: 'experienced',
      }).state;
      expect(state.onboarding?.guidanceMode).toBe('experienced');

      // In experienced mode, only high priority hints without intro completion or specific conditions show
      const expHint = evaluateActiveGuidanceHint(state);
      expect(expHint?.priority === 'high' || expHint === null).toBe(true);
    });
  });

  describe('Persistence & Save Migration', () => {
    it('backfills default onboarding state for legacy saves lacking onboarding block', () => {
      const legacyState = JSON.parse(JSON.stringify(createInitialSimulationState()));
      delete legacyState.onboarding;

      const legacySaveRecord = {
        metadata: {
          slotId: 'slot_1',
          schemaVersion: 0,
        },
        state: legacyState,
        checksum: 'dummy-checksum',
      };

      const result = migrateSaveRecord(legacySaveRecord);
      expect(result.record.state.onboarding).toBeDefined();
      expect(result.record.state.onboarding?.introCompleted).toBe(false);
      expect(result.record.state.onboarding?.guidanceMode).toBe('guided');
      expect(() => validateSimulationState(result.record.state)).not.toThrow();
    });
  });
});
