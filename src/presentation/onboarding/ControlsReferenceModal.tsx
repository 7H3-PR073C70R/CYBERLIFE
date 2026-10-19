/**
 * Cyberlife — Milestone 10: Controls & Game Literacy Reference Modal
 *
 * Provides a comprehensive, accessible reference of all implemented controls:
 * - 3D World Navigation & Camera
 * - Interaction & Dialogue
 * - Workstation & Window Management
 * - Terminal Command Line Navigation
 * - Persistence & Help Shortcuts
 */

import React, { useEffect } from 'react';

export interface ControlsReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIntroTour?: () => void;
}

interface ControlGroup {
  category: string;
  icon: string;
  items: Array<{ keyBadge: string; action: string; note?: string }>;
}

const CONTROL_GROUPS: readonly ControlGroup[] = [
  {
    category: '3D World Navigation & Camera',
    icon: '🎮',
    items: [
      {
        keyBadge: 'W A S D / Arrows',
        action: 'Walk forward, left, backward, and right through Lagos Island.',
      },
      {
        keyBadge: 'V',
        action: 'Toggle Camera perspective between 3rd-Person (Avatar) and 1st-Person (Eyes).',
      },
      {
        keyBadge: 'Mouse Look',
        action:
          'Look around in 1st-Person mode (click screen to lock cursor; press Esc to release).',
      },
    ],
  },
  {
    category: 'Interactions & Dialogue',
    icon: '💬',
    items: [
      {
        keyBadge: 'E',
        action:
          'Interact with nearby people, computer workstations, building entrances, and noticeboards.',
      },
      {
        keyBadge: '1 - 4 / Click',
        action: 'Select dialogue choices when speaking with NPCs like Amina, Folake, or Dr. Kalu.',
      },
      {
        keyBadge: 'Esc',
        action: 'Dismiss open menus, close noticeboards, or release mouse cursor.',
      },
    ],
  },
  {
    category: 'Virtual Workstation & Desktop',
    icon: '💻',
    items: [
      {
        keyBadge: 'Title Bar Drag',
        action: 'Click and drag any window header to reposition it on your desktop.',
      },
      {
        keyBadge: '— ◻ ✕ Buttons',
        action: 'Minimize, maximize, or close active applications.',
      },
      {
        keyBadge: 'Taskbar / Dock',
        action:
          'Launch applications: Terminal, Field Guide, Incident Portal, Career Hub, Save Vault.',
      },
      {
        keyBadge: 'Exit Desktop',
        action:
          'Click the exit button at the top right of the desktop to stand up and return to the 3D world.',
      },
    ],
  },
  {
    category: 'Simulated Terminal Shell',
    icon: '⌨️',
    items: [
      {
        keyBadge: 'Enter',
        action:
          'Execute typed command. Commands must be typed manually — no auto-complete buttons!',
      },
      {
        keyBadge: '↑ / ↓ Arrows',
        action: 'Browse previously executed command history.',
      },
      {
        keyBadge: 'Ctrl+L / clear',
        action: 'Clear visible terminal lines for a clean workspace.',
      },
      {
        keyBadge: 'help [command]',
        action: 'View syntax reference and in-game guidance directly inside the terminal prompt.',
      },
    ],
  },
  {
    category: 'HUD & System Shortcuts',
    icon: '⚙️',
    items: [
      {
        keyBadge: 'H',
        action: 'Toggle this Controls & Help Reference modal anytime in the world.',
      },
      {
        keyBadge: 'HUD Save Icon',
        action: 'View real-time save state, create manual checkpoints, or manage backup slots.',
      },
    ],
  },
];

export const ControlsReferenceModal: React.FC<ControlsReferenceModalProps> = ({
  isOpen,
  onClose,
  onOpenIntroTour,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="controls-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="controls-modal-title"
      data-testid="controls-reference-modal"
    >
      <div className="controls-modal-card hud-interactive">
        <div className="controls-modal-header">
          <div className="controls-title-group">
            <span className="controls-header-icon" aria-hidden="true">
              ⌨️
            </span>
            <div>
              <h2 id="controls-modal-title" className="controls-modal-title">
                Cyberlife Controls &amp; Game Reference
              </h2>
              <span className="controls-modal-subtitle">
                Complete guide to all navigation, interaction, and cybersecurity tools
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-icon-close"
            onClick={onClose}
            aria-label="Close controls reference"
            data-testid="controls-close-btn"
          >
            ✕
          </button>
        </div>

        <div className="controls-modal-body" tabIndex={0}>
          {CONTROL_GROUPS.map(group => (
            <section key={group.category} className="controls-category-section">
              <h3 className="controls-category-title">
                <span aria-hidden="true">{group.icon}</span>
                <span>{group.category}</span>
              </h3>

              <div className="controls-card-grid">
                {group.items.map(item => (
                  <div key={item.keyBadge} className="control-key-card">
                    <span className="control-badge">{item.keyBadge}</span>
                    <div className="control-desc-box">
                      <p className="control-action-text">{item.action}</p>
                      {item.note && <span className="control-note-text">{item.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="controls-modal-footer">
          {onOpenIntroTour && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                onClose();
                onOpenIntroTour();
              }}
              data-testid="controls-restart-tour-btn"
            >
              🚀 Restart Introduction Tour
            </button>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            data-testid="controls-dismiss-btn"
          >
            Got It [Esc / H]
          </button>
        </div>
      </div>
    </div>
  );
};
