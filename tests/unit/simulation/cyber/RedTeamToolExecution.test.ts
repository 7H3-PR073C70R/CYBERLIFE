/**
 * Cyberlife — Milestone 17: Red Team Simulated Tool Execution Unit Tests
 *
 * Verifies deterministic in-memory execution of assessment tools:
 * - tool-recon-enum (Passive inventory query & port enumeration)
 * - tool-config-smb-audit (SMB2 packet signing analysis)
 * - tool-web-api-idor (Simulated Broken Object-Level Authorization check)
 * - tool-auth-header-spoof (Reverse proxy header trust audit)
 * - tool-crypto-cipher-eval (TLS cipher suite assessment - benign test case)
 * - Cryptographic SHA-256 evidence generation & provenance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RedTeamEngine } from '@/simulation/cyber/redteam/redTeamEngine';
import { createInitialRedTeamAssessmentState } from '@/simulation/cyber/redteam/scenarioFixtures';
import { RedTeamAssessmentState } from '@/simulation/cyber/redteam/types';

describe('RedTeam Simulated Tool Execution Engine', () => {
  let assessmentState: RedTeamAssessmentState;

  beforeEach(() => {
    // Start with an accepted RoE state for technical testing
    assessmentState = {
      ...createInitialRedTeamAssessmentState(),
      isAcceptedByPlayer: true,
      activePhase: 'RECON_DISCOVERY',
    };
  });

  it('executes "tool-recon-enum" deterministically on app-portal-01', () => {
    const result1 = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'app-portal-01',
      toolId: 'tool-recon-enum',
      currentSimTime: 28900,
    });

    expect(result1.status).toBe('SUCCESS');
    expect(result1.targetId).toBe('app-portal-01');
    expect(result1.observations.some(obs => obs.includes('10.0.1.10'))).toBe(true);
    expect(result1.executionLogs.some(log => log.includes('Passive reconnaissance complete'))).toBe(true);

    // Repeated execution is deterministic
    const result2 = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'app-portal-01',
      toolId: 'tool-recon-enum',
      currentSimTime: 28900,
    });
    expect(result2.observations).toEqual(result1.observations);
    expect(result2.executionLogs).toEqual(result1.executionLogs);
  });

  it('executes "tool-config-smb-audit" on filesrv-01 and generates cryptographic evidence', () => {
    const result = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'filesrv-01',
      toolId: 'tool-config-smb-audit',
      currentSimTime: 29000,
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.candidateFindingId).toBe('VULN-CEDAR-002');
    expect(result.observations.some(o => o.includes('SMB2 signing is NOT enforced'))).toBe(true);

    // Evidence validation
    expect(result.generatedEvidence).toBeDefined();
    const evidence = result.generatedEvidence!;
    expect(evidence.targetId).toBe('filesrv-01');
    expect(evidence.hashSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(evidence.artifactSnippet.some(line => line.includes('SMB2_NEGOTIATE_RESPONSE'))).toBe(true);
  });

  it('executes "tool-web-api-idor" on app-portal-01 and discovers BOLA vulnerability', () => {
    const result = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'app-portal-01',
      toolId: 'tool-web-api-idor',
      currentSimTime: 29100,
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.candidateFindingId).toBe('VULN-CEDAR-001');
    expect(result.observations.some(o => o.includes('lacks object ownership verification'))).toBe(true);
    expect(result.generatedEvidence).toBeDefined();
    expect(result.generatedEvidence?.hashSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.generatedEvidence?.artifactSnippet.some(line => line.includes('BOLA/IDOR Confirmed'))).toBe(true);
  });

  it('executes "tool-auth-header-spoof" on api-gw-01 and identifies header trust weakness', () => {
    const result = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'api-gw-01',
      toolId: 'tool-auth-header-spoof',
      currentSimTime: 29200,
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.candidateFindingId).toBe('VULN-CEDAR-003');
    expect(result.observations.some(o => o.includes('fails to strip client-supplied X-Internal-Role headers'))).toBe(true);
    expect(result.generatedEvidence?.hashSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('executes "tool-crypto-cipher-eval" on web-quote-01 and identifies benign configuration', () => {
    const result = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'web-quote-01',
      toolId: 'tool-crypto-cipher-eval',
      currentSimTime: 29300,
    });

    expect(result.status).toBe('DEFENSE_PREVENTED');
    expect(result.candidateFindingId).toBe('VULN-CEDAR-004');
    expect(result.observations.some(o => o.includes('strictly enforces TLS 1.2 and TLS 1.3'))).toBe(true);
    expect(result.observations.some(o => o.includes('BENIGN FALSE POSITIVE'))).toBe(true);
  });

  it('safely handles non-applicable tool/target pairings', () => {
    // Running SMB tool on app-portal-01 (which does not expose port 445 SMB)
    const result = RedTeamEngine.executeToolAction(assessmentState, {
      targetId: 'app-portal-01',
      toolId: 'tool-config-smb-audit',
      currentSimTime: 29400,
    });

    expect(result.status).toBe('INCONCLUSIVE');
    expect(result.observations.some(o => o.includes('does not run an SMB service'))).toBe(true);
    expect(result.generatedEvidence).toBeUndefined();
    expect(result.candidateFindingId).toBeUndefined();
  });
});
