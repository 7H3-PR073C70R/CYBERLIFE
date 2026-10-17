import React from 'react';
import { InteractableDefinition } from '../world/worldConfig';

export interface InteractionPromptProps {
  target: InteractableDefinition | null;
  onInteract?: () => void;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({ target, onInteract }) => {
  if (!target) return null;

  return (
    <div
      className="interaction-prompt-container hud-interactive"
      role="region"
      aria-label="Nearby Interactive Target"
      data-testid="interaction-prompt"
    >
      <div className="interaction-prompt-card">
        <div className="interaction-prompt-header">
          <span className="prompt-badge" aria-hidden="true">
            🎯 Nearby Target
          </span>
          <h3 className="prompt-target-title" data-testid="prompt-target-title">
            {target.name}
          </h3>
        </div>

        <p className="prompt-target-desc">{target.description}</p>

        <div className="prompt-action-row">
          <span className="prompt-action-text" data-testid="prompt-action-text">
            Press <kbd className="key-badge">E</kbd> to {target.promptAction}
          </span>
          {onInteract && (
            <button
              type="button"
              className="btn-interact-action"
              onClick={onInteract}
              aria-label={`Activate interaction for ${target.name}`}
              data-testid="btn-interact-action"
            >
              [E] Activate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
