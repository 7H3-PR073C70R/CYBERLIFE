import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../../src/simulation/core/initialState';
import { handleCommand } from '../../../src/simulation/commands/commandHandler';
import { SimulationState } from '../../../src/simulation/core/types';

describe('Milestone 8: NPC Career & Job Dialogue Integration', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('allows Blessing to explain career advancement requirements', () => {
    // 1. Start dialogue with Blessing
    const startRes = handleCommand(state, {
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
      initialNodeId: 'amina_returning',
    });
    expect(startRes.success).toBe(true);

    // 2. Select choice asking about career progression
    const choiceRes = handleCommand(startRes.state, {
      type: 'SelectDialogueChoice',
      npcId: 'npc_amina',
      choiceId: 'amina_ask_career',
    });

    expect(choiceRes.success).toBe(true);
    expect(choiceRes.state.activeDialogue?.currentNodeId).toBe('amina_career_guidance');
  });

  it('allows accepting a job directly through NPC conversation', () => {
    // 1. Start dialogue with Blessing
    const startRes = handleCommand(state, {
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
      initialNodeId: 'amina_job_offer_triage',
    });
    expect(startRes.success).toBe(true);

    expect(startRes.state.jobs?.activeJobs).toHaveLength(0);

    // 2. Select choice accepting the triage ticket
    const acceptRes = handleCommand(startRes.state, {
      type: 'SelectDialogueChoice',
      npcId: 'npc_amina',
      choiceId: 'amina_accept_triage',
    });

    expect(acceptRes.success).toBe(true);
    expect(acceptRes.state.jobs?.activeJobs).toHaveLength(1);
    expect(acceptRes.state.jobs?.activeJobs[0]?.listingId).toBe('job_cedarline_triage');

    const jobEvent = acceptRes.events.find(e => e.type === 'JOB_ACCEPTED');
    expect(jobEvent).toBeDefined();
  });

  it('enforces dialogue conditions so NPC only praises job completion after job is actually completed', () => {
    // 1. Before completion, choice is not available
    const startRes = handleCommand(state, {
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
      initialNodeId: 'amina_returning',
    });

    // Attempting to select praise choice before completion must fail condition
    const failChoice = handleCommand(startRes.state, {
      type: 'SelectDialogueChoice',
      npcId: 'npc_amina',
      choiceId: 'amina_praise_triage_completed',
    });

    expect(failChoice.success).toBe(false);
    expect(failChoice.errorCode).toBe('DIALOGUE_CONDITION_NOT_MET');

    // 2. Now complete the job in simulation state
    let funded = handleCommand(state, { type: 'AcceptJob', jobId: 'job_cedarline_triage' }).state;
    funded = handleCommand(funded, {
      type: 'RecordCyberActivity',
      activityId: 'act_1',
      tool: 'logview',
      action: 'view',
      summary: 'done',
      success: true,
    }).state;
    funded = handleCommand(funded, {
      type: 'RecordMissionFinding',
      findingType: 'log',
      targetId: 'svc-aster',
    }).state;
    const completedState = handleCommand(funded, {
      type: 'CompleteJob',
      jobId: 'job_cedarline_triage',
    }).state;

    // 3. Now start dialogue again with completed job
    const dialogueAfter = handleCommand(completedState, {
      type: 'StartNpcDialogue',
      npcId: 'npc_amina',
      initialNodeId: 'amina_returning',
    });

    const successChoice = handleCommand(dialogueAfter.state, {
      type: 'SelectDialogueChoice',
      npcId: 'npc_amina',
      choiceId: 'amina_praise_triage_completed',
    });

    expect(successChoice.success).toBe(true);
    expect(successChoice.state.activeDialogue?.currentNodeId).toBe('amina_job_triage_feedback');
  });

  it('allows accepting Marina Port Audit contract through Michael conversation', () => {
    const startRes = handleCommand(state, {
      type: 'StartNpcDialogue',
      npcId: 'npc_femi',
      initialNodeId: 'femi_job_offer_port_audit',
    });
    expect(startRes.success).toBe(true);

    const acceptRes = handleCommand(startRes.state, {
      type: 'SelectDialogueChoice',
      npcId: 'npc_femi',
      choiceId: 'femi_accept_audit',
    });

    expect(acceptRes.success).toBe(true);
    expect(
      acceptRes.state.jobs?.activeJobs.some(j => j.listingId === 'job_marina_port_audit')
    ).toBe(true);
  });
});
