import { describe, it, expect } from 'vitest';
import {
  MULTI_ROLE_SCENARIOS,
  PERSISTENT_NARRATIVE_FLAGS,
  getScenarioForRole,
} from '@/simulation/narrative/investigationNarrative';
import { CAREER_PATHS } from '@/simulation/career/careerDefinitions';

describe('Multi-Role Investigation Narrative & Career Integration', () => {
  describe('Multi-Role Scenario Scoping', () => {
    it('defines multi-role approaches for the Aster Incident without forcing a single morality', () => {
      const asterScenario = MULTI_ROLE_SCENARIOS.find(s => s.scenarioId === 'scen_aster_incident_multirole')!;
      expect(asterScenario).toBeDefined();

      const blueApproach = getScenarioForRole('scen_aster_incident_multirole', 'BLUE_DEFENDER')!;
      expect(blueApproach.primaryObjective).toContain('Isolate compromised service account');
      expect(blueApproach.keyToolsUsed).toContain('tool_incident');
      expect(blueApproach.rewardKobo).toBe(250_000);

      const purpleApproach = getScenarioForRole('scen_aster_incident_multirole', 'PURPLE_ENGINEER')!;
      expect(purpleApproach.primaryObjective).toContain('author Sigma rules');
      expect(purpleApproach.keyToolsUsed).toContain('tool_rule_tuner');

      const redApproach = getScenarioForRole('scen_aster_incident_multirole', 'RED_SIMULATOR')!;
      expect(redApproach.primaryObjective).toContain('lateral traversal via svc-aster');
      expect(redApproach.keyToolsUsed).toContain('tool_recon_path');

      const investigatorApproach = getScenarioForRole('scen_aster_incident_multirole', 'INDEPENDENT_INVESTIGATOR')!;
      expect(investigatorApproach.primaryObjective).toContain('audit vendor liability');
      expect(investigatorApproach.clientDeliverable).toContain('Bug Bounty Disclosure');
    });

    it('defines multi-role approaches for the Curbside Removable Media Incident', () => {
      const usbScenario = MULTI_ROLE_SCENARIOS.find(s => s.scenarioId === 'scen_removable_media_multirole')!;
      expect(usbScenario).toBeDefined();

      const blue = usbScenario.approaches.BLUE_DEFENDER;
      expect(blue.clientDeliverable).toContain('Disinfection Certificate');

      const purple = usbScenario.approaches.PURPLE_ENGINEER;
      expect(purple.primaryObjective).toContain('parent-child telemetry');

      const red = usbScenario.approaches.RED_SIMULATOR;
      expect(red.primaryObjective).toContain('visitor procedures and test badge escort');

      const investigator = usbScenario.approaches.INDEPENDENT_INVESTIGATOR;
      expect(investigator.primaryObjective).toContain('isolated air-gapped lab');
    });
  });

  describe('Persistent Story Flags & Narrative Consequences', () => {
    it('tracks persistent world flags for player decisions', () => {
      expect(PERSISTENT_NARRATIVE_FLAGS.length).toBeGreaterThanOrEqual(6);

      const flagKeys = PERSISTENT_NARRATIVE_FLAGS.map(f => f.flagKey);
      expect(flagKeys).toContain('flag_marcus_protected');
      expect(flagKeys).toContain('flag_marcus_exposed');
      expect(flagKeys).toContain('flag_aster_quiet_remediation');
      expect(flagKeys).toContain('flag_femi_audit_passed');
      expect(flagKeys).toContain('flag_bounty_independent_claimed');
      expect(flagKeys).toContain('flag_usb_airgap_analyzed');
      expect(flagKeys).toContain('flag_physical_tailgating_reported');
    });

    it('defaults all consequential narrative flags to false initially', () => {
      for (const flag of PERSISTENT_NARRATIVE_FLAGS) {
        expect(flag.defaultValue).toBe(false);
      }
    });
  });

  describe('Career System Compatibility', () => {
    it('verifies all 6 career tracks exist with valid levels and progression milestones', () => {
      const careerTracks = Object.keys(CAREER_PATHS);
      expect(careerTracks).toContain('career_sec_analyst');
      expect(careerTracks).toContain('career_it_support');
      expect(careerTracks).toContain('career_red_sec');
      expect(careerTracks).toContain('career_purple_sec');
      expect(careerTracks).toContain('career_bounty_hunter');
      expect(careerTracks).toContain('career_independent_investigator');

      for (const trackId of careerTracks) {
        const path = CAREER_PATHS[trackId as keyof typeof CAREER_PATHS];
        expect(path.levels.length).toBeGreaterThanOrEqual(3);
        expect(path.levels[0]?.level).toBe(1);
        expect(path.levels[2]?.minXp).toBeGreaterThanOrEqual(300);
      }
    });
  });
});
