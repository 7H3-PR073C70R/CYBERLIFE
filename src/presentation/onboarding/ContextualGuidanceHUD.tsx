/**
 * Cyberlife — Milestone 10: Contextual Guidance HUD Component
 *
 * Renders data-driven contextual guidance hints above the HUD footer.
 * Evaluates state deterministically, enforces priority ordering,
 * and allows players to dismiss or expand guidance without disrupting gameplay.
 */

import React, { useState } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { evaluateActiveGuidanceHint } from '@/simulation/onboarding/guidanceDefinitions';

export interface ContextualGuidanceHUDProps {
  isNearInteraction?: boolean;
  isDesktopOpen?: boolean;
  isTerminalActive?: boolean;
  onOpenControlsReference?: () => void;
}

export const ContextualGuidanceHUD: React.FC<ContextualGuidanceHUDProps> = ({
  isNearInteraction = false,
  isDesktopOpen = false,
  isTerminalActive = false,
  onOpenControlsReference,
}) => {
  const sim = useOptionalSimulation();
  const state = sim?.state;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!state) return null;

  const activeHint = evaluateActiveGuidanceHint(state, {
    isNearInteraction,
    isDesktopOpen,
    isTerminalActive,
  });

  if (!activeHint) return null;

  const handleDismiss = () => {
    sim.dispatch({
      type: 'DismissGuidanceHint',
      hintId: activeHint.id,
    });
  };

  return (
    <div
      className="contextual-guidance-container hud-interactive"
      role="region"
      aria-label="Contextual Gameplay Guidance"
      data-testid="contextual-guidance-hud"
    >
      <div className="contextual-guidance-card">
        <div className="guidance-main-row">
          <div className="guidance-icon-badge" aria-hidden="true">
            💡
          </div>

          <div className="guidance-text-content">
            <div className="guidance-title-line">
              <span className="guidance-title" data-testid="guidance-title">
                {activeHint.title}
              </span>
              {activeHint.controlsHint && (
                <span className="guidance-controls-badge" data-testid="guidance-controls-badge">
                  {activeHint.controlsHint}
                </span>
              )}
            </div>

            <p className="guidance-desc" data-testid="guidance-desc">
              {activeHint.description}
            </p>
          </div>

          <div className="guidance-actions-group">
            <button
              type="button"
              className="guidance-expand-btn"
              onClick={() => setIsExpanded(prev => !prev)}
              aria-expanded={isExpanded}
              data-testid="guidance-expand-btn"
              title="View expected outcome & details"
            >
              {isExpanded ? 'Hide Details' : 'Details'}
            </button>

            <button
              type="button"
              className="guidance-dismiss-btn"
              onClick={handleDismiss}
              aria-label={`Dismiss hint: ${activeHint.title}`}
              data-testid="guidance-dismiss-btn"
              title="Dismiss this hint"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Expandable Deep Guidance Details */}
        {isExpanded && (
          <div className="guidance-details-drawer" data-testid="guidance-details-drawer">
            <div className="guidance-detail-row">
              <strong style={{ color: 'var(--color-accent-emerald)' }}>Expected Outcome: </strong>
              <span>{activeHint.expectedOutcome}</span>
            </div>

            <div className="guidance-detail-row">
              <strong style={{ color: 'var(--color-accent-amber)' }}>If Stuck: </strong>
              <span>{activeHint.recoveryGuidance}</span>
            </div>

            {onOpenControlsReference && (
              <div style={{ marginTop: '0.4rem' }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={onOpenControlsReference}
                  style={{
                    color: 'var(--color-accent-cyan)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                  }}
                >
                  Open Full Controls Reference [H]
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
