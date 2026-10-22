import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoicePlayer, VoiceManifest } from '@/presentation/audio/VoicePlayer';
import { audioManager } from '@/presentation/audio/AudioManager';
import { voiceDialogueService } from '@/presentation/audio/VoiceDialogueService';
import { phoneFilterChain } from '@/presentation/audio/PhoneFilterChain';

describe('VoicePlayer', () => {
  let player: VoicePlayer;

  const mockManifest: VoiceManifest = {
    version: '1.0',
    backend: 'edge',
    totalClips: 2,
    totalSizeBytes: 32000,
    clips: {
      hash_amina_greet: {
        file: '/assets/audio/voice/hash_amina_greet.mp3',
        fileName: 'hash_amina_greet.mp3',
        speaker: 'Blessing',
        speakerId: 'npc_amina',
        nodeId: 'amina_greeting',
        text: 'Tade, welcome to the SOC. We have an active incident underway.',
        cleanText: 'Tade, welcome to the sock. We have an active incident underway.',
        textHash: 'texthash_amina_1',
        fileHash: 'hash_amina_greet',
        duration: 4.25,
        sizeBytes: 16000,
        voice: 'en-NG-EzinneNeural',
        prosody: { rate: '+0%', pitch: '+2Hz' },
        isPidgin: false,
        needsHumanRecording: false,
      },
      hash_nkechi_greet: {
        file: '/assets/audio/voice/hash_nkechi_greet.mp3',
        fileName: 'hash_nkechi_greet.mp3',
        speaker: 'Mama Esther',
        speakerId: 'npc_nkechi',
        nodeId: 'nkechi_greeting',
        text: 'Kedu! Welcome, my friend! You need phone charger or cold Chapman drink?',
        cleanText: 'Kedu! Welcome, my friend! You need phone charger or cold Chapman drink?',
        textHash: 'texthash_nkechi_1',
        fileHash: 'hash_nkechi_greet',
        duration: 3.8,
        sizeBytes: 15000,
        voice: 'en-NG-EzinneNeural',
        prosody: { rate: '+3%', pitch: '+4Hz' },
        isPidgin: true,
        needsHumanRecording: true,
      },
    },
    bySpeakerAndHash: {
      'npc_amina:texthash_amina_1': {
        file: '/assets/audio/voice/hash_amina_greet.mp3',
        fileName: 'hash_amina_greet.mp3',
        speaker: 'Blessing',
        speakerId: 'npc_amina',
        nodeId: 'amina_greeting',
        text: 'Tade, welcome to the SOC. We have an active incident underway.',
        cleanText: 'Tade, welcome to the sock. We have an active incident underway.',
        textHash: 'texthash_amina_1',
        fileHash: 'hash_amina_greet',
        duration: 4.25,
        sizeBytes: 16000,
        voice: 'en-NG-EzinneNeural',
        prosody: { rate: '+0%', pitch: '+2Hz' },
        isPidgin: false,
        needsHumanRecording: false,
      },
      'npc_nkechi:texthash_nkechi_1': {
        file: '/assets/audio/voice/hash_nkechi_greet.mp3',
        fileName: 'hash_nkechi_greet.mp3',
        speaker: 'Mama Esther',
        speakerId: 'npc_nkechi',
        nodeId: 'nkechi_greeting',
        text: 'Kedu! Welcome, my friend! You need phone charger or cold Chapman drink?',
        cleanText: 'Kedu! Welcome, my friend! You need phone charger or cold Chapman drink?',
        textHash: 'texthash_nkechi_1',
        fileHash: 'hash_nkechi_greet',
        duration: 3.8,
        sizeBytes: 15000,
        voice: 'en-NG-EzinneNeural',
        prosody: { rate: '+3%', pitch: '+4Hz' },
        isPidgin: true,
        needsHumanRecording: true,
      },
    },
  };

  beforeEach(() => {
    player = new VoicePlayer();
    player.setManifest(mockManifest);
    audioManager.setMuted(false);
    voiceDialogueService.setMuted(false);
  });

  afterEach(() => {
    player.stop();
    vi.restoreAllMocks();
  });

  describe('Text Normalization & Pidgin Rules', () => {
    it('normalizes acronyms and strips stage descriptors for standard dialogue', () => {
      const raw = '*static* Tade, review CVE-2026-445 on filesrv-01 and alert SOC ASAP!';
      const clean = player.cleanTextForSpeech(raw, false);

      expect(clean).not.toContain('*static*');
      expect(clean).toContain('C V E 2026, 445');
      expect(clean).toContain('file server 0 1');
      expect(clean).toContain('sock');
      expect(clean).toContain('as soon as possible');
    });

    it('preserves Nigerian Pidgin phrasing without corruptive English phonetic respelling', () => {
      const raw = 'Kedu! Eh-heh! Iya Basira dey panic about BVN scam, my brother!';
      const clean = player.cleanTextForSpeech(raw, true);

      expect(clean).toContain('Kedu!');
      expect(clean).toContain('Eh-heh!');
      expect(clean).toContain('dey panic');
      expect(clean).toContain('my brother!');
    });

    it('returns empty string for bracketed stage note lines', () => {
      const raw = '[Call encrypted line silent... connection remains active]';
      expect(player.cleanTextForSpeech(raw)).toBe('');
    });
  });

  describe('Manifest Lookup', () => {
    it('finds existing pre-rendered clip by speakerId and text', () => {
      const clip = player.findClip(
        'npc_amina',
        'Tade, welcome to the SOC. We have an active incident underway.'
      );
      expect(clip).not.toBeNull();
      expect(clip?.fileName).toBe('hash_amina_greet.mp3');
      expect(clip?.duration).toBe(4.25);
      expect(clip?.voice).toBe('en-NG-EzinneNeural');
    });

    it('finds Nigerian Pidgin clip marked for human recording', () => {
      const clip = player.findClip(
        'npc_nkechi',
        'Kedu! Welcome, my friend! You need phone charger or cold Chapman drink?'
      );
      expect(clip).not.toBeNull();
      expect(clip?.isPidgin).toBe(true);
      expect(clip?.needsHumanRecording).toBe(true);
      expect(clip?.fileName).toBe('hash_nkechi_greet.mp3');
    });

    it('returns null when line is not in the manifest', () => {
      const clip = player.findClip('npc_marcus', 'Unregistered dialogue line not in manifest.');
      expect(clip).toBeNull();
    });
  });

  describe('Fallback to Browser SpeechSynthesis', () => {
    it('falls back to voiceDialogueService.speak when clip is missing', () => {
      const speakSpy = vi.spyOn(voiceDialogueService, 'speak');
      const unrenderedText = 'This line has no pre-rendered audio file.';

      const handle = player.playVoice(unrenderedText, {
        speaker: 'Barry',
        speakerId: 'npc_marcus',
      });

      expect(handle.isUsingPreRendered).toBe(false);
      expect(handle.durationMs).toBeGreaterThan(0);
      expect(speakSpy).toHaveBeenCalledWith(
        unrenderedText,
        expect.objectContaining({ speaker: 'Barry' })
      );
    });

    it('respects mute state and suppresses playback', () => {
      audioManager.setMuted(true);
      const speakSpy = vi.spyOn(voiceDialogueService, 'speak');

      const handle = player.playVoice('Some text', { speakerId: 'npc_amina' });
      expect(handle.durationMs).toBe(0);
      expect(speakSpy).not.toHaveBeenCalled();
    });
  });

  describe('Phone Filter Chain & Oscilloscope Data', () => {
    it('routes phone calls through phoneFilterChain and enables line noise', () => {
      const noiseStartSpy = vi.spyOn(phoneFilterChain, 'startCallNoise');

      player.playVoice('Tade, can you hear me? Secure line established.', {
        speaker: 'Blessing',
        speakerId: 'amina-okonjo',
        isPhoneCall: true,
      });

      expect(noiseStartSpy).toHaveBeenCalled();
    });

    it('toggles phone filter chain bypass switch cleanly', () => {
      expect(phoneFilterChain.getIsEnabled()).toBe(true);

      phoneFilterChain.setEnabled(false);
      expect(phoneFilterChain.getIsEnabled()).toBe(false);

      phoneFilterChain.setEnabled(true);
      expect(phoneFilterChain.getIsEnabled()).toBe(true);
    });

    it('fills oscilloscope buffer with baseline 128 (center PCM) when idle', () => {
      const buffer = new Uint8Array(64);
      buffer.fill(0);

      player.getWaveformData(buffer);
      // All values should be flat center (128)
      expect(buffer.every(val => val === 128)).toBe(true);
    });
  });
});
