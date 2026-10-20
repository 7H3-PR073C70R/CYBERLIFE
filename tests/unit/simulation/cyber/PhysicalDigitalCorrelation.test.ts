import { describe, it, expect } from 'vitest';
import { HumanPhysicalEngine } from '@/simulation/cyber/humanPhysical/HumanPhysicalEngine';
import {
  CORRELATED_INCIDENT_REMOVABLE_MEDIA,
  PHYSICAL_ACCESS_LOGS,
  REMOVABLE_MEDIA_TELEMETRY,
} from '@/simulation/cyber/humanPhysical/fixtures';

describe('Shared Physical-to-Digital Evidence Correlation', () => {
  it('correlates physical turnstile/door badge swipe with endpoint USB connection telemetry', () => {
    const result = HumanPhysicalEngine.correlateEvidenceChain(
      CORRELATED_INCIDENT_REMOVABLE_MEDIA,
      PHYSICAL_ACCESS_LOGS,
      REMOVABLE_MEDIA_TELEMETRY
    );

    expect(result.isCorrelated).toBe(true);
    expect(result.physicalEvent).toBeDefined();
    expect(result.physicalEvent?.holderName).toBe('Marcus Adebayo');
    expect(result.digitalEvent).toBeDefined();
    expect(result.digitalEvent?.deviceSerial).toBe('SN-KINGSTON-DT50-9941A');
    expect(result.timelineSummary.length).toBeGreaterThanOrEqual(3);
  });

  it('contains synchronized chronology from physical room entry to network beaconing', () => {
    const result = HumanPhysicalEngine.correlateEvidenceChain(
      CORRELATED_INCIDENT_REMOVABLE_MEDIA,
      PHYSICAL_ACCESS_LOGS,
      REMOVABLE_MEDIA_TELEMETRY
    );

    const summaryText = result.timelineSummary.join('\n');
    expect(summaryText).toContain('[PHYSICAL]');
    expect(summaryText).toContain('[ENDPOINT]');
    expect(summaryText).toContain('[PROCESS]');
    expect(summaryText).toContain('[NETWORK]');
    expect(summaryText).toContain('10.0.4.1');
  });

  it('supports multi-role investigation workflows for Blue, Purple, Red, and Investigator', () => {
    const roles = CORRELATED_INCIDENT_REMOVABLE_MEDIA.investigativeRoles;

    // Blue Team
    expect(roles.blueTeamAction).toContain('isolate host');
    expect(roles.blueTeamAction).toContain('ws-fin-04');

    // Purple Team
    expect(roles.purpleTeamAction).toContain('Replay synthetic USB child-process telemetry');
    expect(roles.purpleTeamAction).toContain('SIEM');

    // Red Team
    expect(roles.redTeamAssessmentAction).toContain('authorized physical social pretext');

    // Investigator
    expect(roles.investigatorAuditAction).toContain('Correlate physical badge swipe');
    expect(roles.investigatorAuditAction).toContain('chain of custody');
  });
});
