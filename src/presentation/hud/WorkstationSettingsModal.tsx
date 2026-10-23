import React, { useState, useEffect } from 'react';
import { audioManager, AudioBusName, AudioVolumes } from '@/presentation/audio/AudioManager';

export interface WorkstationSettings {
  reduceMotion: boolean;
  skipSitAfterFirst: boolean;
  showKeyHints: boolean;
  guidanceMode?: 'Guided' | 'Immersive';
}

const SETTINGS_STORAGE_KEY = 'cyberlife_workstation_settings_v1';

export function getStoredWorkstationSettings(): WorkstationSettings {
  if (typeof window === 'undefined') {
    return { reduceMotion: false, skipSitAfterFirst: false, showKeyHints: true, guidanceMode: 'Guided' };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        reduceMotion: Boolean(parsed.reduceMotion),
        skipSitAfterFirst: Boolean(parsed.skipSitAfterFirst),
        showKeyHints: parsed.showKeyHints !== false,
        guidanceMode: parsed.guidanceMode === 'Immersive' ? 'Immersive' : 'Guided',
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { reduceMotion: false, skipSitAfterFirst: false, showKeyHints: true, guidanceMode: 'Guided' };
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
  const [audioVolumes, setAudioVolumes] = useState<AudioVolumes>(() =>
    audioManager.getAllVolumes()
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMasterMuted());

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredWorkstationSettings());
      setAudioVolumes(audioManager.getAllVolumes());
      setIsMuted(audioManager.isMasterMuted());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = audioManager.onStateChange(() => {
      setAudioVolumes(audioManager.getAllVolumes());
      setIsMuted(audioManager.isMasterMuted());
    });
    return unsubscribe;
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

  const handleVolumeChange = (bus: AudioBusName, val: number) => {
    audioManager.setBusVolume(bus, val);
    setAudioVolumes(audioManager.getAllVolumes());
  };

  const handleToggleMute = () => {
    const next = audioManager.toggleMute();
    setIsMuted(next);
  };

  // Escape key listener
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

  const audioSliders: { bus: AudioBusName; label: string; desc: string; testId: string }[] = [
    {
      bus: 'master',
      label: 'Master Volume',
      desc: 'Overall audio level',
      testId: 'setting-audio-master',
    },
    {
      bus: 'voice',
      label: 'Voice Volume',
      desc: 'Character speech & dialogue',
      testId: 'setting-audio-voice',
    },
    {
      bus: 'sfx',
      label: 'SFX Volume',
      desc: 'Terminal beeps, clicks & alerts',
      testId: 'setting-audio-sfx',
    },
    {
      bus: 'ambience',
      label: 'Ambience Volume',
      desc: 'Workstation hum & room tone',
      testId: 'setting-audio-ambience',
    },
    {
      bus: 'music',
      label: 'Music Volume',
      desc: 'Atmospheric score & soundtrack',
      testId: 'setting-audio-music',
    },
    {
      bus: 'ui',
      label: 'UI Volume',
      desc: 'Button clicks & system pings',
      testId: 'setting-audio-ui',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="controls-modal-backdrop hud-interactive"
      style={{ pointerEvents: 'auto' }}
      onClick={onClose}
      data-testid="workstation-settings-modal"
    >
      <div
        className="controls-modal-card hud-interactive"
        style={{
          maxWidth: '540px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="controls-modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <div>
              <h2 id="settings-modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                Settings & Preferences
              </h2>
              <p
                style={{
                  margin: '0.2rem 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Customize audio buses, camera transitions, and interaction cues.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon-close"
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close settings"
            data-testid="settings-close-btn"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            ✕
          </button>
        </div>

        <div
          className="controls-modal-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.25rem 1.4rem',
          }}
        >
          {/* Audio Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
              paddingBottom: '0.45rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>🔊</span>
              <span style={{ fontWeight: 700, color: '#00e5ff', fontSize: '0.92rem' }}>
                Audio & Volume Buses
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              data-testid="setting-audio-mute"
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: isMuted ? '1px solid #ef4444' : '1px solid rgba(0, 229, 255, 0.4)',
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 229, 255, 0.1)',
                color: isMuted ? '#fca5a5' : '#00e5ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
              <span>{isMuted ? 'Muted' : 'Mute All'}</span>
            </button>
          </div>

          {/* Audio Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
            {audioSliders.map(({ bus, label, desc, testId }) => (
              <div
                key={bus}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{desc}</div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: isMuted ? '#64748b' : '#00e5ff',
                      minWidth: '42px',
                      textAlign: 'right',
                    }}
                  >
                    {Math.round(audioVolumes[bus] * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioVolumes[bus]}
                  onChange={e => handleVolumeChange(bus, parseFloat(e.target.value))}
                  data-testid={testId}
                  aria-label={label}
                  style={{
                    width: '100%',
                    accentColor: '#00e5ff',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Audio Action Buttons: Test Audio and Reset Defaults */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.6rem',
              marginTop: '0.2rem',
            }}
          >
            <button
              type="button"
              onClick={() => audioManager.testAudioPlayback()}
              data-testid="setting-audio-test"
              aria-label="Test audio playback"
              style={{
                flex: 1,
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                color: '#00e5ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🔔</span>
              <span>Test Audio Output</span>
            </button>
            <button
              type="button"
              onClick={() => {
                audioManager.resetToDefaults();
                setAudioVolumes(audioManager.getAllVolumes());
                setIsMuted(audioManager.isMasterMuted());
              }}
              data-testid="setting-audio-reset"
              aria-label="Reset audio settings to defaults"
              style={{
                flex: 1,
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                backgroundColor: 'rgba(148, 163, 184, 0.08)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>↺</span>
              <span>Reset Audio Defaults</span>
            </button>
          </div>

          {/* Camera & Interaction Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
              paddingBottom: '0.45rem',
              marginTop: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>🎥</span>
            <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.92rem' }}>
              Camera & Controls
            </span>
          </div>

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

          {/* Narrative Guidance Mode Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
              paddingBottom: '0.45rem',
              marginTop: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>🧭</span>
            <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.92rem' }}>
              Story & Guidance Mode
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
              Episode Delivery & Objective HUD
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Control whether the on-screen objective tracker banner is displayed or hidden in favor of pure diegetic story cues (Incident tickets, Onion Chat messages, and mentor hints).
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    (settings.guidanceMode ?? 'Guided') === 'Guided'
                      ? 'rgba(0, 229, 255, 0.12)'
                      : 'rgba(15, 23, 42, 0.4)',
                  border:
                    (settings.guidanceMode ?? 'Guided') === 'Guided'
                      ? '1px solid #00e5ff'
                      : '1px solid rgba(148, 163, 184, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="guidanceMode"
                  value="Guided"
                  checked={(settings.guidanceMode ?? 'Guided') === 'Guided'}
                  onChange={() => updateSetting('guidanceMode', 'Guided')}
                  style={{ accentColor: '#00e5ff', cursor: 'pointer' }}
                  data-testid="setting-guidance-guided"
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                    Guided (Default)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    HUD objective checklist visible
                  </div>
                </div>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    settings.guidanceMode === 'Immersive'
                      ? 'rgba(0, 229, 255, 0.12)'
                      : 'rgba(15, 23, 42, 0.4)',
                  border:
                    settings.guidanceMode === 'Immersive'
                      ? '1px solid #00e5ff'
                      : '1px solid rgba(148, 163, 184, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="guidanceMode"
                  value="Immersive"
                  checked={settings.guidanceMode === 'Immersive'}
                  onChange={() => updateSetting('guidanceMode', 'Immersive')}
                  style={{ accentColor: '#00e5ff', cursor: 'pointer' }}
                  data-testid="setting-guidance-immersive"
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                    Immersive
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Diegetic tickets &amp; mentor hints only
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem 1.4rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
          }}
        >
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

