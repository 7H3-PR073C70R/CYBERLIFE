import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { voiceDialogueService } from '@/presentation/audio/VoiceDialogueService';

describe('VoiceDialogueService', () => {
  beforeEach(() => {
    voiceDialogueService.setMuted(false);
  });

  afterEach(() => {
    voiceDialogueService.stop();
  });

  it('cleans technical jargon and acronyms for natural human speech', () => {
    const raw = '*electronic audio static* Tade, check CVE-2026-445 on filesrv-01 and alert SOC ASAP!';
    const cleaned = voiceDialogueService.cleanTextForSpeech(raw);

    expect(cleaned).not.toContain('*');
    expect(cleaned).toContain('C V E 2026, 445');
    expect(cleaned).toContain('file server 0 1');
    expect(cleaned).toContain('sock');
    expect(cleaned).toContain('as soon as possible');
  });

  it('suppresses bracketed silent stage directions from speech', () => {
    const raw = '[Call encrypted line silent... connection remains active]';
    const cleaned = voiceDialogueService.cleanTextForSpeech(raw);
    expect(cleaned).toBe('');
  });

  it('expands common security acronyms like ZRTP, AES, SMB, IAM, and IoCs', () => {
    const raw = 'ZRTP with 256-bit AES detected anomalous SMB queries and invalid IAM roles. Check IoCs now.';
    const cleaned = voiceDialogueService.cleanTextForSpeech(raw);

    expect(cleaned).toContain('Z R T P');
    expect(cleaned).toContain('A E S');
    expect(cleaned).toContain('S M B');
    expect(cleaned).toContain('I A M');
    expect(cleaned).toContain("I o C's");
  });

  it('supports muting and unmuting voice playback', () => {
    expect(voiceDialogueService.getIsMuted()).toBe(false);

    voiceDialogueService.toggleMute();
    expect(voiceDialogueService.getIsMuted()).toBe(true);

    voiceDialogueService.toggleMute();
    expect(voiceDialogueService.getIsMuted()).toBe(false);
  });

  it('notifies speaking listeners on state changes', () => {
    const listener = vi.fn();
    const unsubscribe = voiceDialogueService.onSpeakingChange(listener);

    // Speak in environment without Web Speech should trigger safe fallback
    voiceDialogueService.speak('Hello Tade', { speaker: 'Temitope Blessing' });

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
