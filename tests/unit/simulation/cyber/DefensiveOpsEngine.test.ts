/**
 * Cyberlife — Milestone 18: Blue Team Defensive Operations Engine Unit Tests
 *
 * Verifies:
 * - Sigma detection rules match appropriate synthetic events
 * - Benign/misleading events (authorized SOC scanner) do not trigger attack alerts
 * - Severity and confidence are strictly separated
 * - Alert deduplication functions deterministically
 * - Mathematical derived priority calculation (P1 to P4)
 * - Defensive response actions (isolate, restore, block, lock) update state safely
 * - Invalid response actions are safely rejected with descriptive errors
 * - Operation Lagos Shield incident report ground-truth evaluation
 */

import { describe, it, expect } from 'vitest';
import {
  SYNTHETIC_TELEMETRY_EVENTS,
  DETECTION_RULES_CATALOG,
  evaluateDetectionRules,
  calculateDerivedPriority,
  filterAlerts,
  executeDefensiveAction,
  createInitialDefensiveOpsState,
  evaluateDefensiveIncidentReport,
} from '@/simulation/cyber/defensive';
import { IncidentReportSubmission } from '@/simulation/cyber/defensive/types';

describe('M18 Blue Team Defensive Operations Engine', () => {
  describe('Detection Rules & Alert Generation', () => {
    it('evaluates detection rules against synthetic telemetry and generates expected alerts', () => {
      const alerts = evaluateDetectionRules(SYNTHETIC_TELEMETRY_EVENTS, DETECTION_RULES_CATALOG);

      expect(alerts.length).toBeGreaterThan(0);

      // Verify specific expected detections
      const ruleIds = alerts.map(a => a.ruleId);
      expect(ruleIds).toContain('RULE-SEC-001'); // Password spraying
      expect(ruleIds).toContain('RULE-SEC-002'); // Webshell execution
      expect(ruleIds).toContain('RULE-SEC-003'); // C2 Beaconing
      expect(ruleIds).toContain('RULE-SEC-004'); // DNS Exfiltration
      expect(ruleIds).toContain('RULE-SEC-005'); // Wildcard IAM grant
      expect(ruleIds).toContain('RULE-SEC-006'); // LLM Prompt Injection
      expect(ruleIds).toContain('RULE-SEC-007'); // FIM tampering
    });

    it('keeps detection severity and confidence strictly distinct', () => {
      for (const rule of DETECTION_RULES_CATALOG) {
        expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(rule.severity);
        expect(rule.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(rule.confidenceScore).toBeLessThanOrEqual(100);
      }

      const alerts = evaluateDetectionRules(SYNTHETIC_TELEMETRY_EVENTS, DETECTION_RULES_CATALOG);
      for (const alert of alerts) {
        expect(alert.severity).toBeDefined();
        expect(alert.confidenceScore).toBeDefined();
        // Confidence is a number, severity is a categorical string
        expect(typeof alert.confidenceScore).toBe('number');
        expect(typeof alert.severity).toBe('string');
      }
    });

    it('does not generate attack alerts for benign authorized SOC OpenVAS scanner event', () => {
      const benignScannerEvent = SYNTHETIC_TELEMETRY_EVENTS.find(e => e.id === 'tel-016');
      expect(benignScannerEvent).toBeDefined();
      expect(benignScannerEvent?.isKnownBenign).toBe(true);

      const alerts = evaluateDetectionRules([benignScannerEvent!], DETECTION_RULES_CATALOG);
      // Benign authorized scan should not trigger attack rules (like webshell, C2, prompt injection)
      const attackAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
      expect(attackAlerts.length).toBe(0);
    });

    it('deduplicates alerts for repeated events with the same rule and source', () => {
      // Create duplicate events stream
      const duplicatedEvents = [...SYNTHETIC_TELEMETRY_EVENTS, ...SYNTHETIC_TELEMETRY_EVENTS];
      const singlePassAlerts = evaluateDetectionRules(SYNTHETIC_TELEMETRY_EVENTS, DETECTION_RULES_CATALOG);
      const dedupedAlerts = evaluateDetectionRules(duplicatedEvents, DETECTION_RULES_CATALOG);

      expect(dedupedAlerts.length).toBe(singlePassAlerts.length);
    });
  });

  describe('Derived Priority Calculation', () => {
    it('calculates P1_CRITICAL for critical severity, high confidence, and critical assets', () => {
      const priority = calculateDerivedPriority('CRITICAL', 95, 'host-broadst-db01');
      expect(priority.level).toBe('P1_CRITICAL');
      expect(priority.score).toBeGreaterThanOrEqual(80);
      expect(priority.formulaRationale).toContain('P1_CRITICAL');
    });

    it('calculates P4_LOW for low severity, low confidence, and non-critical assets', () => {
      const priority = calculateDerivedPriority('LOW', 30, 'dev-laptop-09');
      expect(priority.level).toBe('P4_LOW');
      expect(priority.score).toBeLessThan(40);
    });

    it('correctly orders priorities across severity gradations', () => {
      const pCrit = calculateDerivedPriority('CRITICAL', 90, 'srv-core');
      const pHigh = calculateDerivedPriority('HIGH', 80, 'srv-core');
      const pMed = calculateDerivedPriority('MEDIUM', 60, 'srv-core');
      const pLow = calculateDerivedPriority('LOW', 40, 'srv-core');

      expect(pCrit.score).toBeGreaterThan(pHigh.score);
      expect(pHigh.score).toBeGreaterThan(pMed.score);
      expect(pMed.score).toBeGreaterThan(pLow.score);
    });
  });

  describe('Alert Queue Filtering', () => {
    it('filters alerts by status, severity, priority, and text search', () => {
      const initialAlerts = evaluateDetectionRules(SYNTHETIC_TELEMETRY_EVENTS, DETECTION_RULES_CATALOG);

      const critAlerts = filterAlerts(initialAlerts, { severity: 'CRITICAL' });
      expect(critAlerts.every(a => a.severity === 'CRITICAL')).toBe(true);

      const p1Alerts = filterAlerts(initialAlerts, { priority: 'P1_CRITICAL' });
      expect(p1Alerts.every(a => a.priority.level === 'P1_CRITICAL')).toBe(true);

      const searched = filterAlerts(initialAlerts, { searchQuery: 'Webshell' });
      expect(searched.length).toBeGreaterThan(0);
      expect(searched[0]?.title.toLowerCase()).toContain('webshell');
    });
  });

  describe('Simulated Defensive Response Engine', () => {
    it('executes ISOLATE_ENDPOINT and updates isolatedHostIds and audit log', () => {
      const state = createInitialDefensiveOpsState();
      const targetHost = 'app-portal-01';

      const res = executeDefensiveAction(
        state,
        'ISOLATE_ENDPOINT',
        targetHost,
        'Contain webshell activity from suspicious external IP',
        28100,
        'Lead Blue Analyst'
      );

      expect(res.success).toBe(true);
      expect(res.nextState.isolatedHostIds).toContain(targetHost);
      expect(res.action).toBeDefined();
      expect(res.action?.targetEntityId).toBe(targetHost);
      expect(res.action?.actionType).toBe('ISOLATE_ENDPOINT');
      expect(res.nextState.executedResponses.length).toBe(1);
    });

    it('rejects isolating an already isolated endpoint', () => {
      const state = createInitialDefensiveOpsState();
      const targetHost = 'app-portal-01';

      const firstRes = executeDefensiveAction(
        state,
        'ISOLATE_ENDPOINT',
        targetHost,
        'Initial containment',
        28100
      );
      expect(firstRes.success).toBe(true);

      const secondRes = executeDefensiveAction(
        firstRes.nextState,
        'ISOLATE_ENDPOINT',
        targetHost,
        'Duplicate isolation attempt',
        28200
      );
      expect(secondRes.success).toBe(false);
      expect(secondRes.error).toBe('ALREADY_ISOLATED');
    });

    it('executes RESTORE_ENDPOINT and un-isolates previously isolated host', () => {
      const state = createInitialDefensiveOpsState();
      const targetHost = 'app-portal-01';

      const isoRes = executeDefensiveAction(
        state,
        'ISOLATE_ENDPOINT',
        targetHost,
        'Containment',
        28100
      );

      const restoreRes = executeDefensiveAction(
        isoRes.nextState,
        'RESTORE_ENDPOINT',
        targetHost,
        'System forensically sanitized and patched',
        29000
      );

      expect(restoreRes.success).toBe(true);
      expect(restoreRes.nextState.isolatedHostIds).not.toContain(targetHost);
    });

    it('executes BLOCK_INDICATOR and registers the IP in perimeter blocklist', () => {
      const state = createInitialDefensiveOpsState();
      const c2Ip = '198.51.100.45';

      const res = executeDefensiveAction(
        state,
        'BLOCK_INDICATOR',
        c2Ip,
        'Block active Phantom Weaver C2 server IP',
        28300
      );

      expect(res.success).toBe(true);
      expect(res.nextState.blockedIndicators).toContain(c2Ip);
    });

    it('rejects defensive action when target is empty or reason is insufficient', () => {
      const state = createInitialDefensiveOpsState();

      const emptyTarget = executeDefensiveAction(
        state,
        'ISOLATE_ENDPOINT',
        '   ',
        'Valid reason provided',
        28000
      );
      expect(emptyTarget.success).toBe(false);
      expect(emptyTarget.error).toBe('INVALID_TARGET');

      const shortReason = executeDefensiveAction(
        state,
        'ISOLATE_ENDPOINT',
        'app-portal-01',
        'bad',
        28000
      );
      expect(shortReason.success).toBe(false);
      expect(shortReason.error).toBe('INSUFFICIENT_JUSTIFICATION');
    });
  });

  describe('Ground-Truth Incident Report Evaluation', () => {
    it('scores 100% and marks mission complete when accurate report is submitted', () => {
      const accurateSubmission: IncidentReportSubmission = {
        incidentTitle: 'Operation Lagos Shield: Broad Street Perimeter Infiltration',
        suspectedAttacker: 'Phantom Weaver (APT)',
        initialCompromisedHostId: 'app-portal-01',
        primaryVector: 'Prompt Injection on AI Service & Webshell Dropper',
        falsePositiveHostId: 'mon-siem-01',
        confirmedFindingIds: ['hyp-001', 'hyp-002'],
        appliedResponseActionIds: ['act-01', 'act-02'],
        rootCauseSummary:
          'Adversary exploited prompt injection on public Lagos chatbot API, obtained initial shell on app-portal-01, planted webshell, and established C2 to 198.51.100.45. Authorized SOC scanner mon-siem-01 correctly identified as benign.',
        submittedAtSimTime: 29500,
      };

      const vaultEvidenceIds = ['EVD-2026-001', 'EVD-2026-003', 'EVD-2026-004'];
      const executedResponses = [
        {
          id: 'act-01',
          actionType: 'ISOLATE_ENDPOINT' as const,
          targetEntityId: 'app-portal-01',
          targetLabel: 'Application Portal',
          executedAtSimTime: 28100,
          actor: 'Lead Analyst',
          reason: 'Containment',
          isSuccess: true,
          consequences: ['Host isolated'],
          auditLogEntry: 'Host isolated',
          affectedEntityIds: ['app-portal-01'],
        },
        {
          id: 'act-02',
          actionType: 'BLOCK_INDICATOR' as const,
          targetEntityId: '198.51.100.45',
          targetLabel: 'Malicious C2 Endpoint',
          executedAtSimTime: 28200,
          actor: 'Lead Analyst',
          reason: 'C2 drop',
          isSuccess: true,
          consequences: ['Indicator dropped'],
          auditLogEntry: 'Indicator dropped',
          affectedEntityIds: ['198.51.100.45'],
        },
      ];

      const result = evaluateDefensiveIncidentReport(accurateSubmission, vaultEvidenceIds, executedResponses);

      expect(result.scorePercentage).toBe(100);
      expect(result.isApproved).toBe(true);
      expect(result.critiqueSummary).toContain('Approved');
    });

    it('penalizes score when wrong compromised host or false positive is identified', () => {
      const flawedSubmission: IncidentReportSubmission = {
        incidentTitle: 'Operation Lagos Shield Incident Report',
        suspectedAttacker: 'Unknown Petty Hacker',
        initialCompromisedHostId: 'mon-siem-01', // Incorrect: That was the authorized scanner!
        primaryVector: 'Phishing email',
        falsePositiveHostId: 'app-portal-01', // Incorrect: This was the actual compromised host!
        confirmedFindingIds: [],
        appliedResponseActionIds: [],
        rootCauseSummary: 'Confused report blaming the internal security scanner.',
        submittedAtSimTime: 29500,
      };

      const result = evaluateDefensiveIncidentReport(flawedSubmission, [], []);

      expect(result.scorePercentage).toBeLessThan(50);
      expect(result.isApproved).toBe(false);
      expect(result.critiqueSummary).toContain('Requires Revision');
    });
  });
});
