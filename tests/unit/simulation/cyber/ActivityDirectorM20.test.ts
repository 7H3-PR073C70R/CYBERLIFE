import { describe, it, expect } from 'vitest';
import { createSimulationEngine } from '@/simulation';
import {
  evaluatePrerequisites,
  isActivityObjectiveSatisfied,
  prioritizeOpportunities,
  resolveActivityOutcome,
} from '@/simulation/activities/activityDirectorEngine';
import {
  AUTHORED_ACTIVITIES,
  generateProceduralContract,
} from '@/simulation/activities/activityCatalogue';

describe('ActivityDirectorM20 Simulation Engine', () => {
  it('initializes activityDirector in simulation state with primary and recommended activities', () => {
    const engine = createSimulationEngine();
    const state = engine.getState();

    expect(state.activityDirector).toBeDefined();
    expect(state.activityDirector?.activeActivityId).toBe('act_story_aster_investigation');
    expect(state.activityDirector?.primaryObjectiveId).toBe('act_story_aster_investigation');
    expect(state.activityDirector?.recommendedActivityIds.length).toBeGreaterThan(0);
    expect(state.activityDirector?.longTermGoals.length).toBeGreaterThanOrEqual(3);

    // Initial Aster Incident activity is in ACTIVE state
    const asterAct = state.activityDirector?.activities['act_story_aster_investigation'];
    expect(asterAct).toBeDefined();
    expect(asterAct?.status).toBe('ACTIVE');
  });

  it('correctly evaluates activity eligibility and prerequisite gating', () => {
    const engine = createSimulationEngine();
    const state = engine.getState();

    // Junior activity with level 1 requirements should be eligible
    const juniorDef = AUTHORED_ACTIVITIES['act_career_junior_support']!;
    const juniorCheck = evaluatePrerequisites(juniorDef, state);
    expect(juniorCheck.eligible).toBe(true);

    // High level requirement activity should be gated if player does not meet minCareerLevel
    const gatedDef = {
      ...juniorDef,
      prerequisites: {
        minCareerLevel: 5,
      },
    };
    const gatedCheck = evaluatePrerequisites(gatedDef, state);
    expect(gatedCheck.eligible).toBe(false);
    expect(gatedCheck.reason).toContain('Requires career level 5');
  });

  it('evaluates activity scoring and recommendation prioritization', () => {
    const engine = createSimulationEngine();
    const state = engine.getState();
    const director = state.activityDirector!;

    const prioritized = prioritizeOpportunities(state, director, AUTHORED_ACTIVITIES);

    expect(prioritized.primaryObjectiveId).toBe('act_story_aster_investigation');
    expect(prioritized.recommendedActivityIds.length).toBeGreaterThan(0);
    expect(prioritized.recommendedActivityIds).not.toContain('act_story_aster_investigation');
  });

  it('checks objective satisfaction deterministically against state flags', () => {
    const engine = createSimulationEngine();
    let state = engine.getState();

    const obj = AUTHORED_ACTIVITIES['act_career_junior_support']!.objectives[0]!;
    expect(isActivityObjectiveSatisfied(obj, state)).toBe(false);

    // Trigger state flag
    state = {
      ...state,
      flags: {
        ...state.flags,
        sysinfo_viewed: true,
      },
    };

    expect(isActivityObjectiveSatisfied(obj, state)).toBe(true);
  });

  it('prevents double-reward exploit with idempotent settlement', () => {
    const engine = createSimulationEngine();
    const initialState = engine.getState();
    const initialCash = initialState.player.moneyKobo;
    const def = AUTHORED_ACTIVITIES['act_career_junior_support']!;

    // First completion resolution
    const firstResult = resolveActivityOutcome(
      'act_career_junior_support',
      initialState,
      'COMPLETED'
    );

    expect(firstResult.payoutKobo).toBe(def.reward.payoutKobo);
    expect(firstResult.careerXpEarned).toBe(def.reward.careerXp);
    expect(firstResult.nextState.player.moneyKobo).toBe(initialCash + def.reward.payoutKobo);
    expect(
      firstResult.nextState.activityDirector?.activities['act_career_junior_support']
        ?.rewardClaimed
    ).toBe(true);

    // Second completion resolution on the same activity (double-claim attempt)
    const secondResult = resolveActivityOutcome(
      'act_career_junior_support',
      firstResult.nextState,
      'COMPLETED'
    );

    // Payout should be zero and cash unchanged
    expect(secondResult.payoutKobo).toBe(0);
    expect(secondResult.careerXpEarned).toBe(0);
    expect(secondResult.nextState.player.moneyKobo).toBe(firstResult.nextState.player.moneyKobo);
    expect(secondResult.feedbackNotes).toContain('Reward previously claimed');
  });

  it('safely handles activity abandonment and records history in ledger', () => {
    const engine = createSimulationEngine();
    const state = engine.getState();

    const resolved = resolveActivityOutcome(
      'act_bounty_atm_audit',
      state,
      'ABANDONED'
    );

    expect(
      resolved.nextState.activityDirector?.activities['act_bounty_atm_audit']?.status
    ).toBe('ABANDONED');
    expect(resolved.nextState.activityDirector?.completedHistory.length).toBe(1);
    expect(resolved.nextState.activityDirector?.completedHistory[0]?.outcome).toBe('ABANDONED');
    expect(resolved.nextState.activityDirector?.completedHistory[0]?.feedbackNotes).toContain('abandoned');
    expect(resolved.payoutKobo).toBe(0);
  });

  it('processes AcceptActivity and ResolveActivity commands through the simulation command pipeline', () => {
    const engine = createSimulationEngine();

    // Accept an available activity
    const acceptRes = engine.dispatch({
      type: 'AcceptActivity',
      activityId: 'act_career_junior_support',
    });

    expect(acceptRes.success).toBe(true);
    let state = engine.getState();
    expect(state.activityDirector?.activeActivityId).toBe('act_career_junior_support');
    expect(
      state.activityDirector?.activities['act_career_junior_support']?.status
    ).toBe('ACTIVE');

    // Complete objectives manually in state to allow clean resolution
    const currentAct = state.activityDirector!.activities['act_career_junior_support']!;
    state = {
      ...state,
      activityDirector: {
        ...state.activityDirector!,
        activities: {
          ...state.activityDirector!.activities,
          act_career_junior_support: {
            ...currentAct,
            objectives: currentAct.objectives.map(o => ({ ...o, isCompleted: true })),
            progressPercentage: 100,
          },
        },
      },
    };
    engine.loadState(state);

    const resolveRes = engine.dispatch({
      type: 'ResolveActivity',
      activityId: 'act_career_junior_support',
    });

    expect(resolveRes.success).toBe(true);
    const postResolveState = engine.getState();
    const resolvedAct = postResolveState.activityDirector?.activities['act_career_junior_support'];
    expect(resolvedAct?.status).toBe('COMPLETED');
    expect(resolvedAct?.rewardClaimed).toBe(true);
    expect(postResolveState.activityDirector?.completedHistory.length).toBe(1);
    expect(postResolveState.activityDirector?.completedHistory[0]?.outcome).toBe('COMPLETED');
  });

  it('generates rich procedural contracts for continuous post-story career gameplay', () => {
    const contract1 = generateProceduralContract(0, 2, 'career_sec_analyst');
    expect(contract1.id).toContain('procedural_contract');
    expect(contract1.type).toBeDefined();
    expect(contract1.objectives.length).toBeGreaterThan(0);
    expect(contract1.reward.payoutKobo).toBeGreaterThan(0);
    expect(contract1.reward.careerXp).toBeGreaterThan(0);

    const contract2 = generateProceduralContract(1, 3, 'career_red_sec');
    expect(contract2.id).not.toBe(contract1.id);
    expect(contract2.title).not.toBe(contract1.title);
  });
});
