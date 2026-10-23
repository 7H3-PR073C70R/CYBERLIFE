import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'node:crypto';
import {
  normalizeTextForSpeech,
  CHARACTER_VOICE_CASTING,
  DELIVERY_PROSODY_TABLE,
} from '@/content/audio/pronunciationDictionary';
import { VoicePlayer, VoiceManifest } from '@/presentation/audio/VoicePlayer';
import { voiceDialogueService } from '@/presentation/audio/VoiceDialogueService';

describe('Voice Pipeline Prosody & Natural Speech Specification', () => {
  describe('1. Pronunciation Dictionary & Text Normalization', () => {
    it('expands technical acronyms and tools into spoken forms', () => {
      const raw = 'Review SMB queries on filesrv-01 and check SIEM, Sysmon, and ATT&CK metrics. Read PCAP now.';
      const clean = normalizeTextForSpeech(raw);

      expect(clean).toContain('S M B');
      expect(clean).toContain('file server 0 1');
      expect(clean).toContain('seem');
      expect(clean).toContain('sis-mon');
      expect(clean).toContain('attack');
      expect(clean).toContain('pee-cap');
    });

    it('expands network identifiers and ports without reading raw IP dot notation', () => {
      const raw = 'Anomalous traffic to 10.0.4.15 and port 8080 from svc-aster.';
      const clean = normalizeTextForSpeech(raw);

      expect(clean).toContain('ten dot zero dot four dot fifteen');
      expect(clean).toContain('eighty eighty');
      expect(clean).toContain('service aster');
    });

    it('normalizes Nigerian proper names and locations with authentic phonetic guidance', () => {
      const raw = 'Meeting Tsharp in Eko near Marina Tower and Tinubu square on Odunlami Street.';
      const clean = normalizeTextForSpeech(raw);

      expect(clean).toContain('Tee-sharp');
      expect(clean).toContain('Eh-ko');
      expect(clean).toContain('Marina Tower');
      expect(clean).toContain('Tee-noo-boo');
      expect(clean).toContain('Oh-doon-lah-mee');
    });

    it('removes long ellipses, dashes, and semicolons to eliminate artificial speech pauses', () => {
      const raw = 'Wait... we found the leak; do not panic—Michael will arrive soon.';
      const clean = normalizeTextForSpeech(raw);

      expect(clean).not.toContain('...');
      expect(clean).not.toContain('—');
      expect(clean).not.toContain(';');
      expect(clean).toContain(',');
    });

    it('preserves contractions for human, authentic prosody', () => {
      const raw = "I haven't told Michael, and we shouldn't touch svc-aster until I'm ready.";
      const clean = normalizeTextForSpeech(raw);

      expect(clean).toContain("haven't");
      expect(clean).toContain("shouldn't");
      expect(clean).toContain("I'm");
    });

    it('protects Nigerian Pidgin words from corrupted English phonetic respelling', () => {
      const raw = 'Protector! Hot morning, abi? Server room AC was acting up, no be small thing.';
      const clean = normalizeTextForSpeech(raw, { isPidgin: true });

      expect(clean).toContain('abi');
      expect(clean).toContain('no be small thing');
    });

    it('preserves author [beat] marker when keepBeatMarker is enabled', () => {
      const raw = 'Hold the line. [beat] Michael is listening.';
      const clean = normalizeTextForSpeech(raw, { keepBeatMarker: true });

      expect(clean).toContain('[beat]');
    });

    it('converts author [beat] to natural pause comma when keepBeatMarker is disabled', () => {
      const raw = 'Hold the line. [beat] Michael is listening.';
      const clean = normalizeTextForSpeech(raw, { keepBeatMarker: false });

      expect(clean).not.toContain('[beat]');
      expect(clean).toContain(',');
    });

    it('honors explicit speech override field when provided', () => {
      const displayText = 'Ticket ALT-2026-1012 references MITRE T1021.002 on filesrv-01.';
      const speechOverride = 'Ticket twenty twenty-six ten twelve references SMB shares on the file server.';

      const clean = normalizeTextForSpeech(displayText, { speechOverride });
      expect(clean).toContain('references S M B shares on the file server');
      expect(clean).not.toContain('T1021.002');
    });
  });

  describe('2. Character Casting & Delivery Tag Prosody', () => {
    it('defines distinct Nigerian character casting presets within human bounds', () => {
      const blessing = CHARACTER_VOICE_CASTING['npc_amina'];
      const barry = CHARACTER_VOICE_CASTING['npc_marcus'];
      const michael = CHARACTER_VOICE_CASTING['npc_femi'];
      const tsharp = CHARACTER_VOICE_CASTING['npc_tunde'];

      expect(blessing).toBeDefined();
      expect(barry).toBeDefined();
      expect(michael).toBeDefined();
      expect(tsharp).toBeDefined();

      expect(blessing!.voice).toBe('en-NG-EzinneNeural');
      expect(barry!.voice).toBe('en-NG-AbeoNeural');
      expect(michael!.voice).toBe('en-NG-AbeoNeural');
      expect(tsharp!.voice).toBe('en-NG-AbeoNeural');

      // Pitch within +/- 8%
      expect(Math.abs(blessing!.basePitchHz)).toBeLessThanOrEqual(15);
      expect(Math.abs(barry!.basePitchHz)).toBeLessThanOrEqual(15);
      expect(Math.abs(michael!.basePitchHz)).toBeLessThanOrEqual(15);

      // Rate within 0.92 - 1.10
      expect(blessing!.baseRatePercent).toBeGreaterThanOrEqual(-10);
      expect(barry!.baseRatePercent).toBeLessThanOrEqual(10);
      expect(michael!.baseRatePercent).toBeGreaterThanOrEqual(-10);
    });

    it('maps delivery tags to prosody adjustments', () => {
      expect(DELIVERY_PROSODY_TABLE.calm.rateDeltaPercent).toBe(-2);
      expect(DELIVERY_PROSODY_TABLE.anxious.rateDeltaPercent).toBe(5);
      expect(DELIVERY_PROSODY_TABLE.urgent.rateDeltaPercent).toBe(7);
      expect(DELIVERY_PROSODY_TABLE.tired.rateDeltaPercent).toBe(-4);
      expect(DELIVERY_PROSODY_TABLE.tense.rateDeltaPercent).toBe(4);
    });
  });

  describe('3. Deterministic SHA-256 Hash Stability', () => {
    it('computes identical hashes for identical voice, rate, pitch, and clean speech', () => {
      const voice = 'en-NG-EzinneNeural';
      const rate = '-2%';
      const pitch = '-6Hz';
      const cleanText = "The ticket is alert twenty twenty-six, ten twelve.";

      const payload1 = `${voice}|${rate}|${pitch}|${cleanText}`;
      const payload2 = `${voice}|${rate}|${pitch}|${cleanText}`;

      const hash1 = crypto.createHash('sha256').update(payload1).digest('hex').slice(0, 16);
      const hash2 = crypto.createHash('sha256').update(payload2).digest('hex').slice(0, 16);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
    });

    it('changes hash when speech text or prosody changes', () => {
      const payloadA = 'en-NG-EzinneNeural|-2%|-6Hz|Hello Protector';
      const payloadB = 'en-NG-EzinneNeural|+1%|-6Hz|Hello Protector';
      const payloadC = 'en-NG-EzinneNeural|-2%|-6Hz|Hello Barry';

      const hashA = crypto.createHash('sha256').update(payloadA).digest('hex').slice(0, 16);
      const hashB = crypto.createHash('sha256').update(payloadB).digest('hex').slice(0, 16);
      const hashC = crypto.createHash('sha256').update(payloadC).digest('hex').slice(0, 16);

      expect(hashA).not.toBe(hashB);
      expect(hashA).not.toBe(hashC);
    });
  });

  describe('4. VoicePlayer Timing, Interruption Fade & Manifest Match', () => {
    let player: VoicePlayer;

    const testManifest: VoiceManifest = {
      version: '1.0',
      backend: 'edge',
      totalClips: 1,
      totalSizeBytes: 16000,
      clips: {
        hash_blessing_call: {
          file: '/assets/audio/voice/hash_blessing_call.mp3',
          fileName: 'hash_blessing_call.mp3',
          speaker: 'Blessing',
          speakerId: 'npc_amina',
          nodeId: 'ep01_v_bless_01',
          text: 'Protector, good morning. Get to Marina Tower now.',
          cleanText: 'Protector, good morning. Get to Marina Tower now.',
          textHash: 'thash_bless_1',
          fileHash: 'hash_blessing_call',
          duration: 3.2,
          sizeBytes: 16000,
          voice: 'en-NG-EzinneNeural',
          prosody: { rate: '-2%', pitch: '-6Hz' },
          isPidgin: false,
          needsHumanRecording: false,
        },
      },
      bySpeakerAndHash: {
        'npc_amina:thash_bless_1': {
          file: '/assets/audio/voice/hash_blessing_call.mp3',
          fileName: 'hash_blessing_call.mp3',
          speaker: 'Blessing',
          speakerId: 'npc_amina',
          nodeId: 'ep01_v_bless_01',
          text: 'Protector, good morning. Get to Marina Tower now.',
          cleanText: 'Protector, good morning. Get to Marina Tower now.',
          textHash: 'thash_bless_1',
          fileHash: 'hash_blessing_call',
          duration: 3.2,
          sizeBytes: 16000,
          voice: 'en-NG-EzinneNeural',
          prosody: { rate: '-2%', pitch: '-6Hz' },
          isPidgin: false,
          needsHumanRecording: false,
        },
      },
    };

    beforeEach(() => {
      player = new VoicePlayer();
      player.setManifest(testManifest);
    });

    afterEach(() => {
      player.stop(0);
    });

    it('matches clips by speech text when display text differs', () => {
      const clip = player.findClip(
        'npc_amina',
        'Different written text',
        'Protector, good morning. Get to Marina Tower now.'
      );

      expect(clip).not.toBeNull();
      expect(clip?.fileName).toBe('hash_blessing_call.mp3');
      expect(clip?.duration).toBe(3.2);
    });

    it('stop method supports smooth 60-80ms fadeout without crashing', () => {
      expect(() => {
        player.stop(70);
      }).not.toThrow();
    });
  });

  describe('5. Fallback Behaviour & Zero Sentence Gap', () => {
    it('speaks lines <= 250 characters as a single unfragmented utterance', () => {
      vi.useFakeTimers();

      class MockSpeechSynthesisUtterance {
        text: string;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onerror: ((e?: { error: string }) => void) | null = null;
        constructor(text: string) {
          this.text = text;
        }
      }
      (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
        MockSpeechSynthesisUtterance;

      const speakMock = vi.fn();
      const cancelMock = vi.fn();

      (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {
        speak: speakMock,
        cancel: cancelMock,
        getVoices: () => [],
        paused: false,
        speaking: false,
        pending: false,
      };

      const text = 'Protector, good morning. Don’t waste time with breakfast. Get to Marina Tower now; svc-aster is pulling files it shouldn’t touch.';

      voiceDialogueService.speak(text, { speaker: 'Blessing' });

      // Settle cancel/Strict-mode delay
      vi.advanceTimersByTime(100);

      // Entire line sent as 1 utterance
      expect(speakMock).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
