/**
 * Cyberlife — Incident Escalation Choice Modal
 *
 * Interactive ethical choice dilemma presented at the climax of the daytime
 * incident investigation (Beat 8: The Corporate Dilemma).
 *
 * Forces the analyst to choose between:
 * - Choice A: Truthful escalation of the Eko Nexus external pipeline staging (+10 Cedarline, +5 0xLagos)
 * - Choice B: Shielding team members from executive panic (-5 Cedarline, Barry protected, +10 legal exposure)
 */

import React, { useState } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { EpisodeChoiceDefinition } from '@/simulation/narrative/episodeTypes';

export interface IncidentChoiceModalProps {
  readonly choice: EpisodeChoiceDefinition | null;
  readonly onResolve?: (optionId: string) => void;
}

export const IncidentChoiceModal: React.FC<IncidentChoiceModalProps> = ({
  choice,
  onResolve,
}) => {
  const sim = useOptionalSimulation();
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B'>('A');

  if (!choice) return null;

  const handleConfirm = () => {
    if (sim?.dispatch) {
      sim.dispatch({ type: 'ResolveEpisodeChoice', optionId: selectedOptionId });
    }
    if (onResolve) {
      onResolve(selectedOptionId);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.92)',
        backdropFilter: 'blur(10px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      data-testid="incident-choice-modal"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(30, 27, 46, 0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>⚖️</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Critical Incident Escalation Dilemma
            </div>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.18rem', color: '#f8fafc', fontWeight: 600 }}>
              {choice.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {choice.prompt}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {choice.options.map(opt => {
              const isSelected = selectedOptionId === opt.id;
              const isChoiceA = opt.id === 'A';
              const activeBorderColor = isChoiceA ? '#38ef7d' : '#f59e0b';

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id as 'A' | 'B')}
                  style={{
                    padding: '1rem 1.2rem',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? activeBorderColor : 'rgba(51, 65, 85, 0.7)'}`,
                    backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                  }}
                  data-testid={`choice-option-${opt.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.96rem', color: isSelected ? activeBorderColor : '#f1f5f9' }}>
                      {opt.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        backgroundColor: isChoiceA ? 'rgba(56, 239, 125, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isChoiceA ? '#38ef7d' : '#f59e0b',
                        border: `1px solid ${isChoiceA ? 'rgba(56, 239, 125, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      }}
                    >
                      {isChoiceA ? 'Formal Escalation' : 'Quiet Containment'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.45' }}>
                    {opt.description}
                  </p>

                  {/* Faction preview */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', fontSize: '0.75rem', color: '#64748b' }}>
                    {opt.factionStandingDeltas?.faction_cedarline !== undefined && (
                      <span>
                        Cedarline SecOps: {opt.factionStandingDeltas.faction_cedarline > 0 ? '+10' : '-5'}
                      </span>
                    )}
                    {opt.factionStandingDeltas?.faction_0xlagos !== undefined && (
                      <span>0xLagos: +5</span>
                    )}
                    {opt.legalExposureDelta ? (
                      <span style={{ color: '#ef4444' }}>Legal Risk: +{opt.legalExposureDelta}%</span>
                    ) : (
                      <span style={{ color: '#38ef7d' }}>Legal Risk: Clean</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(51, 65, 85, 0.7)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleConfirm}
            style={{
              backgroundColor: selectedOptionId === 'A' ? '#38ef7d' : '#f59e0b',
              color: '#0b1329',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.6rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: `0 0 15px ${selectedOptionId === 'A' ? 'rgba(56, 239, 125, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
            data-testid="submit-choice-btn"
          >
            Confirm &amp; Sign Incident Report ({selectedOptionId === 'A' ? 'Escalate' : 'Shield'})
          </button>
        </div>
      </div>
    </div>
  );
};
