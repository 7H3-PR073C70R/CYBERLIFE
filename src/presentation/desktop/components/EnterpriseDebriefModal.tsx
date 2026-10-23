/**
 * Cyberlife — Enterprise Incident Response Debrief Modal
 *
 * Professional, educational post-incident debrief screen shown after completing
 * the daytime incident triage (ALT-2026-1012) in Episode 01.
 *
 * Displays:
 * - Summary of actions taken, display filters used, evidence preserved
 * - NIST SP 800-61r2 lifecycle review
 * - MITRE ATT&CK mapping (T1021.002 SMB Shares, T1071.001 Web Protocols)
 * - Real-world Tier-1 practice (proxy correlation prior to containment sign-off)
 * - SANS / RFC / NIST study syllabus recommendations
 * - Educational score and letter grade (GRADE S, A, B, C)
 */

import React from 'react';
import { useOptionalSimulation } from '@/application/simulation';
import {
  evaluateEpisode01DayCase,
  DebriefEvaluationCriteria,
} from '@/simulation/narrative/ep01DebriefData';

export interface EnterpriseDebriefModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const EnterpriseDebriefModal: React.FC<EnterpriseDebriefModalProps> = ({
  isOpen,
  onClose,
}) => {
  const sim = useOptionalSimulation();
  const state = sim?.state;
  const dispatch = sim?.dispatch;

  if (!isOpen) return null;

  const flags = state?.flags ?? {};
  const criteria: DebriefEvaluationCriteria = {
    usedSmbFilter: Boolean(flags['flag_m16_objective_smb_filtered'] || flags['flag_ep01_packetlens_ready']),
    preservedIamEvidence: Boolean(flags['flag_evidence_preserved_EVD-2026-004'] || flags['flag_evidence_preserved_evd-2026-004']),
    preservedPcapEvidence: Boolean(flags['flag_evidence_preserved_EVD-2026-001'] || flags['flag_evidence_preserved_evd-2026-001'] || flags['flag_ep01_packetlens_ready']),
    executedContainment: Boolean(flags['flag_aster_contained'] || flags['flag_ep01_containment_ready']),
    executedRemediation: Boolean(flags['flag_aster_remediated']),
    executedVerification: Boolean(flags['flag_aster_verified']),
    choice: flags['flag_ep01_choice_escalate'] ? 'A' : flags['flag_ep01_choice_shield'] ? 'B' : null,
  };

  const scorecard = evaluateEpisode01DayCase(criteria);

  const handleAcknowledge = () => {
    if (dispatch && state?.episode?.activeBeatId === 'ep01_beat_09_day_debrief') {
      dispatch({ type: 'CompleteEpisodeBeat', beatId: 'ep01_beat_09_day_debrief' });
    }
    onClose();
  };

  const gradeColor =
    scorecard.grade === 'GRADE S'
      ? '#38ef7d'
      : scorecard.grade === 'GRADE A'
        ? '#00e5ff'
        : scorecard.grade === 'GRADE B'
          ? '#f59e0b'
          : '#ef4444';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      data-testid="enterprise-debrief-modal"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: '#0b1329',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 229, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e2e8f0',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Cedarline Solutions // SecOps Incident Debrief
            </div>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
              Ticket ALT-2026-1012: svc-aster Triage &amp; Containment
            </h2>
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${gradeColor}`,
              backgroundColor: `${gradeColor}18`,
              color: gradeColor,
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.05em',
            }}
          >
            {scorecard.grade} ({scorecard.totalScore}/100)
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Finding Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 239, 125, 0.25)', borderRadius: '6px', padding: '1rem' }}>
              <div style={{ color: '#38ef7d', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ✓ Validated Incident Actions
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                {scorecard.correctFindings.map((finding, idx) => (
                  <li key={idx} style={{ marginBottom: '0.3rem' }}>{finding}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px', padding: '1rem' }}>
              <div style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ⚠ Growth &amp; Precision Notes
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                {scorecard.missedFindings.length > 0 ? (
                  scorecard.missedFindings.map((finding, idx) => (
                    <li key={idx} style={{ marginBottom: '0.3rem' }}>{finding}</li>
                  ))
                ) : (
                  <li style={{ color: '#94a3b8' }}>Zero missed procedures. Full protocol compliance achieved.</li>
                )}
              </ul>
            </div>
          </div>

          {/* ATT&CK Matrix & NIST Lifecycle */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '6px', padding: '1rem' }}>
            <div style={{ color: '#00e5ff', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              MITRE ATT&amp;CK Mapping
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              {scorecard.attckMappings.map((technique, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  {technique}
                </span>
              ))}
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
              {scorecard.nistPhaseReview}
            </div>
          </div>

          {/* Real-World Tier-1 SOC Lesson */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderLeft: '4px solid #00e5ff', padding: '0.9rem 1.1rem', borderRadius: '0 6px 6px 0' }}>
            <div style={{ color: '#00e5ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Tier-1 Engineering Takeaway // Proxy Correlation
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              {scorecard.tier1Lesson}
            </p>
          </div>

          {/* What to study next */}
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Recommended Next Reading &amp; Training
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {scorecard.studyTopics.map((topic, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  • <span style={{ color: '#f8fafc', fontWeight: 500 }}>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleAcknowledge}
            style={{
              backgroundColor: '#00e5ff',
              color: '#0b1329',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.4rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
            }}
            data-testid="debrief-acknowledge-btn"
          >
            Acknowledge &amp; Complete Day Case
          </button>
        </div>
      </div>
    </div>
  );
};
