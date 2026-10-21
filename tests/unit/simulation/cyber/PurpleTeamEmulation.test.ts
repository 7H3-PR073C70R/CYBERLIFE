/**
 * Cyberlife — Milestone 18: Purple Team Adversary Emulation & M17 Adapter Tests
 *
 * Verifies:
 * - Emulation scenarios are mapped to MITRE ATT&CK techniques
 * - Pure emulation evaluator detects known adversary techniques
 * - Detection gap analysis properly identifies disabled or missing rules
 * - Scorecard computes coverage percentage and breakdown
 * - M17 Integration Adapter provides graceful fallback and telemetry conversion
 */

import { describe, it, expect } from 'vitest';
import {
  PURPLE_TEAM_SCENARIOS,
  DETECTION_RULES_CATALOG,
  SYNTHETIC_TELEMETRY_EVENTS,
  runPurpleTeamScenario,
  generatePurpleTeamScorecard,
  DefaultRedTeamAssessmentAdapter,
  EmulationCoverageResult,
} from '@/simulation/cyber/defensive';

describe('M18 Purple Team Adversary Emulation & Coverage Analysis', () => {
  describe('Adversary Emulation Scenarios Catalog', () => {
    it('contains valid MITRE-mapped scenarios across distinct tactics', () => {
      expect(PURPLE_TEAM_SCENARIOS.length).toBeGreaterThanOrEqual(6);

      for (const scenario of PURPLE_TEAM_SCENARIOS) {
        expect(scenario.id).toBeDefined();
        expect(scenario.name).toBeDefined();
        expect(scenario.mitreTechniqueId).toMatch(/^T\d+(\.\d+)?$/);
        expect(scenario.tactics.length).toBeGreaterThan(0);
        expect(scenario.targetHostId).toBeDefined();
        expect(scenario.relevantRuleIds.length).toBeGreaterThan(0);
        expect(scenario.expectedDetectionSummary).toBeDefined();
        expect(scenario.gapAnalysisIfMissed).toBeDefined();
      }
    });
  });

  describe('Atomic Scenario Emulation', () => {
    it('validates detection when relevant rules are enabled and telemetry exists', () => {
      const scenario = PURPLE_TEAM_SCENARIOS.find(s => s.id === 'SCEN-PT-02'); // Webshell Persistence
      expect(scenario).toBeDefined();

      const result = runPurpleTeamScenario(scenario!, DETECTION_RULES_CATALOG, SYNTHETIC_TELEMETRY_EVENTS);

      expect(result.status).toBe('DETECTED');
      expect(result.matchedRuleIds).toContain('RULE-SEC-002');
      expect(result.generatedAlertIds.length).toBeGreaterThan(0);
      expect(result.detectionNotes).toContain('Full detection verified');
    });

    it('identifies detection gap when relevant detection rule is disabled', () => {
      const scenario = PURPLE_TEAM_SCENARIOS.find(s => s.id === 'SCEN-PT-03'); // C2 Beaconing
      expect(scenario).toBeDefined();

      // Disable the relevant rule RULE-SEC-003
      const modifiedRules = DETECTION_RULES_CATALOG.map(r =>
        r.id === 'RULE-SEC-003' ? { ...r, isEnabled: false } : r
      );

      const result = runPurpleTeamScenario(scenario!, modifiedRules, SYNTHETIC_TELEMETRY_EVENTS);

      expect(result.status).toBe('UNDETECTED');
      expect(result.matchedRuleIds.length).toBe(0);
      expect(result.detectionNotes).toContain('Detection gap');
    });
  });

  describe('Purple Team Scorecard Generation', () => {
    it('computes coverage percentage and scenario counts correctly', () => {
      const resultsMap: Record<string, EmulationCoverageResult> = {};
      for (const scenario of PURPLE_TEAM_SCENARIOS) {
        resultsMap[scenario.id] = runPurpleTeamScenario(
          scenario,
          DETECTION_RULES_CATALOG,
          SYNTHETIC_TELEMETRY_EVENTS
        );
      }

      const scorecard = generatePurpleTeamScorecard(resultsMap);

      expect(scorecard.totalScenarios).toBe(PURPLE_TEAM_SCENARIOS.length);
      expect(scorecard.detectedCount).toBeGreaterThan(0);
      expect(scorecard.coveragePercentage).toBeGreaterThanOrEqual(80);
      expect(scorecard.evaluationNotes).toBeDefined();
    });

    it('reflects decreased coverage when multiple scenarios go undetected', () => {
      const emptyResults: Record<string, EmulationCoverageResult> = {};
      const scorecard = generatePurpleTeamScorecard(emptyResults);

      expect(scorecard.detectedCount).toBe(0);
      expect(scorecard.undetectedCount).toBe(PURPLE_TEAM_SCENARIOS.length);
      expect(scorecard.coveragePercentage).toBe(0);
      expect(scorecard.evaluationNotes).toContain('Substantial detection gaps');
    });
  });

  describe('M17 Red Team Assessment Integration Adapter', () => {
    it('provides graceful fallback to synthetic fixture assessments when M17 is in development', () => {
      const adapter = new DefaultRedTeamAssessmentAdapter();

      expect(adapter.isM17Available).toBe(false);
      const simulatedAssessments = adapter.getSimulatedAssessmentEvents();

      expect(simulatedAssessments.length).toBeGreaterThan(0);
      expect(simulatedAssessments.every(a => a.isSyntheticFixture)).toBe(true);
    });

    it('converts simulated assessment event into standard defensive telemetry', () => {
      const adapter = new DefaultRedTeamAssessmentAdapter();
      const assessment = adapter.getSimulatedAssessmentEvents()[0];
      expect(assessment).toBeDefined();
      const telemetry = adapter.convertToDefensiveTelemetry(assessment!);

      expect(telemetry.id).toBe(`tel-m17-${assessment!.assessmentId}`);
      expect(telemetry.eventSource).toContain('m17-assessment');
      expect(telemetry.sourceHostId).toBe(assessment!.targetHost);
      expect(telemetry.isKnownBenign).toBe(false);
      expect(telemetry.tags).toContain('adversary_emulation');
    });
  });
});
