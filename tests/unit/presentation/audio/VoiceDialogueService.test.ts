import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  voiceDialogueService,
  splitIntoSentences,
  isVoiceFemale,
  isVoiceMale,
  isNigerianVoice,
  CharacterVoiceProfile,
} from '@/presentation/audio/VoiceDialogueService';

describe('VoiceDialogueService', () => {
  beforeEach(() => {
    voiceDialogueService.setMuted(false);
  });

  afterEach(() => {
    voiceDialogueService.stop();
    vi.restoreAllMocks();
  });

  describe('Text preprocessing & sanitization', () => {
    it('cleans technical jargon and acronyms for natural human speech', () => {
      const raw = '*electronic audio static* Protector, check CVE-2026-445 on filesrv-01 and alert SOC ASAP!';
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
  });

  describe('Mute toggle & persistence', () => {
    it('supports muting and unmuting voice playback with storage sync', () => {
      expect(voiceDialogueService.getIsMuted()).toBe(false);

      voiceDialogueService.toggleMute();
      expect(voiceDialogueService.getIsMuted()).toBe(true);

      voiceDialogueService.toggleMute();
      expect(voiceDialogueService.getIsMuted()).toBe(false);
    });

    it('notifies speaking listeners on state changes in headless fallback', () => {
      const listener = vi.fn();
      const unsubscribe = voiceDialogueService.onSpeakingChange(listener);

      voiceDialogueService.speak('Hello Protector', { speaker: 'Blessing' });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('Sentence splitting (15-second Chrome cutoff prevention)', () => {
    it('splits multi-sentence text into individual sequential utterances', () => {
      const text =
        'Protector, welcome to the SOC. We have an active incident on filesrv-01! Can you inspect the logs?';
      const sentences = splitIntoSentences(text);

      expect(sentences).toEqual([
        'Protector, welcome to the SOC.',
        'We have an active incident on filesrv-01!',
        'Can you inspect the logs?',
      ]);
    });

    it('handles single sentences without trailing punctuation', () => {
      const sentences = splitIntoSentences('Relay is 3 hops deep');
      expect(sentences).toEqual(['Relay is 3 hops deep']);
    });

    it('handles multiline dialogue breaks cleanly', () => {
      const multiline = 'Line one.\nLine two!\n\nLine three?';
      const sentences = splitIntoSentences(multiline);
      expect(sentences).toEqual(['Line one.', 'Line two!', 'Line three?']);
    });

    it('returns empty array for empty or whitespace strings', () => {
      expect(splitIntoSentences('')).toEqual([]);
      expect(splitIntoSentences('   \n  ')).toEqual([]);
    });
  });

  describe('Gender voice selection and Nigerian English priority', () => {
    const mockVoices: SpeechSynthesisVoice[] = [
      {
        name: 'Tessa',
        lang: 'en-ZA',
        default: false,
        localService: true,
        voiceURI: 'Tessa',
      },
      {
        name: 'Victoria',
        lang: 'en-GB',
        default: false,
        localService: true,
        voiceURI: 'Victoria',
      },
      {
        name: 'Microsoft Jenny (Female)',
        lang: 'en-US',
        default: false,
        localService: true,
        voiceURI: 'Jenny',
      },
      {
        name: 'Daniel',
        lang: 'en-GB',
        default: false,
        localService: true,
        voiceURI: 'Daniel',
      },
      {
        name: 'Oliver',
        lang: 'en-GB',
        default: false,
        localService: true,
        voiceURI: 'Oliver',
      },
      {
        name: 'Microsoft Abeo Online (Natural) - English (Nigeria)',
        lang: 'en-NG',
        default: false,
        localService: false,
        voiceURI: 'Abeo',
      },
      {
        name: 'Microsoft Ezinne Online (Natural) - English (Nigeria)',
        lang: 'en-NG',
        default: false,
        localService: false,
        voiceURI: 'Ezinne',
      },
    ];

    it('correctly classifies male and female voices by exact tokens', () => {
      const jenny = mockVoices.find(v => v.name.includes('Jenny'))!;
      const tessa = mockVoices.find(v => v.name === 'Tessa')!;
      const daniel = mockVoices.find(v => v.name === 'Daniel')!;

      // "female" must NOT match as "male" even though "female" contains the substring "male"
      expect(isVoiceFemale(jenny)).toBe(true);
      expect(isVoiceMale(jenny)).toBe(false);

      expect(isVoiceFemale(tessa)).toBe(true);
      expect(isVoiceMale(tessa)).toBe(false);

      expect(isVoiceMale(daniel)).toBe(true);
      expect(isVoiceFemale(daniel)).toBe(false);
    });

    it('identifies en-NG without matching loose ng substrings', () => {
      const abeo = mockVoices.find(v => v.name.includes('Abeo'))!;
      expect(isNigerianVoice(abeo)).toBe(true);

      const fakeSingaporeVoice: SpeechSynthesisVoice = {
        name: 'English (Singapore)',
        lang: 'en-SG',
        default: false,
        localService: true,
        voiceURI: 'SG',
      };
      // Must not match on 'ng' substring
      expect(isNigerianVoice(fakeSingaporeVoice)).toBe(false);
    });

    it('NEVER selects a female voice for a male request (e.g. Barry)', () => {
      const maleProfile: CharacterVoiceProfile = {
        preferredGender: 'male',
        pitch: 1.02,
        rate: 1.03,
        volume: 1.0,
        voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'oliver'],
      };

      // Even though Tessa is en-ZA (African Commonwealth), Tessa is female and must NEVER match
      const selected = voiceDialogueService.selectVoice(maleProfile, undefined, mockVoices);
      expect(selected).not.toBeNull();
      expect(selected!.name).toBe('Microsoft Abeo Online (Natural) - English (Nigeria)');
      expect(isVoiceFemale(selected!)).toBe(false);

      // When Nigerian male voice is removed, it must choose Daniel or Oliver, NEVER Tessa or Victoria
      const withoutAbeo = mockVoices.filter(v => !v.name.includes('Abeo'));
      const fallbackMale = voiceDialogueService.selectVoice(maleProfile, undefined, withoutAbeo);
      expect(fallbackMale).not.toBeNull();
      expect(isVoiceFemale(fallbackMale!)).toBe(false);
      expect(['Daniel', 'Oliver']).toContain(fallbackMale!.name);
    });

    it('NEVER selects a male voice for a female request (e.g. Blessing)', () => {
      const femaleProfile: CharacterVoiceProfile = {
        preferredGender: 'female',
        pitch: 1.05,
        rate: 0.98,
        volume: 1.0,
        voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena'],
      };

      const selected = voiceDialogueService.selectVoice(femaleProfile, undefined, mockVoices);
      expect(selected).not.toBeNull();
      expect(selected!.name).toBe('Microsoft Ezinne Online (Natural) - English (Nigeria)');
      expect(isVoiceMale(selected!)).toBe(false);

      // When Nigerian female voice is removed, choose Tessa or Victoria, NEVER Daniel or Oliver
      const withoutEzinne = mockVoices.filter(v => !v.name.includes('Ezinne'));
      const fallbackFemale = voiceDialogueService.selectVoice(femaleProfile, undefined, withoutEzinne);
      expect(fallbackFemale).not.toBeNull();
      expect(isVoiceMale(fallbackFemale!)).toBe(false);
      expect(['Tessa', 'Victoria', 'Microsoft Jenny (Female)']).toContain(fallbackFemale!.name);
    });

    it('returns null instead of picking a female voice if only female voices exist for a male request', () => {
      const onlyFemaleVoices = mockVoices.filter(v => isVoiceFemale(v));
      const maleProfile: CharacterVoiceProfile = {
        preferredGender: 'male',
        pitch: 1.0,
        rate: 1.0,
        volume: 1.0,
        voiceHints: ['male', 'daniel'],
      };

      const selected = voiceDialogueService.selectVoice(maleProfile, undefined, onlyFemaleVoices);
      expect(selected).toBeNull();
    });
  });

  describe('Token-based speech queue and stale event rejection', () => {
    it('ignores callbacks and state mutations from stale cancelled utterances', async () => {
      vi.useFakeTimers();

      class MockSpeechSynthesisUtterance {
        text: string;
        voice: unknown = null;
        pitch: number = 1;
        rate: number = 1;
        volume: number = 1;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onerror: ((e?: { error: string }) => void) | null = null;
        constructor(text: string) {
          this.text = text;
        }
      }
      (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
        MockSpeechSynthesisUtterance;

      let lastCreatedUtterance: MockSpeechSynthesisUtterance | null = null;
      const speakMock = vi.fn((utt: MockSpeechSynthesisUtterance) => {
        lastCreatedUtterance = utt;
      });
      const cancelMock = vi.fn();

      // Mock window.speechSynthesis in jsdom
      (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {
        speak: speakMock,
        cancel: cancelMock,
        getVoices: () => [],
        paused: false,
        speaking: false,
        pending: false,
      };

      const onEnd1 = vi.fn();
      const onEnd2 = vi.fn();

      // Speak call 1
      voiceDialogueService.speak('First utterance from effect 1', { onEnd: onEnd1 });
      const token1 = voiceDialogueService.getCurrentToken();

      // Advance timers so utterance 1 is created
      vi.advanceTimersByTime(70);
      expect(speakMock).toHaveBeenCalledTimes(1);
      const utterance1 = lastCreatedUtterance as MockSpeechSynthesisUtterance | null;
      expect(utterance1).not.toBeNull();

      // Speak call 2 starts (cancelling call 1)
      voiceDialogueService.speak('Second utterance from effect 2', { onEnd: onEnd2 });
      const token2 = voiceDialogueService.getCurrentToken();
      expect(token2).toBeGreaterThan(token1);

      // Simulate asynchronous late error event from cancelled utterance 1
      const u1 = utterance1 as unknown as { onerror?: (e: unknown) => void };
      u1?.onerror?.({ error: 'canceled' });
      // onEnd1 must NOT be called because utterance 1 has a stale session token!
      expect(onEnd1).not.toHaveBeenCalled();

      // Advance past delay for call 2 to start
      vi.advanceTimersByTime(70);
      expect(speakMock).toHaveBeenCalledTimes(2);
      const utterance2 = lastCreatedUtterance as unknown as { onend?: () => void };

      // Active utterance 2 completes
      utterance2?.onend?.();

      expect(onEnd1).not.toHaveBeenCalled();
      expect(onEnd2).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
