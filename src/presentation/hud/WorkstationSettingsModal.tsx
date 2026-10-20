import React, { useState, useEffect } from 'react';

export interface WorkstationSettings {
  reduceMotion: boolean;
  skipSitAfterFirst: boolean;
  showKeyHints: boolean;
}

const SETTINGS_STORAGE_KEY = 'cyberlife_workstation_settings_v1';

export function getStoredWorkstationSettings(): WorkstationSettings {
  if (typeof window === 'undefined') {
    return { reduceMotion: false, skipSitAfterFirst: false, showKeyHints: true };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        reduceMotion: Boolean(parsed.reduceMotion),
        skipSitAfterFirst: Boolean(parsed.skipSitAfterFirst),
        showKeyHints: parsed.showKeyHints !== false,
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { reduceMotion: false, skipSitAfterFirst: false, showKeyHints: true };
}

export function saveStoredWorkstationSettings(settings: WorkstationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

export interface WorkstationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: (settings: WorkstationSettings) => void;
}

export const WorkstationSettingsModal: React.FC<WorkstationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [settings, setSettings] = useState<WorkstationSettings>(() =>
    getStoredWorkstationSettings()
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredWorkstationSettings());
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof WorkstationSettings>(
    key: K,
    value: WorkstationSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveStoredWorkstationSettings(updated);
    onSettingsChanged?.(updated);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="controls-reference-backdrop"
      onClick={onClose}
      data-testid="workstation-settings-modal"
    >
      <div
        className="controls-reference-card"
        style={{ maxWidth: '520px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="controls-reference-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <div>
              <h2 id="settings-modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                Workstation & Camera Settings
              </h2>
              <p
                style={{
                  margin: '0.2rem 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Customize cinematic camera transitions and interaction preferences.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="controls-close-btn"
            onClick={onClose}
            aria-label="Close settings"
            data-testid="settings-close-btn"
          >
            ✕
          </button>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem 0' }}
        >
          {/* Reduce camera motion */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '1rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                Reduce camera motion
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Shortens transitions to ~0.25 s with no FOV zoom change for motion sensitivity.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={e => updateSetting('reduceMotion', e.target.checked)}
              style={{
                width: '1.2rem',
                height: '1.2rem',
                accentColor: '#00e5ff',
                cursor: 'pointer',
              }}
              data-testid="setting-reduce-motion"
            />
          </label>

          {/* Skip sit-down animation after first time */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '1rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                Skip sit-down animation after first time
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Subsequent computer interactions skip the sit-down transition and jump directly to
                monitor focus.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.skipSitAfterFirst}
              onChange={e => updateSetting('skipSitAfterFirst', e.target.checked)}
              style={{
                width: '1.2rem',
                height: '1.2rem',
                accentColor: '#00e5ff',
                cursor: 'pointer',
              }}
              data-testid="setting-skip-sit"
            />
          </label>

          {/* Show key hints */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '1rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                Show key hints
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Displays subtle keyboard cue badges for [Tab] Peek Out and [Esc] Stand Up.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showKeyHints}
              onChange={e => updateSetting('showKeyHints', e.target.checked)}
              style={{
                width: '1.2rem',
                height: '1.2rem',
                accentColor: '#00e5ff',
                cursor: 'pointer',
              }}
              data-testid="setting-show-key-hints"
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            data-testid="settings-done-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
