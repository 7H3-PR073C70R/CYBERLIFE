/**
 * Cyberlife — HackerCallOverlay Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HackerCallOverlay } from '@/presentation/desktop/HackerCallOverlay';
import { HackerCallState, ChatThread } from '@/simulation/cyber/chat/types';
import { voiceDialogueService } from '@/presentation/audio/VoiceDialogueService';
import { audioManager } from '@/presentation/audio/AudioManager';

describe('HackerCallOverlay', () => {
  beforeEach(() => {
    voiceDialogueService.setMuted(false);
    audioManager.setMuted(false);
  });

  const dummyThread: ChatThread = {
    id: 'thread-test',
    contactId: 'cipher',
    contactName: 'Cipher',
    contactRole: 'Underground Broker',
    contactOrg: '0xBoard',
    contactAvatarColor: '#a855f7',
    isOnline: true,
    securityClearance: 'ONION ROUTED',
    unreadCount: 0,
    canCall: true,
    callDialogue: [{ text: 'Analyst, the relay is hot. Extract the files.', delayMs: 1000 }],
    messages: [],
  };

  it('renders nothing when call status is idle', () => {
    const callState: HackerCallState = {
      id: 'c1',
      callerId: 'cipher',
      callerName: 'Cipher',
      callerRole: 'Broker',
      callerOrg: '0xBoard',
      status: 'idle',
      durationSeconds: 0,
      currentSubtitleIndex: 0,
      isMuted: false,
    };

    const { container } = render(
      <HackerCallOverlay
        callState={callState}
        activeThread={dummyThread}
        onAcceptCall={() => {}}
        onDeclineCall={() => {}}
        onEndCall={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders incoming call ringing banner with Accept and Decline buttons', () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    const callState: HackerCallState = {
      id: 'c1',
      callerId: 'cipher',
      callerName: 'Cipher',
      callerRole: 'Underground Broker',
      callerOrg: '0xBoard',
      status: 'ringing',
      durationSeconds: 0,
      currentSubtitleIndex: 0,
      isMuted: false,
    };

    render(
      <HackerCallOverlay
        callState={callState}
        activeThread={dummyThread}
        onAcceptCall={onAccept}
        onDeclineCall={onDecline}
        onEndCall={() => {}}
      />
    );

    expect(screen.getByText(/INCOMING ENCRYPTED VOIP CALL/i)).toBeInTheDocument();
    expect(screen.getByText('Cipher')).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', { name: /Accept Call/i });
    const declineBtn = screen.getByRole('button', { name: /Decline/i });

    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalledTimes(1);

    fireEvent.click(declineBtn);
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('renders active call HUD with timer, audio oscilloscope canvas, and End Call button', () => {
    const onEnd = vi.fn();

    const callState: HackerCallState = {
      id: 'c1',
      callerId: 'cipher',
      callerName: 'Cipher',
      callerRole: 'Underground Broker',
      callerOrg: '0xBoard',
      status: 'active',
      durationSeconds: 14,
      currentSubtitleIndex: 0,
      isMuted: false,
    };

    render(
      <HackerCallOverlay
        callState={callState}
        activeThread={dummyThread}
        onAcceptCall={() => {}}
        onDeclineCall={() => {}}
        onEndCall={onEnd}
      />
    );

    expect(screen.getByText(/SECURE VOIP LINE ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText('Cipher')).toBeInTheDocument();

    const muteBtn = screen.getByRole('button', { name: /Mute Mic/i });
    expect(muteBtn).toBeInTheDocument();
    fireEvent.click(muteBtn);
    expect(screen.getByRole('button', { name: /Unmute Mic/i })).toBeInTheDocument();

    const endBtn = screen.getByRole('button', { name: /End Call/i });
    fireEvent.click(endBtn);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('sequences dialogue lines on voice completion (onEnd + delayMs), never on typewriter timer alone', async () => {
    vi.useFakeTimers();

    let capturedOptions: { onEnd?: () => void; isPhoneCall?: boolean } | null = null;
    const { voiceDialogueService } = await import('@/presentation/audio/VoiceDialogueService');
    const speakSpy = vi.spyOn(voiceDialogueService, 'speak').mockImplementation((_text, opts) => {
      capturedOptions = opts ?? null;
    });

    const multiLineThread: ChatThread = {
      ...dummyThread,
      callDialogue: [
        { text: 'Line One: Keep your voice down.', delayMs: 500 },
        { text: 'Line Two: Relay is secured.', delayMs: 500 },
      ],
    };

    const callState: HackerCallState = {
      id: 'c2',
      callerId: 'cipher',
      callerName: 'Cipher',
      callerRole: 'Underground Broker',
      callerOrg: '0xBoard',
      status: 'active',
      durationSeconds: 0,
      currentSubtitleIndex: 0,
      isMuted: false,
    };

    render(
      <HackerCallOverlay
        callState={callState}
        activeThread={multiLineThread}
        onAcceptCall={() => {}}
        onDeclineCall={() => {}}
        onEndCall={() => {}}
      />
    );

    // Initial 500ms delay before dialogue line 1 starts
    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(speakSpy).toHaveBeenCalledWith(
      'Line One: Keep your voice down.',
      expect.objectContaining({ isPhoneCall: true })
    );
    expect(screen.getByText(/VOICE STREAM \[1\/2\]/i)).toBeInTheDocument();

    // Advance typewriter timer: typewriter will complete typing Line One
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // Subtitle has Line One, but MUST NOT advance to Line Two yet because voice has NOT finished (onEnd not called)
    expect(screen.getByText(/VOICE STREAM \[1\/2\]/i)).toBeInTheDocument();
    expect(screen.getByText('Line One: Keep your voice down.')).toBeInTheDocument();

    // Now voice completes and invokes onEnd callback
    const opts: any = capturedOptions;
    expect(opts?.onEnd).toBeDefined();
    act(() => {
      opts?.onEnd?.();
    });

    // Immediately after onEnd, it still waits for delayMs (500ms) before advancing
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText(/VOICE STREAM \[1\/2\]/i)).toBeInTheDocument();

    // Advance past delayMs (350ms more -> 550ms total)
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Now it should have advanced to Line Two
    expect(screen.getByText(/VOICE STREAM \[2\/2\]/i)).toBeInTheDocument();
    expect(speakSpy).toHaveBeenCalledWith(
      'Line Two: Relay is secured.',
      expect.objectContaining({ isPhoneCall: true })
    );

    speakSpy.mockRestore();
    vi.useRealTimers();
  });

  it('falls back to typewriter timer when voice is muted', async () => {
    vi.useFakeTimers();

    const { voiceDialogueService } = await import('@/presentation/audio/VoiceDialogueService');
    voiceDialogueService.setMuted(true);

    const multiLineThread: ChatThread = {
      ...dummyThread,
      callDialogue: [
        { text: 'Muted line one.', delayMs: 400 },
        { text: 'Muted line two.', delayMs: 400 },
      ],
    };

    const callState: HackerCallState = {
      id: 'c3',
      callerId: 'cipher',
      callerName: 'Cipher',
      callerRole: 'Underground Broker',
      callerOrg: '0xBoard',
      status: 'active',
      durationSeconds: 0,
      currentSubtitleIndex: 0,
      isMuted: true,
    };

    render(
      <HackerCallOverlay
        callState={callState}
        activeThread={multiLineThread}
        onAcceptCall={() => {}}
        onDeclineCall={() => {}}
        onEndCall={() => {}}
      />
    );

    // Initial 500ms delay before dialogue line 1 starts
    act(() => {
      vi.advanceTimersByTime(550);
    });
    expect(screen.getByText(/VOICE STREAM \[1\/2\]/i)).toBeInTheDocument();

    // In muted mode, typewriter finishes and schedules advance after delayMs (400ms)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Subtitle has advanced to line 2
    expect(screen.getByText(/VOICE STREAM \[2\/2\]/i)).toBeInTheDocument();

    voiceDialogueService.setMuted(false);
    vi.useRealTimers();
  });
});
