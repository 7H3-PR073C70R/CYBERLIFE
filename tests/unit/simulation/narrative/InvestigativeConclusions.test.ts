import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import {
  calculateConclusionConfidence,
} from '@/simulation/narrative/narrativeEvaluator';
import { INVESTIGATIVE_CONCLUSIONS } from '@/simulation/narrative/narrativeData';

describe('Milestone 14 — Investigative Evidence & Conclusions', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  describe('Evidence Vault Preservation', () => {
    it('records and preserves cryptographic evidence artifacts into the Evidence Vault', () => {
      const result = engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-001',
        source: 'app-portal-01',
        title: 'Aster Core Configuration Snapshot',
        description: 'Captured systemd unit and active environment variables for svc-aster.',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        tags: ['config', 'forensic_snapshot'],
      });

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(1);

      const event = result.events[0]!;
      expect(event.type).toBe('INVESTIGATIVE_EVIDENCE_RECORDED');
      expect(event.payload).toMatchObject({
        evidenceId: 'EVD-2026-001',
        source: 'app-portal-01',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });

      const vault = engine.getState().narrative!.evidenceVault;
      expect(vault['EVD-2026-001']).toBeDefined();
      expect(vault['EVD-2026-001']!.integrityVerified).toBe(true);
      expect(vault['EVD-2026-001']!.tags).toContain('forensic_snapshot');
    });
  });

  describe('Investigative Conclusion Formulation', () => {
    it('fails to formulate conclusion when required evidence items are missing', () => {
      const result = engine.dispatch({
        type: 'FormulateConclusion',
        conclusionId: 'conc_marcus_scapegoat',
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INSUFFICIENT_EVIDENCE');
      expect(result.message).toContain('missing required preserved evidence');
    });

    it('succeeds in formulating conclusion once all required evidence is preserved', () => {
      // Preserve EVD-2026-001, EVD-2026-002, EVD-2026-004
      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-001',
        source: 'app-portal-01',
        title: 'Aster Configuration',
        description: 'Over-privileged IAM snapshot',
        hash: 'hash-001',
      });

      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-002',
        source: 'filesrv-01',
        title: 'Departmental SMB Audit Log',
        description: 'Unauthorized read query against payroll share',
        hash: 'hash-002',
      });

      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'cedarline-chat-audit',
        title: 'Executive Deployment Order Trace',
        description: 'Direct instruction to bypass testing gates',
        hash: 'hash-004',
      });

      const result = engine.dispatch({
        type: 'FormulateConclusion',
        conclusionId: 'conc_marcus_scapegoat',
      });

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(1);

      const event = result.events[0]!;
      expect(event.type).toBe('INVESTIGATIVE_CONCLUSION_FORMULATED');
      expect(event.payload).toMatchObject({
        conclusionId: 'conc_marcus_scapegoat',
      });

      const state = engine.getState();
      expect(state.narrative!.discoveredConclusions).toContain('conc_marcus_scapegoat');
    });

    it('submits formulated conclusion to recipient stakeholder faction', () => {
      // First formulate
      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-001',
        source: 'app-portal-01',
        title: 'Aster Configuration',
        description: 'Over-privileged IAM snapshot',
        hash: 'hash-001',
      });
      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-002',
        source: 'filesrv-01',
        title: 'Departmental SMB Audit Log',
        description: 'Unauthorized read query',
        hash: 'hash-002',
      });
      engine.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'cedarline-chat-audit',
        title: 'Executive Order Trace',
        description: 'Bypass order',
        hash: 'hash-004',
      });

      engine.dispatch({
        type: 'FormulateConclusion',
        conclusionId: 'conc_marcus_scapegoat',
      });

      const submitResult = engine.dispatch({
        type: 'SubmitInvestigativeConclusion',
        conclusionId: 'conc_marcus_scapegoat',
        recipientFactionId: 'faction_inquirer',
      });

      expect(submitResult.success).toBe(true);
      expect(submitResult.events.length).toBe(1);

      const event = submitResult.events[0]!;
      expect(event.type).toBe('INVESTIGATIVE_CONCLUSION_SUBMITTED');
      expect(event.payload).toMatchObject({
        conclusionId: 'conc_marcus_scapegoat',
        recipientFactionId: 'faction_inquirer',
      });

      const state = engine.getState();
      expect(state.narrative!.submittedConclusions).toContain('conc_marcus_scapegoat');
    });
  });

  describe('Confidence Scoring & Corroboration Logic', () => {
    it('computes confidence score based on physical evidence and corroborated logs', () => {
      const conclusion = INVESTIGATIVE_CONCLUSIONS.find(c => c.id === 'conc_financial_espionage')!;
      expect(conclusion).toBeDefined();

      // No evidence: 0
      expect(calculateConclusionConfidence(conclusion, [])).toBe(0);

      // Half physical evidence:
      const halfEvidence = calculateConclusionConfidence(conclusion, ['EVD-2026-001']);
      expect(halfEvidence).toBeGreaterThan(0);
      expect(halfEvidence).toBeLessThan(conclusion.confidenceScore);

      // All physical evidence and logs: full confidence score
      const fullConfidence = calculateConclusionConfidence(
        conclusion,
        ['EVD-2026-001', 'EVD-2026-003'],
        ['LOG-2026-109B']
      );
      expect(fullConfidence).toBe(conclusion.confidenceScore);
    });
  });
});
