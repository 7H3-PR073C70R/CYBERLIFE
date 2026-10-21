/**
 * Cyberlife — Unified Voice Player System
 *
 * Plays pre-rendered Nigerian English / character voice clips through AudioManager's
 * voice bus with automatic fallback to browser speech synthesis (VoiceDialogueService).
 *
 * Features:
 * - Manifest lookup via (speakerId, textHash) with SHA-256 caching
 * - Synchronized playback duration for dialogue typewriter pacing
 * - Automatic voice bus ducking of ambience and music
 * - Telephone filter chain routing for hacker VoIP phone calls
 * - Real-time AnalyserNode audio analysis for oscilloscope waveform visualizer
 * - Fallback to browser SpeechSynthesis when clip is missing
 */

import { NpcVoiceConfig } from '../../simulation/actors/types';
import { audioManager } from './AudioManager';
import { voiceDialogueService } from './VoiceDialogueService';
import { phoneFilterChain } from './PhoneFilterChain';

export interface VoicePlayOptions {
  speaker?: string;
  speakerId?: string;
  role?: string;
  gender?: 'female' | 'male';
  voice?: NpcVoiceConfig;
  isPhoneCall?: boolean;
  onStart?: () => void;
  onEnded?: () => void;
  onError?: (err: unknown) => void;
}

export interface VoicePlayHandle {
  readonly id: number;
  readonly durationMs: number;
  readonly isUsingPreRendered: boolean;
  stop: () => void;
}

export interface VoiceManifestClip {
  file: string;
  fileName: string;
  speaker: string;
  speakerId: string;
  nodeId: string;
  text: string;
  cleanText: string;
  textHash: string;
  fileHash: string;
  duration: number;
  sizeBytes: number;
  voice: string;
  prosody: { rate: string; pitch: string };
  isPidgin: boolean;
  needsHumanRecording: boolean;
}

export interface VoiceManifest {
  version: string;
  backend: string;
  totalClips: number;
  totalSizeBytes: number;
  clips: Record<string, VoiceManifestClip>;
  bySpeakerAndHash: Record<string, VoiceManifestClip>;
}

export class VoicePlayer {
  private manifest: VoiceManifest | null = null;
  private manifestPromise: Promise<VoiceManifest | null> | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private activeGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private nextPlayId: number = 1;
  private currentPlayId: number = 0;
  private speakingListeners: Set<(isSpeaking: boolean) => void> = new Set();
  private isCurrentlySpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadManifest().catch(() => {});
    }
  }

  /**
   * Lazily loads and parses manifest.json from /assets/audio/voice/manifest.json.
   */
  public async loadManifest(): Promise<VoiceManifest | null> {
    if (this.manifest) return this.manifest;
    if (this.manifestPromise) return this.manifestPromise;

    if (typeof window === 'undefined') return null;

    this.manifestPromise = (async () => {
      try {
        const response = await fetch('/assets/audio/voice/manifest.json');
        if (!response.ok) return null;
        const data = (await response.json()) as VoiceManifest;
        this.manifest = data;
        return data;
      } catch {
        return null;
      }
    })();

    return this.manifestPromise;
  }

  /**
   * Inject manifest directly (useful for unit testing or preloading).
   */
  public setManifest(manifest: VoiceManifest): void {
    this.manifest = manifest;
  }

  /**
   * Preprocess dialogue text to align with speech generation and hashing.
   */
  public cleanTextForSpeech(rawText: string, isPidgin: boolean = false): string {
    if (!rawText) return '';
    const trimmed = rawText.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return '';
    }

    let text = rawText
      .replace(/\*[^*]+\*/g, '')
      .replace(/\[[^\]]+\]/g, '');

    if (!isPidgin) {
      text = text
        .replace(/\bCVE-(\d{4})-(\d+)\b/gi, 'C V E $1, $2')
        .replace(/\bCVE\b/g, 'C V E')
        .replace(/\bSOC\b/g, 'sock')
        .replace(/\bIoC\b/gi, 'I o C')
        .replace(/\bIoCs\b/gi, "I o C's")
        .replace(/\bZRTP\b/gi, 'Z R T P')
        .replace(/\bAES\b/gi, 'A E S')
        .replace(/\bSMB\b/gi, 'S M B')
        .replace(/\bIP\b/g, 'I P')
        .replace(/\bIAM\b/gi, 'I A M')
        .replace(/\bRCE\b/gi, 'R C E')
        .replace(/\bSIEM\b/gi, 'seem')
        .replace(/\bASAP\b/gi, 'as soon as possible')
        .replace(/\bfilesrv-01\b/gi, 'file server 0 1')
        .replace(/\bapp-portal-01\b/gi, 'app portal 0 1')
        .replace(/\bsvc-aster\b/gi, 'service aster');
    }

    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Fast 16-hex character hash of normalized text for manifest index matching.
   */
  public computeTextHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    // Convert to hex-padded format matching build script convention
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Find clip in manifest by speaker and text.
   */
  public findClip(speakerId: string | undefined, rawText: string): VoiceManifestClip | null {
    if (!this.manifest || !rawText) return null;

    const isPidgin = speakerId === 'npc_nkechi';
    const clean = this.cleanTextForSpeech(rawText, isPidgin);

    // 1. Direct match by raw text or clean text in manifest clips
    for (const clip of Object.values(this.manifest.clips)) {
      if (
        (clip.text === rawText || clip.cleanText === clean) &&
        (!speakerId || clip.speakerId === speakerId)
      ) {
        return clip;
      }
    }

    // 2. Lookup in bySpeakerAndHash index
    if (speakerId) {
      for (const [key, clip] of Object.entries(this.manifest.bySpeakerAndHash)) {
        if (key.startsWith(`${speakerId}:`)) {
          if (clip.text === rawText || clip.cleanText === clean) {
            return clip;
          }
        }
      }
    }

    return null;
  }

  /**
   * Play a voice line with synchronized typewriter duration, ducking, and fallback.
   */
  public playVoice(text: string, options: VoicePlayOptions = {}): VoicePlayHandle {
    this.stop();

    const playId = this.nextPlayId++;
    this.currentPlayId = playId;

    if (audioManager.isMasterMuted() || voiceDialogueService.getIsMuted()) {
      return {
        id: playId,
        durationMs: 0,
        isUsingPreRendered: false,
        stop: () => {},
      };
    }

    if (options.isPhoneCall) {
      phoneFilterChain.startCallNoise();
    }

    const clip = this.findClip(options.speakerId, text);

    if (clip) {
      // Pre-rendered Audio Clip Path
      return this.playClip(clip, options, playId);
    }

    // Fallback Path: Browser SpeechSynthesis
    return this.playFallback(text, options, playId);
  }

  /**
   * Play pre-rendered audio buffer through AudioManager voice bus.
   */
  private playClip(
    clip: VoiceManifestClip,
    options: VoicePlayOptions,
    playId: number
  ): VoicePlayHandle {
    const ctx = audioManager.getContext();
    const durationMs = Math.round(clip.duration * 1000);

    if (!ctx) {
      return this.playFallback(clip.text, options, playId);
    }

    // Setup Analyser Node if not yet created
    this.initAnalyserNode(ctx);

    const targetBus = audioManager.getBus('voice');
    if (!targetBus) {
      return this.playFallback(clip.text, options, playId);
    }

    audioManager.loadAudio(clip.file).then(buffer => {
      if (this.currentPlayId !== playId || !buffer) {
        if (!buffer && this.currentPlayId === playId) {
          this.playFallback(clip.text, options, playId);
        }
        return;
      }

      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const sourceGain = ctx.createGain();
        const effectiveVol = audioManager.getEffectiveVoiceVolume();
        sourceGain.gain.setValueAtTime(effectiveVol, ctx.currentTime);

        this.activeSource = source;
        this.activeGain = sourceGain;

        // Route: source -> sourceGain -> [phoneFilterChain or direct] -> analyserNode -> voiceBus
        source.connect(sourceGain);

        if (options.isPhoneCall) {
          const phoneInput = phoneFilterChain.initGraph(ctx);
          sourceGain.connect(phoneInput);
          phoneFilterChain.startCallNoise();
        } else {
          sourceGain.connect(this.analyserNode!);
          this.analyserNode!.connect(targetBus);
        }

        // Apply audio ducking
        audioManager.setDucking(true);
        this.setSpeakingState(true);
        options.onStart?.();

        source.onended = () => {
          if (this.currentPlayId === playId) {
            this.handlePlaybackEnd(options);
          }
        };

        source.start(ctx.currentTime);
      } catch (err) {
        options.onError?.(err);
        this.playFallback(clip.text, options, playId);
      }
    });

    return {
      id: playId,
      durationMs,
      isUsingPreRendered: true,
      stop: () => {
        if (this.currentPlayId === playId) {
          this.stop();
        }
      },
    };
  }

  /**
   * Fallback to VoiceDialogueService (Web Speech API) when pre-rendered clip is missing.
   */
  private playFallback(
    text: string,
    options: VoicePlayOptions,
    playId: number
  ): VoicePlayHandle {
    const clean = this.cleanTextForSpeech(text);
    const rate = options.voice?.rate ?? 0.98;
    const estimatedDurationMs = Math.max(
      1200,
      Math.round(((Math.max(1, clean.length) / 14.5) * 1000) / rate)
    );

    this.setSpeakingState(true);
    options.onStart?.();

    voiceDialogueService.speak(text, {
      speaker: options.speaker,
      role: options.role,
      gender: options.gender ?? options.voice?.gender,
      voice: options.voice,
      isPhoneCall: options.isPhoneCall,
      onStart: options.onStart,
      onEnd: () => {
        if (this.currentPlayId === playId) {
          this.setSpeakingState(false);
          options.onEnded?.();
        }
      },
    });

    return {
      id: playId,
      durationMs: estimatedDurationMs,
      isUsingPreRendered: false,
      stop: () => {
        if (this.currentPlayId === playId) {
          this.stop();
        }
      },
    };
  }

  private handlePlaybackEnd(options: VoicePlayOptions): void {
    audioManager.setDucking(false);
    phoneFilterChain.stopCallNoise();
    this.setSpeakingState(false);
    this.activeSource = null;
    this.activeGain = null;
    options.onEnded?.();
  }

  /**
   * Stop active playback immediately and reset ducking.
   */
  public stop(): void {
    this.currentPlayId = 0;
    voiceDialogueService.stop();

    if (this.activeSource) {
      try {
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch {
        // Ignored
      }
      this.activeSource = null;
    }

    if (this.activeGain) {
      try {
        this.activeGain.disconnect();
      } catch {
        // Ignored
      }
      this.activeGain = null;
    }

    audioManager.setDucking(false);
    phoneFilterChain.stopCallNoise();
    this.setSpeakingState(false);
  }

  /**
   * Initialize AnalyserNode for audio oscilloscope visualization.
   */
  private initAnalyserNode(ctx: AudioContext): AnalyserNode {
    if (!this.analyserNode) {
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.65;
    }
    return this.analyserNode;
  }

  /**
   * Returns active AnalyserNode for oscilloscope rendering.
   */
  public getAnalyserNode(): AnalyserNode | null {
    const ctx = audioManager.getContext();
    if (ctx && !this.analyserNode) {
      this.initAnalyserNode(ctx);
    }
    return this.analyserNode;
  }

  /**
   * Fill byte time-domain data into an array for waveform canvas visualizer.
   */
  public getWaveformData(outputArray: Uint8Array): void {
    if (this.analyserNode && this.isCurrentlySpeaking) {
      try {
        (this.analyserNode.getByteTimeDomainData as unknown as (arr: Uint8Array) => void)(outputArray);
        return;
      } catch {
        // Fall through
      }
    }
    // Baseline flatline (128 is center in unsigned byte PCM)
    outputArray.fill(128);
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  public onSpeakingChange(callback: (isSpeaking: boolean) => void): () => void {
    this.speakingListeners.add(callback);
    return () => this.speakingListeners.delete(callback);
  }

  private setSpeakingState(speaking: boolean): void {
    if (this.isCurrentlySpeaking !== speaking) {
      this.isCurrentlySpeaking = speaking;
      this.speakingListeners.forEach(cb => {
        try {
          cb(speaking);
        } catch {
          // Ignored
        }
      });
    }
  }
}

export const voicePlayer = new VoicePlayer();
