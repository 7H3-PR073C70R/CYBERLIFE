import React, { useState } from 'react';

export interface InteractionHelpPromptProps {
  message?: string;
}

export const InteractionHelpPrompt: React.FC<InteractionHelpPromptProps> = ({
  message = 'Welcome to Cyberlife. Your guided objectives and instructions will appear here as you begin playing.',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <footer className="hud-footer" role="contentinfo">
      <div
        className="interaction-help-card hud-interactive"
        data-testid="interaction-help-card"
        role="region"
        aria-label="Player Guidance and Interaction Help"
      >
        <div className="help-text-group">
          <span className="help-icon" aria-hidden="true">
            💡
          </span>
          <div>
            <p className="help-message" data-testid="help-message-text">
              {message}
            </p>
            <span className="help-subtext">
              Milestone 1 verifies rendering and application shell. Player movement and the 3D
              neighborhood unlock in M2.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="help-button-action"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-expanded={isExpanded}
          aria-controls="guidance-detail-panel"
          data-testid="help-guidance-toggle"
        >
          {isExpanded ? 'Hide Details [Tab/Esc]' : 'Guidance Info [Info]'}
        </button>
      </div>

      {isExpanded && (
        <div
          id="guidance-detail-panel"
          className="world-error-card hud-interactive"
          style={{
            position: 'absolute',
            bottom: '5.5rem',
            width: '90%',
            maxWidth: '680px',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            border: '1px solid var(--color-accent-cyan)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
          }}
          role="dialog"
          aria-label="Accessibility & Guidance Details"
        >
          <h3
            style={{
              color: 'var(--color-accent-cyan)',
              fontSize: '1rem',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>📖</span> Beginner-Friendly Guidance Standard
          </h3>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              marginBottom: '0.75rem',
            }}
          >
            Cyberlife is designed so that players with no technical background can investigate,
            contain, and remediate cybersecurity threats. All commands will be supported with
            1-click execution, and all guidance follows an 8-part accessible framework.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setIsExpanded(false)}
          >
            Close
          </button>
        </div>
      )}
    </footer>
  );
};
