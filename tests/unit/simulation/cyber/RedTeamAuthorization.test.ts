/**
 * Cyberlife — Milestone 17: Red Team Scope & Authorization Unit Tests
 *
 * Tests the authoritative domain authorization gate:
 * - In-scope authorized asset execution
 * - Out-of-scope target rejection (e.g., dc-core-01, mon-siem-01, c2-nexus-01)
 * - Prohibited techniques / action category enforcement
 * - Pre-acceptance lock & expired RoE rejection
 * - Invariant: Zero state mutation on rejected attempts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RedTeamAuthorizationGate } from '@/simulation/cyber/redteam/authorizationGate';
import { RedTeamEngine } from '@/simulation/cyber/redteam/redTeamEngine';
import { createInitialRedTeamAssessmentState } from '@/simulation/cyber/redteam/scenarioFixtures';
import { RedTeamAssessmentState, ActionCategory } from '@/simulation/cyber/redteam/types';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import {
  handleAcceptRulesOfEngagement,
  handleExecuteRedTeamAction,
} from '@/simulation/cyber/redteam/redTeamCommandHandler';

describe('RedTeam Authorization Gate & Scope Validation', () => {
  let assessmentState: RedTeamAssessmentState;

  beforeEach(() => {
    assessmentState = createInitialRedTeamAssessmentState();
  });

  it('rejects execution if the player has not formally accepted the Rules of Engagement', () => {
    expect(assessmentState.isAcceptedByPlayer).toBe(false);

    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      assessmentState,
      'app-portal-01',
      'RECONNAISSANCE',
      'tool-recon-enum',
      28800
    );

    expect(gateResult.isAuthorized).toBe(false);
    expect(gateResult.decision).toBe('BLOCKED_UNAUTHORIZED');
    expect(gateResult.reason).toContain('Rules of Engagement');
    expect(gateResult.reason).toContain('have not been formally accepted');
  });

  it('allows execution on authorized in-scope assets after RoE acceptance', () => {
    const acceptedState = {
      ...assessmentState,
      isAcceptedByPlayer: true,
      activePhase: 'RECON_DISCOVERY' as const,
    };

    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      acceptedState,
      'app-portal-01',
      'RECONNAISSANCE',
      'tool-recon-enum',
      28900
    );

    expect(gateResult.isAuthorized).toBe(true);
    expect(gateResult.decision).toBe('AUTHORIZED');
    expect(gateResult.targetedResource).toBe('app-portal-01');
  });

  it('strictly rejects explicitly out-of-scope target "dc-core-01"', () => {
    const acceptedState = {
      ...assessmentState,
      isAcceptedByPlayer: true,
    };

    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      acceptedState,
      'dc-core-01',
      'CONFIG_AUDIT',
      'tool-config-smb-audit',
      28900
    );

    expect(gateResult.isAuthorized).toBe(false);
    expect(gateResult.decision).toBe('BLOCKED_OUT_OF_SCOPE');
    expect(gateResult.reason).toContain('OUT OF SCOPE');
    expect(gateResult.reason).toContain('dc-core-01');
  });

  it('strictly rejects out-of-scope SIEM monitoring host "mon-siem-01"', () => {
    const acceptedState = {
      ...assessmentState,
      isAcceptedByPlayer: true,
    };

    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      acceptedState,
      'mon-siem-01',
      'RECONNAISSANCE',
      'tool-recon-enum',
      28900
    );

    expect(gateResult.isAuthorized).toBe(false);
    expect(gateResult.decision).toBe('BLOCKED_OUT_OF_SCOPE');
  });

  it('strictly rejects non-existent or unknown target identifiers', () => {
    const acceptedState = {
      ...assessmentState,
      isAcceptedByPlayer: true,
    };

    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      acceptedState,
      'rogue-server-999',
      'RECONNAISSANCE',
      'tool-recon-enum',
      28900
    );

    expect(gateResult.isAuthorized).toBe(false);
    expect(gateResult.decision).toBe('BLOCKED_OUT_OF_SCOPE');
    expect(gateResult.reason).toContain('not registered in the authorized client target inventory');
  });

  it('rejects prohibited action categories (e.g. DoS / lateral egress)', () => {
    const acceptedState = {
      ...assessmentState,
      isAcceptedByPlayer: true,
    };

    // Cast an unpermitted action category
    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      acceptedState,
      'app-portal-01',
      'UNAUTHORIZED_EXPLOIT' as unknown as ActionCategory,
      'denial_of_service_flood',
      28900
    );

    expect(gateResult.isAuthorized).toBe(false);
    expect(gateResult.decision).toBe('BLOCKED_PROHIBITED');
  });

  it('rejects action if RoE is marked expired or inactive', () => {
    const inactiveRoEState = {
      ...assessmentState,
      isAcceptedByPlayer: true,
      roe: {
        ...assessmentState.roe,
        isSignedAndActive: false,
      },
    };

    const gateResult = RedTeamAuthorizationGate.evaluateScope(
      inactiveRoEState,
      'app-portal-01',
      'RECONNAISSANCE',
      'tool-recon-enum',
      28900
    );

    expect(gateResult.isAuthorized).toBe(false);
    expect(gateResult.decision).toBe('BLOCKED_EXPIRED');
  });

  it('ensures RedTeamEngine.executeToolAction returns BLOCKED result and logs violation when unauthorized', () => {
    // Attempt action without RoE acceptance
    const actionResult = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'dc-core-01',
      toolId: 'tool-config-smb-audit',
      currentSimTime: 28900,
    });

    expect(actionResult.status).toBe('BLOCKED');
    expect(actionResult.scopeEvaluation.isAuthorized).toBe(false);
    expect(actionResult.executionLogs.some(log => log.includes('ACTION BLOCKED') || log.includes('ACTION REJECTED'))).toBe(true);
    expect(actionResult.observations.some(obs => obs.includes('Security boundary enforced'))).toBe(true);
  });

  it('ensures command handler rejects out-of-scope dispatch without state mutation', () => {
    const rootState = createInitialSimulationState();
    expect(rootState.redTeamAssessment?.isAcceptedByPlayer).toBe(false);

    // 1. Accept RoE via command handler
    const acceptedResult = handleAcceptRulesOfEngagement(
      rootState,
      {
        type: 'AcceptRulesOfEngagement',
        assessmentId: 'ROE-2026-CEDAR-RED-01',
        assessorSignature: 'Lead PenTester',
      }
    );
    expect(acceptedResult.events[0]?.type).toBe('RED_TEAM_ROE_ACCEPTED');
    expect(acceptedResult.state.redTeamAssessment?.isAcceptedByPlayer).toBe(true);

    const historyLengthBefore = acceptedResult.state.redTeamAssessment?.actionHistory.length ?? 0;

    // 2. Attempt unauthorized action against dc-core-01
    const rejectedResult = handleExecuteRedTeamAction(
      acceptedResult.state,
      {
        type: 'ExecuteRedTeamAction',
        targetId: 'dc-core-01',
        toolId: 'tool-config-smb-audit',
      }
    );

    expect(rejectedResult.events[0]?.type).toBe('RED_TEAM_ACTION_EXECUTED');
    expect((rejectedResult.events[0]?.payload as { status: string }).status).toBe('BLOCKED');
    // History should not record successful execution of unauthorized target
    expect(rejectedResult.state.redTeamAssessment?.actionHistory.length).toBe(historyLengthBefore);
  });
});
