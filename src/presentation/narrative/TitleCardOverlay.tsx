/**
 * Cyberlife — Title Card Boot Sequence Component
 *
 * Implements high-impact, diegetic terminal boot presentation for story episodes:
 * - Monospaced terminal boot sequence with UTC+1 timestamp, SHA-256 hash, and kernel banner.
 * - Typewriter animation timing with auditory feedback.
 * - Skippable with any keyboard press (Space, Enter, Escape) or mouse click.
 * - Dispatches DismissEpisodeTitleCard to the authoritative simulation engine.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { audioSfx } from '../audio/audioSfx';

export interface TitleCardOverlayProps {
  titleCard?: {
    readonly episodeId?: string;
    readonly title?: string;
    readonly episodeHash?: string;
    readonly kernelBanner?: string;
    readonly timestampIso?: string;
  };
  episodeId?: string;
  title?: string;
  episodeHash?: string;
  kernelBanner?: string;
  timestampIso?: string;
  onDismiss: () => void;
  speedMultiplier?: number;
}

export const TitleCardOverlay: React.FC<TitleCardOverlayProps> = ({
  titleCard,
  title = 'ep01_triage_init.pcap',
  episodeHash = 'c7b9148d2f5a6b0981e4c7310df0b968c9284218a5e82110c7104bfa3513a011',
  kernelBanner = 'EkoSec Linux 6.12.0-cyberlife-arm64 #1 SMP PREEMPT_DYNAMIC WAT 2026',
  timestampIso,
  onDismiss,
  speedMultiplier = 1,
}) => {
  const actualTitle = titleCard?.title ?? title;
  const actualHash = titleCard?.episodeHash ?? episodeHash;
  const actualBanner = titleCard?.kernelBanner ?? kernelBanner;
  const actualTimestamp = titleCard?.timestampIso ?? timestampIso;

  const formattedTimestamp = actualTimestamp
    ? new Date(actualTimestamp).toLocaleString('en-GB', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'full',
        timeStyle: 'medium',
      }) + ' (UTC+1 WAT)'
    : 'Oct 12, 2026 — 07:42:00 (UTC+1 WAT)';

  const fullBootSequence = React.useMemo(() => [
    `[    0.000000] ${actualBanner}`,
    `[    0.004128] TIMESTAMP (UTC+1): ${formattedTimestamp}`,
    `[    0.012489] EPISODE_HASH:      ${actualHash}`,
    `[    0.028914] ENCLAVE IDENTITY:  ws-sec-04 (Odunlami St, Lagos Island)`,
    `[    0.045102] MOUNTING ENCLAVE:  ~/.vault/journal.enc [READ_ONLY_SEALED]`,
    `[    0.061240] SECURITY AUDIT:    AUTHENTICATED // ZERO SYSTEM COMPROMISE`,
    `[    0.089012] COMMENCING EPISODE STREAM...`,
  ], [actualBanner, formattedTimestamp, actualHash]);

  const isFast = speedMultiplier >= 50;
  const [bootLines, setBootLines] = useState<string[]>(() => (isFast ? fullBootSequence : []));
  const [typedTitle, setTypedTitle] = useState<string>(() => (isFast ? actualTitle : ''));
  const [isFinished, setIsFinished] = useState<boolean>(() => isFast);
  const dismissedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    audioSfx.playSpeechBlip();
    onDismiss();
  }, [onDismiss]);

  // Handle any key press to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      handleDismiss();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  // Boot sequence typewriter progression
  useEffect(() => {
    if (isFast) return;
    let lineIdx = 0;
    const intervalMs = Math.max(30, Math.floor(120 / speedMultiplier));

    const lineTimer = setInterval(() => {
      if (lineIdx < fullBootSequence.length) {
        const nextLine = fullBootSequence[lineIdx];
        if (nextLine) {
          setBootLines(prev => [...prev, nextLine]);
          audioSfx.playSpeechBlip();
        }
        lineIdx++;
      } else {
        clearInterval(lineTimer);

        // Start typing big title
        let charIdx = 0;
        const titleTimer = setInterval(() => {
          if (charIdx <= actualTitle.length) {
            setTypedTitle(actualTitle.slice(0, charIdx));
            audioSfx.playSpeechBlip();
            charIdx++;
          } else {
            clearInterval(titleTimer);
            setIsFinished(true);
          }
        }, Math.max(20, Math.floor(40 / speedMultiplier)));
      }
    }, intervalMs);

    return () => clearInterval(lineTimer);
  }, [actualTitle, speedMultiplier, isFast, fullBootSequence]);

  return (
    <div
      role="dialog"
      aria-label="Episode Title Card"
      data-testid="episode-title-card"
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#05080f',
        color: '#00ff66',
        fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.5rem',
        boxSizing: 'border-box',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundImage:
          'radial-gradient(ellipse at center, rgba(0, 255, 102, 0.05) 0%, rgba(5, 8, 15, 0.98) 75%)',
      }}
    >
      {/* Top Banner / Kernel Boot Telemetry */}
      <div style={{ maxWidth: '1000px', lineHeight: 1.6, fontSize: '0.85rem' }}>
        <div style={{ color: '#00e5ff', marginBottom: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          CYBERLIFE SYSTEM BOOTLOADER // HARDWARE ENCLAVE v2.6.4
        </div>
        {bootLines.map((line, i) => (
          <div key={i} style={{ opacity: 0.9, whiteSpace: 'pre-wrap' }}>
            {line}
          </div>
        ))}
      </div>

      {/* Center Cinematic Title Card */}
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div
          style={{
            color: '#a855f7',
            fontSize: '1rem',
            letterSpacing: '0.3em',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          SEASON 1 // EPISODE 01
        </div>
        <div
          style={{
            fontSize: '2.8rem',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.08em',
            textShadow: '0 0 24px rgba(0, 255, 102, 0.45)',
            marginBottom: '1rem',
          }}
        >
          {typedTitle}
          <span style={{ animation: 'blink 1s step-start infinite', color: '#00ff66' }}>_</span>
        </div>
        <div
          style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          The Aster Anomaly & The Midnight Query
        </div>
      </div>

      {/* Bottom Dismiss Prompt */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(0, 255, 102, 0.25)',
          paddingTop: '1rem',
          fontSize: '0.8rem',
          color: isFinished ? '#00e5ff' : '#64748b',
        }}
      >
        <div>SHA-256 VERIFIED: {episodeHash.slice(0, 16)}...</div>
        <div style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
          [ PRESS ANY KEY OR CLICK TO ENTER WORKSTATION ]
        </div>
      </div>
    </div>
  );
};
