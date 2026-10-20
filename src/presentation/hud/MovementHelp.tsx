import React, { useEffect } from 'react';

export interface MovementHelpProps {
  isOpen: boolean;
  onClose: () => void;
  cameraMode: 'FIRST_PERSON' | 'THIRD_PERSON';
}

export const MovementHelp: React.FC<MovementHelpProps> = ({ isOpen, onClose, cameraMode }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="movement-help-panel hud-interactive"
      role="region"
      aria-label="Exploration Controls and Movement Guide"
      data-testid="movement-help-panel"
    >
      <div className="movement-help-header">
        <div className="movement-help-title">
          <span aria-hidden="true">🎮</span>
          <span>Neighborhood Controls</span>
        </div>
        <button
          type="button"
          className="btn-icon-close"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Dismiss movement instructions"
          data-testid="dismiss-movement-help"
        >
          ✕
        </button>
      </div>

      <div className="movement-help-body">
        <p className="movement-help-desc">
          Walk around the neighborhood to discover buildings and incident locations. No technical
          knowledge is required.
        </p>

        <ul className="controls-list" role="list">
          <li className="control-item">
            <span className="key-badge">W A S D</span> or <span className="key-badge">Arrows</span>
            <span className="control-action">Walk forward, left, backward, or right</span>
          </li>
          <li className="control-item">
            <span className="key-badge">V</span>
            <span className="control-action">
              Switch Camera — currently in{' '}
              <strong>
                {cameraMode === 'THIRD_PERSON'
                  ? '3rd Person (Behind Avatar)'
                  : '1st Person (Through Eyes)'}
              </strong>
            </span>
          </li>
          <li className="control-item">
            <span className="key-badge">E</span>
            <span className="control-action">Interact with nearby entrance or noticeboard</span>
          </li>
          <li className="control-item">
            <span className="key-badge">Mouse</span>
            <span className="control-action">
              Look around in 1st person mode (Click canvas to steer; press Esc to release)
            </span>
          </li>
        </ul>

        <div className="movement-help-tip">
          <strong>Tip:</strong> Approach glowing ground markers outside Cedarline Services or your
          Apartment, then press <strong>E</strong> to enter.
        </div>
      </div>
    </div>
  );
};
