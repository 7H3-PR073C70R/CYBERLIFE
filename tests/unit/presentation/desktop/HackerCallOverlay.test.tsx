/**
 * Cyberlife — HackerCallOverlay Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HackerCallOverlay } from '@/presentation/desktop/HackerCallOverlay';
import { HackerCallState, ChatThread } from '@/simulation/cyber/chat/types';

describe('HackerCallOverlay', () => {
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
});
