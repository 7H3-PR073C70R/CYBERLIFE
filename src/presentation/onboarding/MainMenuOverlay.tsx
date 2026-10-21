/**
 * Cyberlife — Milestone 15: Atmospheric Main Menu / Title Screen Component
 *
 * Establishes the original sonic and visual identity of Cyberlife.
 * Plays the original main theme ("Echoes of Marina") upon user interaction,
 * unlocks the Web Audio API context in compliance with browser autoplay policies,
 * and seamlessly crossfades to in-game music and Lagos ambience when entering the world.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { audioManager } from '../audio/AudioManager';
import { musicController } from '../audio/MusicController';
import { sfxController } from '../audio/SfxController';
import { WorkstationSettingsModal } from '../hud/WorkstationSettingsModal';

export interface MainMenuOverlayProps {
  isOpen: boolean;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({
  isOpen,
  onStartGame,
  onOpenSettings,
  onOpenControls,
}) => {
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Play main theme when main menu is open and user interacts
  const startMenuAudio = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    // Resume audio context and play main theme
    const ctx = audioManager.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    musicController.playTrack('music_main_menu', { crossfadeSeconds: 1.5 });
  }, [hasInteracted]);

  useEffect(() => {
    if (isOpen) {
      // If user already interacted or window receives pointerdown, trigger theme
      const handleFirstInteraction = () => {
        startMenuAudio();
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };

      window.addEventListener('pointerdown', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);

      return () => {
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [isOpen, startMenuAudio]);

  const handleStart = () => {
    sfxController.playUiClick();
    onStartGame();
  };

  const handleSettings = () => {
    sfxController.playUiClick();
    setIsSettingsModalOpen(true);
    onOpenSettings();
  };

  const handleControls = () => {
    sfxController.playUiClick();
    onOpenControls();
  };

  if (!isOpen) return null;

  return (
    <div
      className="main-menu-backdrop hud-interactive"
      data-testid="main-menu-overlay"
      onClick={startMenuAudio}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* Background Ambience Glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.12) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container Card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '560px',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 229, 255, 0.1)',
        }}
      >
        {/* Title Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '2.2rem' }}>⚡</span>
          <h1
            style={{
              margin: 0,
              fontSize: '2.6rem',
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #00e5ff 0%, #38bdf8 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
            }}
          >
            CYBERLIFE
          </h1>
        </div>

        <div
          style={{
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: '1.75rem',
            fontWeight: 600,
          }}
        >
          Lagos Island • Cybersecurity Life RPG
        </div>

        <p
          style={{
            fontSize: '0.92rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            marginBottom: '2rem',
            maxWidth: '460px',
          }}
        >
          Investigate security incidents, defend enterprise networks, and explore the
          living technological heart of Broad Street and Marina.
        </p>

        {/* Audio Autoplay Notification / Prompt */}
        {!hasInteracted && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              color: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '1.5rem',
              animation: 'pulse 2s infinite',
            }}
          >
            <span>🎵</span>
            <span>Click anywhere to activate original soundscape & theme</span>
          </div>
        )}

        {/* Action Menu Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleStart}
            data-testid="main-menu-start-btn"
            style={{
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0, 229, 255, 0.35)',
              cursor: 'pointer',
            }}
          >
            <span>🏙️</span>
            <span>Enter Lagos Island</span>
          </button>

          <button
            type="button"
            onClick={handleSettings}
            data-testid="main-menu-settings-btn"
            style={{
              padding: '0.7rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#e2e8f0',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>⚙️</span>
            <span>Audio & Settings</span>
          </button>

          <button
            type="button"
            onClick={handleControls}
            data-testid="main-menu-controls-btn"
            style={{
              padding: '0.7rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#e2e8f0',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📖</span>
            <span>Controls & Field Guide</span>
          </button>
        </div>

        {/* Footer Provenance Note */}
        <div
          style={{
            marginTop: '2rem',
            fontSize: '0.72rem',
            color: '#64748b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          <span>Milestone 15 • Original Cyberlife Audio System</span>
          <span>100% Original Synthesized Score & Ambient Soundscapes</span>
        </div>
      </div>

      {/* Audio & Workstation Settings Modal */}
      <WorkstationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
