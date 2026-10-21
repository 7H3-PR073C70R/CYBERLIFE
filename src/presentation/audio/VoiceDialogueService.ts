/**
 * Cyberlife — Authentic Nigerian English Voice Dialogue Synthesis Service
 *
 * Provides natural, human-sounding speech synthesis for NPC in-world conversations
 * and secure hacker VoIP phone calls.
 *
 * Features:
 * - Robust token-based queue: every speak() gets a session token; stale events are ignored.
 * - StrictMode safe with cancel delay (50-100 ms) so Chrome TTS engine does not drop utterances.
 * - Sentence splitting to prevent Chrome from cutting off utterances exceeding ~15 seconds.
 * - Accurate gender matching: female voices never match male requests, and vice versa.
 * - Exact en-NG matching (lang equal to 'en-NG' / 'en_NG' or Nigeria in name, no loose 'ng' substrings).
 * - Prefers Edge "Natural" / "Online" neural voices when present.
 * - Voice choices cached per character and re-selected when onvoiceschanged fires.
 * - Clamped pitch (0.9-1.1) and rate (0.9-1.05) across all characters.
 * - User gesture unlock with clear console warning if autoplay is blocked.
 * - Mute persistence in localStorage ('cyberlife_voice_muted') and replay support.
 */

import { NpcVoiceConfig } from '../../simulation/actors/types';
import { audioManager } from './AudioManager';

export interface VoiceSpeakerOptions {
  speaker?: string;
  role?: string;
  gender?: 'female' | 'male';
  voice?: NpcVoiceConfig;
  isPhoneCall?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface CharacterVoiceProfile {
  preferredGender: 'female' | 'male';
  pitch: number;
  rate: number;
  volume: number;
  voiceHints: string[];
}

export const DEFAULT_CHARACTER_PROFILES: Record<string, CharacterVoiceProfile> = {
  // Lead SecOps / Mentor
  'Blessing': {
    preferredGender: 'female',
    pitch: 1.05,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena', 'samantha'],
  },
  'Temitope Blessing': {
    preferredGender: 'female',
    pitch: 1.05,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena', 'samantha'],
  },
  'Amina Okonjo': {
    preferredGender: 'female',
    pitch: 1.05,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena', 'samantha'],
  },

  // Junior Sysadmin
  'Tobi': {
    preferredGender: 'male',
    pitch: 1.02,
    rate: 1.03,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'oliver', 'george'],
  },
  'Marcus Adebayo': {
    preferredGender: 'male',
    pitch: 1.02,
    rate: 1.03,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'oliver', 'george'],
  },

  // Lead AI Engineer
  'Dr. Elizabeth': {
    preferredGender: 'female',
    pitch: 1.02,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['female', 'en-gb', 'en-us', 'karen', 'serena'],
  },
  'Elizabeth': {
    preferredGender: 'female',
    pitch: 1.02,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['female', 'en-gb', 'en-us', 'karen', 'serena'],
  },
  'Dr. Elena Chen': {
    preferredGender: 'female',
    pitch: 1.02,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['female', 'en-gb', 'en-us', 'karen', 'serena'],
  },

  // VP / Enterprise Executive
  'Gabriel': {
    preferredGender: 'male',
    pitch: 0.94,
    rate: 0.96,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'george'],
  },
  'VP Gabriel': {
    preferredGender: 'male',
    pitch: 0.94,
    rate: 0.96,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'george'],
  },
  'Femi Martins': {
    preferredGender: 'male',
    pitch: 0.94,
    rate: 0.96,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'george'],
  },

  // Merchant / Vendor
  'Mama Esther': {
    preferredGender: 'female',
    pitch: 1.08,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'serena'],
  },
  'Esther': {
    preferredGender: 'female',
    pitch: 1.08,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'serena'],
  },
  'Mama Nkechi': {
    preferredGender: 'female',
    pitch: 1.08,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'serena'],
  },

  // Community Elder & Historian
  'Uncle Ola': {
    preferredGender: 'male',
    pitch: 0.92,
    rate: 0.92,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'george', 'daniel'],
  },
  'Ola': {
    preferredGender: 'male',
    pitch: 0.92,
    rate: 0.92,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'george', 'daniel'],
  },
  'Uncle Segun': {
    preferredGender: 'male',
    pitch: 0.92,
    rate: 0.92,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'george', 'daniel'],
  },

  // Talent Liaison
  'Anjola': {
    preferredGender: 'female',
    pitch: 1.06,
    rate: 1.02,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena'],
  },
  'Folake Davies': {
    preferredGender: 'female',
    pitch: 1.06,
    rate: 1.02,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena'],
  },

  // Security Researcher
  'Tsharp': {
    preferredGender: 'male',
    pitch: 0.96,
    rate: 1.02,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'oliver', 'alex'],
  },
  'Tunde "ZeroDay" Bakare': {
    preferredGender: 'male',
    pitch: 0.96,
    rate: 1.02,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'oliver', 'alex'],
  },
  'Tunde Bakare': {
    preferredGender: 'male',
    pitch: 0.96,
    rate: 1.02,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'oliver', 'alex'],
  },

  // Underground Broker / Hacker Phone Calls
  'BarryBee': {
    preferredGender: 'male',
    pitch: 0.92,
    rate: 0.94,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'],
  },
  'Cipher': {
    preferredGender: 'male',
    pitch: 0.92,
    rate: 0.94,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'],
  },
  'Mr. K': {
    preferredGender: 'male',
    pitch: 0.92,
    rate: 0.94,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'],
  },

  // Protagonist / Intern Analyst
  'Protector': {
    preferredGender: 'male',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'],
  },

  // Additional Cast Members
  'Choker': {
    preferredGender: 'male',
    pitch: 0.90,
    rate: 0.95,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'],
  },
  'Miracle': {
    preferredGender: 'male',
    pitch: 0.98,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'oliver'],
  },
  'Michael': {
    preferredGender: 'male',
    pitch: 0.95,
    rate: 0.98,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'male', 'george', 'daniel'],
  },
  'Beth': {
    preferredGender: 'female',
    pitch: 1.04,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['en-ng', 'nigeria', 'female', 'serena', 'victoria'],
  },

  // Autonomous IDS Telemetry Engine (synthetic, flat voice)
  'Aster SIEM Bot': {
    preferredGender: 'male',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceHints: ['synth', 'robot', 'bad news', 'cellos', 'whisper', 'albert', 'fred'],
  },
};

/**
 * Split text into natural sentences to avoid Chrome's 15-second speech cutoff bug.
 */
export function splitIntoSentences(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  const parts = rawText
    .split(/(?<=[.!?])\s+|\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  return parts.length > 0 ? parts : [rawText.trim()];
}

const KNOWN_FEMALE_NAMES = new Set([
  'victoria', 'serena', 'samantha', 'karen', 'moira', 'fiona',
  'tessa', 'hazel', 'susan', 'heera', 'zira', 'jenny', 'aria',
  'sonia', 'natasha', 'libby', 'clara', 'neerja', 'ava', 'emma',
  'mia', 'ana', 'stephanie', 'amelia', 'alice', 'anna', 'alva',
  'amira', 'ezinne', 'carmit', 'damayanti'
]);

const KNOWN_MALE_NAMES = new Set([
  'daniel', 'oliver', 'george', 'rishi', 'alex', 'david', 'mark',
  'guy', 'ryan', 'tom', 'james', 'richard', 'brian', 'arthur',
  'prabhat', 'ravi', 'albert', 'fred', 'abeo', 'albert'
]);

/**
 * Check if a voice is known female using exact word boundary tokens.
 */
export function isVoiceFemale(v: SpeechSynthesisVoice): boolean {
  const name = v.name.toLowerCase();
  const tokens = name.split(/[\s\-()_,.]+/);
  if (tokens.includes('female') || tokens.includes('woman') || tokens.includes('girl')) {
    return true;
  }
  return tokens.some(t => KNOWN_FEMALE_NAMES.has(t));
}

/**
 * Check if a voice is known male using exact word boundary tokens.
 * Note: 'female' does NOT match 'male' when splitting by word boundary tokens.
 */
export function isVoiceMale(v: SpeechSynthesisVoice): boolean {
  const name = v.name.toLowerCase();
  const tokens = name.split(/[\s\-()_,.]+/);
  if (tokens.includes('male') || tokens.includes('man') || tokens.includes('boy')) {
    return true;
  }
  return tokens.some(t => KNOWN_MALE_NAMES.has(t));
}

/**
 * Check if a voice strictly matches Nigerian English (en-NG or Nigeria in name).
 * Strictly avoids loose substring matching on 'ng'.
 */
export function isNigerianVoice(v: SpeechSynthesisVoice): boolean {
  const lang = v.lang.trim().toLowerCase();
  const name = v.name.toLowerCase();
  const isEnNg =
    lang === 'en-ng' ||
    lang === 'en_ng' ||
    lang.startsWith('en-ng-') ||
    lang.startsWith('en_ng-');
  const hasNigeriaName = name.includes('nigeria') || name.includes('nigerian');
  return isEnNg || hasNigeriaName;
}

export function isNaturalVoice(v: SpeechSynthesisVoice): boolean {
  return v.name.includes('Natural') || v.name.includes('Online');
}

/**
 * Score a voice candidate for a character voice profile.
 * Returns -Infinity if voice violates gender constraint.
 */
export function scoreVoiceCandidate(
  v: SpeechSynthesisVoice,
  profile: CharacterVoiceProfile
): number {
  const female = isVoiceFemale(v);
  const male = isVoiceMale(v);

  // Exact gender constraint: female voice must NEVER match male request, and vice-versa
  if (profile.preferredGender === 'male' && female) {
    return -Infinity;
  }
  if (profile.preferredGender === 'female' && male) {
    return -Infinity;
  }

  let score = 0;
  const lang = v.lang.toLowerCase();

  // 1. Nigerian English match
  if (isNigerianVoice(v)) {
    score += 1000;
  }
  // 2. West African or African Commonwealth English match
  else if (lang.startsWith('en-gh') || lang.startsWith('en-za')) {
    score += 500;
  }
  // 3. British English (roots of Nigerian English)
  else if (lang.startsWith('en-gb')) {
    score += 300;
  }
  // 4. Any English voice
  else if (lang.startsWith('en')) {
    score += 100;
  } else {
    // Non-English voice
    score -= 200;
  }

  // Edge "Natural" / "Online" voices provide significantly higher acoustic quality
  if (isNaturalVoice(v)) {
    score += 250;
  }

  // Positive gender confirmation bonus
  if (profile.preferredGender === 'male' && male) {
    score += 100;
  } else if (profile.preferredGender === 'female' && female) {
    score += 100;
  }

  // Voice hints match (e.g., 'daniel', 'victoria', 'synth')
  const lowerName = v.name.toLowerCase();
  for (const hint of profile.voiceHints) {
    if (lowerName.includes(hint.toLowerCase())) {
      score += 60;
    }
  }

  return score;
}

export class VoiceDialogueService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private speakingListeners: Set<(isSpeaking: boolean) => void> = new Set();
  private lastSpokenText: string = '';
  private lastSpokenOptions?: VoiceSpeakerOptions;

  // Token-based queue tracking: stale events from cancelled utterances are ignored
  private currentToken: number = 0;
  private pendingStartTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingSentenceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Voice choice cache per character/speaker key
  private voiceCache: Map<string, SpeechSynthesisVoice | null> = new Map();

  // Autoplay gesture unlock and warning
  private gestureListenerAttached: boolean = false;
  private warnedAutoplay: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cyberlife_voice_muted');
        this.isMuted = stored === 'true';
      } catch {
        this.isMuted = false;
      }

      this.initVoices();
      this.initGestureUnlock();
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const populate = () => {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
        // Invalidate cached voice choices when voices change so best voices are re-selected
        this.voiceCache.clear();
      }
    };

    populate();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populate;
    }
  }

  private initGestureUnlock(): void {
    if (typeof window === 'undefined' || this.gestureListenerAttached) return;
    this.gestureListenerAttached = true;

    const unlock = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {
          // Ignored
        }
      }
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };

    window.addEventListener('click', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchstart', unlock, true);
  }

  private warnAutoplayBlocked(): void {
    if (this.warnedAutoplay) return;
    this.warnedAutoplay = true;
    console.warn(
      '[VoiceDialogueService] Speech synthesis blocked by browser autoplay policy. Audio will unlock on first user gesture.'
    );
  }

  /**
   * Find best matching voice for Nigerian English cadence and character profile.
   * Caches voice per character and strictly enforces gender constraints.
   */
  public selectVoice(
    profile: CharacterVoiceProfile,
    cacheKey?: string,
    providedVoices?: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | null {
    const key = cacheKey ? `${cacheKey}_${profile.preferredGender}` : undefined;
    if (key && this.voiceCache.has(key)) {
      return this.voiceCache.get(key) ?? null;
    }

    const voiceList =
      providedVoices ??
      (this.voices.length > 0
        ? this.voices
        : typeof window !== 'undefined' && 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : []);

    if (voiceList.length === 0) return null;

    let bestVoice: SpeechSynthesisVoice | null = null;
    let highestScore = -Infinity;

    for (const voice of voiceList) {
      const score = scoreVoiceCandidate(voice, profile);
      if (score > highestScore && score > 0) {
        highestScore = score;
        bestVoice = voice;
      }
    }

    // Fallback: If no candidate scored > 0, pick any English voice that does not violate gender
    if (!bestVoice) {
      bestVoice =
        voiceList.find(v => {
          if (profile.preferredGender === 'male' && isVoiceFemale(v)) return false;
          if (profile.preferredGender === 'female' && isVoiceMale(v)) return false;
          return v.lang.toLowerCase().startsWith('en');
        }) ?? null;
    }

    if (key) {
      this.voiceCache.set(key, bestVoice);
    }
    return bestVoice;
  }

  /**
   * Preprocess dialogue text to sound natural and non-robotic:
   * - Strips sound effect descriptors like *electronic audio static* or [encrypted line...]
   * - Expands technical acronyms (CVE, SOC, SMB, ZRTP) into natural spoken English
   */
  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    // If text is solely a bracketed stage note (e.g. "[Call encrypted line silent...]"), return empty
    const trimmed = rawText.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return '';
    }

    const text = rawText
      // Remove asterisks sound effects like *electronic audio static*
      .replace(/\*[^*]+\*/g, '')
      // Remove square bracket tags like [E] or [Info]
      .replace(/\[[^\]]+\]/g, '')
      // Normalize acronyms for natural human pronunciation
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
      .replace(/\bsvc-aster\b/gi, 'service aster')
      // Clean duplicate whitespace
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  /**
   * Speak a dialogue utterance with character-specific Nigerian English voicing.
   * Safe under React StrictMode via cancel delay and token-based event synchronization.
   */
  public speak(text: string, options: VoiceSpeakerOptions = {}): void {
    this.lastSpokenText = text;
    this.lastSpokenOptions = options;

    if (this.isMuted || audioManager.isMasterMuted()) return;

    // Graceful fallback for non-browser / headless / mock environments
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notifySpeaking(true);
      options.onStart?.();
      setTimeout(() => {
        this.notifySpeaking(false);
        options.onEnd?.();
      }, 100);
      return;
    }

    const clean = this.cleanTextForSpeech(text);
    if (!clean) {
      options.onStart?.();
      setTimeout(() => options.onEnd?.(), 50);
      return;
    }

    // Cancel existing speech immediately and invalidate previous session token
    this.stopAudioOnly();

    // Generate fresh session token for this speak request
    const sessionToken = ++this.currentToken;

    // Chrome drops speech if speak() is invoked immediately after cancel().
    // Delaying by 65ms allows Chrome's speech engine to settle and cleanly absorbs
    // React StrictMode double-mounting (effect 1 unmount cancels, effect 2 speaks once).
    this.pendingStartTimeout = setTimeout(() => {
      if (sessionToken !== this.currentToken) return;
      this.executeSpeak(sessionToken, clean, options);
    }, 65);
  }

  /**
   * Internal execution of speech across split sentences.
   */
  private executeSpeak(
    sessionToken: number,
    cleanText: string,
    options: VoiceSpeakerOptions
  ): void {
    if (sessionToken !== this.currentToken) return;

    // Determine character profile: use options.voice first, then character profiles, then defaults
    const speakerKey = options.speaker ?? 'default';
    const profile: CharacterVoiceProfile = this.resolveProfile(speakerKey, options);

    // Keep pitch strictly within [0.9, 1.1] and rate within [0.9, 1.05]
    const clampedPitch = Math.max(0.9, Math.min(1.1, profile.pitch));
    const clampedRate = Math.max(0.9, Math.min(1.05, profile.rate));
    const selectedVoice = this.selectVoice(profile, speakerKey);

    // Split text into sentences to bypass Chrome's 15-second speech cutoff
    const sentences = splitIntoSentences(cleanText);
    if (sentences.length === 0) {
      options.onStart?.();
      options.onEnd?.();
      return;
    }

    let sentenceIndex = 0;

    const speakSentence = (idx: number) => {
      if (sessionToken !== this.currentToken) return;

      const sentenceText = sentences[idx];
      if (!sentenceText) {
        this.notifySpeaking(false);
        this.currentUtterance = null;
        options.onEnd?.();
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(sentenceText);
        this.currentUtterance = utterance;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.pitch = clampedPitch;
        utterance.rate = clampedRate;
        utterance.volume = Math.max(
          0,
          Math.min(1.0, profile.volume * audioManager.getEffectiveVoiceVolume())
        );

        utterance.onstart = () => {
          if (sessionToken !== this.currentToken) return;
          if (idx === 0) {
            this.notifySpeaking(true);
            options.onStart?.();
          }
        };

        utterance.onend = () => {
          if (sessionToken !== this.currentToken) return;

          if (idx + 1 < sentences.length) {
            // Natural pause between sentences (110ms)
            this.pendingSentenceTimeout = setTimeout(() => {
              if (sessionToken === this.currentToken) {
                sentenceIndex++;
                speakSentence(sentenceIndex);
              }
            }, 110);
          } else {
            // Completed all sentences
            this.notifySpeaking(false);
            this.currentUtterance = null;
            options.onEnd?.();
          }
        };

        utterance.onerror = e => {
          // Ignore cancelled/interrupted errors from stale utterances
          if (sessionToken !== this.currentToken) return;

          if (e.error === 'not-allowed') {
            this.warnAutoplayBlocked();
          }

          this.notifySpeaking(false);
          this.currentUtterance = null;
          options.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        if (sessionToken !== this.currentToken) return;
        this.warnAutoplayBlocked();
        this.notifySpeaking(false);
        this.currentUtterance = null;
        options.onEnd?.();
      }
    };

    speakSentence(0);
  }

  private resolveProfile(
    speakerKey: string,
    options: VoiceSpeakerOptions
  ): CharacterVoiceProfile {
    if (options.voice) {
      return {
        preferredGender: options.voice.gender,
        pitch: options.voice.pitch,
        rate: options.voice.rate,
        volume: 1.0,
        voiceHints: [...(options.voice.voiceHints ?? [])],
      };
    }

    const defaultProfile = DEFAULT_CHARACTER_PROFILES[speakerKey];
    if (defaultProfile) {
      return defaultProfile;
    }

    const fallbackGender = options.gender ?? 'female';
    return {
      preferredGender: fallbackGender,
      pitch: fallbackGender === 'female' ? 1.05 : 0.96,
      rate: 0.98,
      volume: 1.0,
      voiceHints: ['nigeria', 'en-ng'],
    };
  }

  /**
   * Internal cancellation of active audio without notifying external callbacks.
   */
  private stopAudioOnly(): void {
    if (this.pendingStartTimeout) {
      clearTimeout(this.pendingStartTimeout);
      this.pendingStartTimeout = null;
    }
    if (this.pendingSentenceTimeout) {
      clearTimeout(this.pendingSentenceTimeout);
      this.pendingSentenceTimeout = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Stop any current speech synthesis utterance immediately and invalidate token.
   */
  public stop(): void {
    this.currentToken++;
    this.stopAudioOnly();
    this.currentUtterance = null;
    this.notifySpeaking(false);
  }

  /**
   * Replay the last spoken dialogue line.
   */
  public replay(): void {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, this.lastSpokenOptions);
    }
  }

  /**
   * Toggle voice mute on/off.
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    } else {
      this.replay();
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cyberlife_voice_muted', String(this.isMuted));
      } catch {
        // Ignored
      }
    }

    return this.isMuted;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public isVoicesLoaded(): boolean {
    return this.voicesLoaded;
  }

  public getIsMuted(): boolean {
    return this.isMuted || audioManager.isMasterMuted();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cyberlife_voice_muted', String(muted));
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Subscribe to speaking state changes (for oscilloscope waves & UI animations).
   */
  public onSpeakingChange(callback: (isSpeaking: boolean) => void): () => void {
    this.speakingListeners.add(callback);
    return () => {
      this.speakingListeners.delete(callback);
    };
  }

  private notifySpeaking(isSpeaking: boolean): void {
    try {
      audioManager.setDucking(isSpeaking);
    } catch {
      // Ignored
    }
    this.speakingListeners.forEach(listener => {
      try {
        listener(isSpeaking);
      } catch {
        // Ignored
      }
    });
  }

  /**
   * Exposed for testing: get current session token.
   */
  public getCurrentToken(): number {
    return this.currentToken;
  }
}

export const voiceDialogueService = new VoiceDialogueService();
