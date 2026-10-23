/**
 * Cyberlife — Blackout Beat Presentation Overlay Component
 *
 * Implements high-tension municipal power cut ("Up NEPA!"):
 * - Sudden brownout shader/flicker effect (respects reduceMotion setting).
 * - 1 kHz synthesized inverter warning alarm via AudioManager.
 * - Emergency battery reserve transition indicator (BATTERY: 34% // VOLTAGE: 11.8V).
 * - Dispatches DismissEpisodeBlackout to simulation engine upon sequence completion or skip.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioManager } from '../audio/AudioManager';

export interface BlackoutOverlayProps {
  blackout?: {
    readonly beatId: string;
    readonly durationSeconds: number;
    readonly clockSkipSeconds: number;
    readonly startedAtSimTime: number;
  };
  durationSeconds?: number;
  reduceMotion?: boolean;
  onDismiss: () => void;
  speedMultiplier?: number;
}

export const BlackoutOverlay: React.FC<BlackoutOverlayProps> = ({
  blackout,
  durationSeconds = 4.0,
  reduceMotion = false,
  onDismiss,
  speedMultiplier = 1,
}) => {
  const actualDuration = blackout?.durationSeconds ?? durationSeconds;
  const [phase, setPhase] = useState<'brownout' | 'blackout' | 'battery_boot'>('brownout');
  const [voltage, setVoltage] = useState<number>(12.4);
  const dismissedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss();
  }, [onDismiss]);

  // Audio tone lifecycle
  useEffect(() => {
    const alarm = audioManager.synthesizeInverterAlarm(actualDuration / speedMultiplier);
    return () => {
      alarm.stop();
    };
  }, [actualDuration, speedMultiplier]);

  // Phase sequencing
  useEffect(() => {
    const effectiveDurationMs = (actualDuration * 1000) / speedMultiplier;

    // Phase 1: Brownout flicker for first 18% of time
    const t1 = setTimeout(() => {
      setPhase('blackout');
    }, effectiveDurationMs * 0.18);

    // Phase 2: Pitch black substation trip for middle 55% of time
    const t2 = setTimeout(() => {
      setPhase('battery_boot');
      setVoltage(11.8);
    }, effectiveDurationMs * 0.72);

    // Phase 3: Auto-dismiss at end of duration
    const t3 = setTimeout(() => {
      handleDismiss();
    }, effectiveDurationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [actualDuration, speedMultiplier, handleDismiss]);

  // Handle click or key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'battery_boot') {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleDismiss]);

  return (
    <div
      role="dialog"
      aria-label="Power Blackout Event"
      data-testid="episode-blackout-overlay"
      className={reduceMotion ? 'reduced-motion' : ''}
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 99998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff4444',
        fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace',
        userSelect: 'none',
        cursor: 'pointer',
        opacity:
          phase === 'brownout'
            ? reduceMotion
              ? 0.85
              : 0.95
            : 1.0,
        transition: reduceMotion ? 'none' : 'opacity 0.15s ease-out',
      }}
    >
      {/* Brownout initial warning */}
      {phase === 'brownout' && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#f59e0b',
              marginBottom: '0.5rem',
              animation: reduceMotion ? 'none' : 'pulse 0.4s infinite alternate',
            }}
          >
            ⚡ GRID VOLTAGE COLLAPSE // SUBSTATION TRIP
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            EKEDC Municipal Feed Dropped. Inverter Transfer Initiating...
          </div>
          <div style={{ color: '#ef4444', fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace' }}>
            LINE VOLTAGE: COLLAPSED // INVERTER SENSE: 11.8V
          </div>
        </div>
      )}

      {/* Complete Blackout / Lost Time Punctuation */}
      {phase === 'blackout' && (
        <div style={{ textAlign: 'center', color: '#334155' }}>
          <div style={{ fontSize: '0.9rem', letterSpacing: '0.2em' }}>
            [ LOST TIME INTERVAL // SIMULATION CLOCK SYNCHRONIZING ]
          </div>
        </div>
      )}

      {/* Inverter Battery Recovery State */}
      {phase === 'battery_boot' && (
        <div
          style={{
            maxWidth: '650px',
            border: '1px solid #ef4444',
            padding: '2rem',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            borderRadius: '4px',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.25)',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              color: '#ef4444',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              paddingBottom: '0.5rem',
            }}
          >
            CRITICAL POWER STATUS // EMERGENCY BATTERY RESERVE
          </div>
          <div style={{ lineHeight: 1.8, fontSize: '0.85rem', color: '#cbd5e1' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>SUPPLY SOURCE:</span> Residential Pure Sinewave Inverter
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>BATTERY LEVEL:</span>{' '}
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>34% // VOLTAGE: {voltage}V</span>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>CLOCK SKIP:</span> 90 Minutes Lost Time Registered
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>SYSTEM INTEGRITY:</span> Volatile buffers flushed; new artifacts detected in /tmp.
            </div>
          </div>
          <div
            style={{
              marginTop: '1.5rem',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 600,
              textAlign: 'right',
            }}
          >
            [ CLICK OR PRESS ANY KEY TO RESUME WORKSTATION ]
          </div>
        </div>
      )}
    </div>
  );
};
