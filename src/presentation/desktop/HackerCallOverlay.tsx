/**
 * Cyberlife — Hacker VoIP Call Overlay Component
 *
 * Implements high-stakes, cinematic hacker voice/audio calls inspired by Hacker Simulator:
 * - Dual-tone ringing & modem connect SFX synthesized via Web Audio API
 * - Interactive incoming call banner with Accept/Decline actions
 * - Real-time HTML5 Canvas audio oscilloscope waveform visualizer
 * - Live typewriter subtitle dialogue stream synchronized with speaker
 * - Encrypted ZRTP / 256-bit AES call metadata HUD
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, HackerCallState } from '@/simulation/cyber/chat/types';
import { audioSfx } from '@/simulation/cyber/chat/audioSfx';
import { voiceDialogueService } from '../audio/VoiceDialogueService';
import { OsIcon } from './icons/OsIcons';

export interface HackerCallOverlayProps {
  callState: HackerCallState | null;
  activeThread: ChatThread | null;
  onAcceptCall: () => void;
  onDeclineCall: () => void;
  onEndCall: () => void;
}

export const HackerCallOverlay: React.FC<HackerCallOverlayProps> = ({
  callState,
  activeThread,
  onAcceptCall,
  onDeclineCall,
  onEndCall,
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [dialogueIndex, setDialogueIndex] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop ring audio cleanup reference
  const stopRingRef = useRef<(() => void) | null>(null);

  // Handle ringing state audio
  useEffect(() => {
    if (callState?.status === 'ringing') {
      stopRingRef.current = audioSfx.playRing();
    } else {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
    }
    return () => {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
    };
  }, [callState?.status]);

  // Handle active call duration timer
  useEffect(() => {
    if (callState?.status !== 'active') {
      setDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState?.status]);

  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  useEffect(() => {
    return voiceDialogueService.onSpeakingChange(active => {
      setIsVoiceActive(active);
    });
  }, []);

  // Handle dialogue streaming when active
  useEffect(() => {
    if (callState?.status !== 'active' || !activeThread || activeThread.callDialogue.length === 0) {
      setCurrentSubtitle('');
      setDialogueIndex(0);
      voiceDialogueService.stop();
      return;
    }

    let isCancelled = false;
    let currentIdx = 0;

    const playNextLine = () => {
      if (isCancelled || !activeThread) return;
      if (currentIdx >= activeThread.callDialogue.length) {
        // Dialogue ended, wrap up
        setCurrentSubtitle('[Call encrypted line silent... connection remains active]');
        return;
      }

      const item = activeThread.callDialogue[currentIdx]!;
      setDialogueIndex(currentIdx);

      // Trigger natural Nigerian English voice stream
      voiceDialogueService.speak(item.text, {
        speaker: activeThread.contactName,
        role: activeThread.contactRole,
        isPhoneCall: true,
      });

      // Typewriter effect for speech
      let charIdx = 0;
      setCurrentSubtitle('');

      const typeInterval = setInterval(() => {
        if (isCancelled) {
          clearInterval(typeInterval);
          return;
        }

        if (charIdx <= item.text.length) {
          setCurrentSubtitle(item.text.slice(0, charIdx));
          charIdx++;
        } else {
          clearInterval(typeInterval);
          // Wait for delayMs before next line
          setTimeout(() => {
            currentIdx++;
            playNextLine();
          }, item.delayMs);
        }
      }, 25);
    };

    // Initial brief pause before first dialogue line
    const startTimeout = setTimeout(() => {
      playNextLine();
    }, 600);

    return () => {
      isCancelled = true;
      clearTimeout(startTimeout);
      voiceDialogueService.stop();
    };
  }, [callState?.status, activeThread]);

  // Canvas oscilloscope audio wave rendering loop
  useEffect(() => {
    if (callState?.status !== 'active') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWave = () => {
      phase += 0.08;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.fillStyle = 'rgba(5, 10, 18, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw primary green oscilloscope wave
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const frequency = 0.04;
      const isSubtitleActive = currentSubtitle.length > 0 && !currentSubtitle.startsWith('[');
      const isSpeakingWave = isVoiceActive || isSubtitleActive;
      const amplitude = isSpeakingWave ? (isMuted ? 4 : 26 + Math.sin(phase * 2) * 10) : 4;

      for (let x = 0; x < width; x++) {
        const y =
          centerY + Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw secondary cyan harmonic wave
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y =
          centerY +
          Math.sin(x * frequency * 1.5 - phase) *
            (amplitude * 0.5) *
            Math.sin((x / width) * Math.PI);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [callState?.status, currentSubtitle, isMuted]);

  if (!callState || callState.status === 'idle') return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // State 1: Incoming Ringing Call Banner
  if (callState.status === 'ringing') {
    return (
      <div
        className="incoming-call-overlay"
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 8500,
          backgroundColor: '#0c131f',
          border: '2px solid #00ff66',
          boxShadow: '0 0 25px rgba(0, 255, 102, 0.4), 0 12px 36px rgba(0,0,0,0.9)',
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          minWidth: '420px',
          animation: 'pulseGlow 1.5s infinite alternate',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#003314',
            border: '2px solid #00ff66',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00ff66',
            fontSize: '22px',
          }}
        >
          <OsIcon name="call" size={24} color="#00ff66" />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: '10px', color: '#00ff66', fontWeight: 800, letterSpacing: '0.08em' }}
          >
            INCOMING ENCRYPTED VOIP CALL
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {callState.callerName}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            {callState.callerRole} // {callState.callerOrg}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#38bdf8',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: '2px',
            }}
          >
            Protocol: ZRTP 256-bit AES • Route: 10.42.0.88 PBX
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onDeclineCall}
            style={{
              backgroundColor: '#7f1d1d',
              border: '1px solid #ef4444',
              color: '#f8fafc',
              padding: '8px 14px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onAcceptCall}
            style={{
              backgroundColor: '#065f46',
              border: '1px solid #10b981',
              color: '#f8fafc',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
            }}
          >
            Accept Call
          </button>
        </div>
      </div>
    );
  }

  // State 2: Active VoIP Call HUD Modal
  return (
    <div
      className="active-call-hud"
      style={{
        position: 'absolute',
        top: '50px',
        right: '24px',
        width: '420px',
        zIndex: 8500,
        backgroundColor: '#0a101d',
        border: '1px solid #00e5ff',
        borderRadius: '8px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 15px rgba(0, 229, 255, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          backgroundColor: '#050a12',
          borderBottom: '1px solid #1e293b',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00ff66',
              boxShadow: '0 0 8px #00ff66',
            }}
          />
          <span
            style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.05em' }}
          >
            SECURE VOIP LINE ACTIVE
          </span>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#00e5ff',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
          }}
        >
          {formatTimer(duration)}
        </div>
      </div>

      {/* Caller Info Header */}
      <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00e5ff',
            fontWeight: 700,
            fontSize: '15px',
          }}
        >
          {callState.callerName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
            {callState.callerName}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{callState.callerRole}</div>
        </div>
      </div>

      {/* Audio Oscilloscope Waveform Canvas */}
      <div style={{ padding: '6px 14px' }}>
        <canvas
          ref={canvasRef}
          width={392}
          height={68}
          style={{
            width: '100%',
            height: '68px',
            backgroundColor: '#050a12',
            border: '1px solid #1e293b',
            borderRadius: '4px',
            display: 'block',
          }}
        />
      </div>

      {/* Live Typewriter Dialogue Subtitle Area */}
      <div
        style={{
          margin: '4px 14px 12px',
          backgroundColor: '#050a12',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          padding: '10px 12px',
          minHeight: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: '#64748b',
            marginBottom: '2px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          VOICE STREAM [{dialogueIndex + 1}/{activeThread?.callDialogue.length ?? 1}]:
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#f8fafc',
            lineHeight: '1.4',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {currentSubtitle || 'Connecting voice stream...'}
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          backgroundColor: '#050a12',
          borderTop: '1px solid #1e293b',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              voiceDialogueService.setMuted(nextMuted);
            }}
            aria-label={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            style={{
              backgroundColor: isMuted ? '#7f1d1d' : '#1e293b',
              border: `1px solid ${isMuted ? '#ef4444' : '#334155'}`,
              color: '#cbd5e1',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            {isMuted ? '🔇 Unmute Mic' : '🎤 Mute Mic'}
          </button>

          <button
            type="button"
            onClick={() => voiceDialogueService.replay()}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
            title="Replay dialogue voice"
          >
            🔁 Replay
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            voiceDialogueService.stop();
            onEndCall();
          }}
          style={{
            backgroundColor: '#dc2626',
            border: 'none',
            color: '#ffffff',
            borderRadius: '4px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(220, 38, 38, 0.4)',
          }}
        >
          End Call
        </button>
      </div>
    </div>
  );
};
