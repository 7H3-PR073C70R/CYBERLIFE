import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../../src/simulation/core/initialState';
import { handleCommand } from '../../../src/simulation/commands/commandHandler';
import { SimulationState } from '../../../src/simulation/core/types';
import { JOB_LISTINGS } from '../../../src/simulation/career/jobDefinitions';

describe('Milestone 8: Career & Job Board System', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('initializes career and job board state correctly', () => {
    expect(state.career).toBeDefined();
    expect(state.career?.currentPathId).toBe('career_sec_analyst');
    expect(state.career?.currentLevel).toBe(1);
    expect(state.career?.roleTitle).toBe('Trainee Analyst');
    expect(state.career?.xp).toBe(0);

    expect(state.jobs).toBeDefined();
    expect(state.jobs?.availableJobIds).toContain('job_cedarline_triage');
    expect(state.jobs?.availableJobIds).toContain('job_marina_port_audit');
    expect(state.jobs?.activeJobs).toHaveLength(0);
    expect(state.jobs?.completedJobHistory).toHaveLength(0);
  });

  it('rejects accepting a non-existent job ID', () => {
    const res = handleCommand(state, {
      type: 'AcceptJob',
      jobId: 'non_existent_job_999',
    });

    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('JOB_NOT_FOUND');
  });

  it('successfully accepts a valid entry-level job and tracks objectives', () => {
    const res = handleCommand(state, {
      type: 'AcceptJob',
      jobId: 'job_cedarline_triage',
    });

    expect(res.success).toBe(true);
    expect(res.state.jobs?.activeJobs).toHaveLength(1);
    expect(res.state.jobs?.activeJobs[0]?.listingId).toBe('job_cedarline_triage');
    expect(res.state.jobs?.availableJobIds).not.toContain('job_cedarline_triage');

    const acceptedEvent = res.events.find(e => e.type === 'JOB_ACCEPTED');
    expect(acceptedEvent).toBeDefined();
    expect(acceptedEvent?.payload).toMatchObject({
      jobId: 'job_cedarline_triage',
      title: 'Cedarline Ticket: Triage svc-aster Credential Spike',
      payoutKobo: 75_000,
    });
  });

  it('prevents accepting a job that is already active', () => {
    const step1 = handleCommand(state, {
      type: 'AcceptJob',
      jobId: 'job_cedarline_triage',
    });
    expect(step1.success).toBe(true);

    const step2 = handleCommand(step1.state, {
      type: 'AcceptJob',
      jobId: 'job_cedarline_triage',
    });

    expect(step2.success).toBe(false);
    expect(step2.errorCode).toBe('JOB_ALREADY_ACTIVE');
  });

  it('rejects job completion if objectives are not fulfilled', () => {
    const acceptRes = handleCommand(state, {
      type: 'AcceptJob',
      jobId: 'job_cedarline_triage',
    });

    const completeRes = handleCommand(acceptRes.state, {
      type: 'CompleteJob',
      jobId: 'job_cedarline_triage',
    });

    expect(completeRes.success).toBe(false);
    expect(completeRes.errorCode).toBe('JOB_OBJECTIVES_INCOMPLETE');
    expect(completeRes.message).toContain('pending objectives');
  });

  it('validates objectives against authoritative simulation state and awards compensation', () => {
    // 1. Accept job
    const acceptRes = handleCommand(state, {
      type: 'AcceptJob',
      jobId: 'job_cedarline_triage',
    });
    expect(acceptRes.success).toBe(true);

    // 2. Fulfill objectives: run logview tool
    const actRes = handleCommand(acceptRes.state, {
      type: 'RecordCyberActivity',
      activityId: 'act_logview_01',
      tool: 'logview',
      action: 'examine_auth_log',
      target: 'svc-aster',
      summary: 'Inspected anomalous auth events for svc-aster',
      success: true,
    });
    expect(actRes.success).toBe(true);

    // Record mission finding for svc-aster
    const findRes = handleCommand(actRes.state, {
      type: 'RecordMissionFinding',
      findingType: 'log',
      targetId: 'svc-aster',
      summary: 'Unauthorized token credential usage detected',
    });
    expect(findRes.success).toBe(true);

    // 3. Complete job
    const startMoney = findRes.state.player.moneyKobo;
    const completeRes = handleCommand(findRes.state, {
      type: 'CompleteJob',
      jobId: 'job_cedarline_triage',
    });

    expect(completeRes.success).toBe(true);
    // Payout awarded exactly
    expect(completeRes.state.player.moneyKobo).toBe(startMoney + 75_000);
    // Career XP awarded
    expect(completeRes.state.career?.xp).toBe(50);
    // Active jobs cleared
    expect(completeRes.state.jobs?.activeJobs).toHaveLength(0);
    // Recorded in work history
    expect(completeRes.state.jobs?.completedJobHistory).toHaveLength(1);
    expect(completeRes.state.jobs?.completedJobHistory[0]).toMatchObject({
      jobId: 'job_cedarline_triage',
      payoutKobo: 75_000,
      careerXpEarned: 50,
      performanceRating: 'EXEMPLARY',
    });

    // Transaction recorded in financial ledger
    const tx = completeRes.state.economy?.transactions[0];
    expect(tx).toBeDefined();
    expect(tx?.type).toBe('JOB_PAYOUT');
    expect(tx?.amountKobo).toBe(75_000);
    expect(tx?.direction).toBe('CREDIT');
    expect(tx?.balanceAfterKobo).toBe(completeRes.state.player.moneyKobo);

    // Skills advanced
    expect(completeRes.state.skills?.log_analysis.totalXp).toBeGreaterThan(25);
  });

  it('prevents completing the same job twice or collecting duplicate rewards', () => {
    // 1. Accept and fulfill
    let curr = handleCommand(state, { type: 'AcceptJob', jobId: 'job_cedarline_triage' }).state;
    curr = handleCommand(curr, {
      type: 'RecordCyberActivity',
      activityId: 'act_01',
      tool: 'logview',
      action: 'inspect',
      summary: 'done',
      success: true,
    }).state;
    curr = handleCommand(curr, {
      type: 'RecordMissionFinding',
      findingType: 'log',
      targetId: 'svc-aster',
    }).state;

    const comp1 = handleCommand(curr, { type: 'CompleteJob', jobId: 'job_cedarline_triage' });
    expect(comp1.success).toBe(true);

    // Attempting to complete again must fail (job is no longer active)
    const comp2 = handleCommand(comp1.state, {
      type: 'CompleteJob',
      jobId: 'job_cedarline_triage',
    });
    expect(comp2.success).toBe(false);
    expect(comp2.errorCode).toBe('JOB_NOT_FOUND');

    // Attempting to accept again must fail (non-repeatable job)
    const reAccept = handleCommand(comp1.state, {
      type: 'AcceptJob',
      jobId: 'job_cedarline_triage',
    });
    expect(reAccept.success).toBe(false);
    expect(reAccept.errorCode).toBe('JOB_ALREADY_COMPLETED');
  });

  it('enforces career level requirements on advanced job listings', () => {
    // job_eko_forensics requires career level 2
    expect(JOB_LISTINGS['job_eko_forensics']?.minCareerLevel).toBe(2);

    const res = handleCommand(state, {
      type: 'AcceptJob',
      jobId: 'job_eko_forensics',
    });

    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('JOB_REQUIREMENTS_NOT_MET');
    expect(res.message).toContain('Requires career level 2');
  });

  it('promotes player to next career level when all advancement requirements are satisfied', () => {
    // Initially player is Trainee Analyst (Level 1)
    expect(state.career?.currentLevel).toBe(1);

    // Attempting promotion prematurely fails
    const failPromo = handleCommand(state, { type: 'PromoteCareer' });
    expect(failPromo.success).toBe(false);
    expect(failPromo.errorCode).toBe('CAREER_NOT_PROMOTION_ELIGIBLE');

    // Setup state fulfilling Level 2 requirements (100 XP, 2 jobs, skills >= 2)
    const qualifiedState: SimulationState = {
      ...state,
      career: {
        currentPathId: 'career_sec_analyst',
        currentLevel: 1,
        roleTitle: 'Trainee Analyst',
        employer: 'Cedarline Solutions',
        xp: 150,
        promotionsEarned: 0,
        promotionEligible: true,
      },
      jobs: {
        availableJobIds: ['job_eko_forensics'],
        activeJobs: [],
        completedJobHistory: [
          {
            jobId: 'job_01',
            title: 'Job 1',
            employer: 'Cedarline',
            completedAtSimulationSeconds: 10,
            payoutKobo: 50_000,
            careerXpEarned: 75,
            performanceRating: 'EXEMPLARY',
            feedbackNotes: '',
          },
          {
            jobId: 'job_02',
            title: 'Job 2',
            employer: 'Marina',
            completedAtSimulationSeconds: 20,
            payoutKobo: 50_000,
            careerXpEarned: 75,
            performanceRating: 'EXEMPLARY',
            feedbackNotes: '',
          },
        ],
      },
      skills: {
        ...(state.skills ?? {}),
        log_analysis: { id: 'log_analysis', level: 2, xp: 10, totalXp: 110 },
        network_fundamentals: { id: 'network_fundamentals', level: 2, xp: 20, totalXp: 120 },
        incident_response: { id: 'incident_response', level: 1, xp: 0, totalXp: 0 },
        security_fundamentals: { id: 'security_fundamentals', level: 2, xp: 30, totalXp: 130 },
        evidence_handling: { id: 'evidence_handling', level: 1, xp: 0, totalXp: 0 },
        reporting: { id: 'reporting', level: 1, xp: 0, totalXp: 0 },
        troubleshooting: { id: 'troubleshooting', level: 1, xp: 0, totalXp: 0 },
      },
    };

    const promoRes = handleCommand(qualifiedState, { type: 'PromoteCareer' });
    expect(promoRes.success).toBe(true);
    expect(promoRes.state.career?.currentLevel).toBe(2);
    expect(promoRes.state.career?.roleTitle).toBe('Junior SOC Analyst');
    expect(promoRes.state.career?.promotionsEarned).toBe(1);

    // Promotion bonus credited (₦250.00 / 25,000 kobo)
    expect(promoRes.state.player.moneyKobo).toBe(state.player.moneyKobo + 25_000);

    const promoEvent = promoRes.events.find(e => e.type === 'CAREER_PROMOTED');
    expect(promoEvent).toBeDefined();
    expect(promoEvent?.payload).toMatchObject({
      previousLevel: 1,
      newLevel: 2,
      roleTitle: 'Junior SOC Analyst',
    });
  });
});
