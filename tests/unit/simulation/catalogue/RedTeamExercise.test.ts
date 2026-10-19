/**
 * Cyberlife — Milestone 11: Red Team Exercise Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../../../src/simulation/core/initialState';
import { handleCommand } from '../../../../src/simulation/commands/commandHandler';
import { SimulationState } from '../../../../src/simulation/core/types';

describe('Milestone 11: Red Team Practical Exercise', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('starts the Red Team exercise with authorization scope defined', () => {
    const res = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_red_authorized_recon_path',
    });

    expect(res.success).toBe(true);
    expect(res.state.catalogue?.activeExerciseId).toBe('ex_red_authorized_recon_path');
    const exState = res.state.catalogue?.activeExerciseState as Record<string, unknown>;
    expect(exState.acceptedRoe).toBe(false);
  });

  it('enforces Rules of Engagement acceptance before finding submission', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_red_authorized_recon_path',
    }).state;

    // Accept RoE
    const roeRes = handleCommand(current, {
      type: 'SubmitExerciseAction',
      actionType: 'ACCEPT_ROE',
    });

    expect(roeRes.success).toBe(true);
    const exState = roeRes.state.catalogue?.activeExerciseState as Record<string, unknown>;
    expect(exState.acceptedRoe).toBe(true);
    expect(exState.completedObjectiveIds).toContain('obj_red_accept_roe');
  });

  it('submits a structured Red Team finding report within authorized scope', () => {
    let current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_red_authorized_recon_path',
    }).state;

    current = handleCommand(current, {
      type: 'SubmitExerciseAction',
      actionType: 'ACCEPT_ROE',
    }).state;

    const findingRes = handleCommand(current, {
      type: 'SubmitRedTeamFinding',
      findingData: {
        title: 'Over-permissioned Domain Share Lateral Movement',
        targetHost: 'filesrv-01',
        targetService: 'SMB (Port 445)',
        severity: 'HIGH',
        attackVector:
          'Stolen service account session ticket reused on unrestricted internal file share.',
        evidenceId: 'EV-SMB-AUTH-TICKET-01',
        rootCause: 'Privileged service account tokens accepted without host-origin verification.',
        remediationAdvice:
          'Enforce strict SMB signing, restrict svc-aster logon rights to app-portal-01 only.',
      },
    });

    expect(findingRes.success).toBe(true);
    expect(findingRes.state.catalogue?.redFindings).toHaveLength(1);
    expect(findingRes.state.catalogue?.redFindings[0]?.targetHost).toBe('filesrv-01');
    expect(findingRes.state.catalogue?.redFindings[0]?.severity).toBe('HIGH');
  });

  it('completes the Red Team exercise and awards career skills', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_red_authorized_recon_path',
    }).state;

    const initialAtkXp = current.skills?.attack_simulation.totalXp ?? 0;
    const initialMoney = current.player.moneyKobo;

    const compRes = handleCommand(current, {
      type: 'CompleteCatalogueExercise',
      exerciseId: 'ex_red_authorized_recon_path',
    });

    expect(compRes.success).toBe(true);
    expect(compRes.state.catalogue?.completedExerciseIds).toContain('ex_red_authorized_recon_path');
    expect(compRes.state.skills?.attack_simulation.totalXp).toBe(initialAtkXp + 50);
    expect(compRes.state.player.moneyKobo).toBe(initialMoney + 100_000); // ₦1,000.00
  });
});
