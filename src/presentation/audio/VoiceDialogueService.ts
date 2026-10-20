/**
 * Cyberlife — Authentic Nigerian English Voice Dialogue Synthesis Service
 *
 * Provides natural, human-sounding speech synthesis for NPC in-world conversations
 * and secure hacker VoIP phone calls.
 *
 * Features:
 * - Prioritizes Nigerian English (en-NG) and West African / Commonwealth English voices.
 * - Character personality pitch, rate, and cadence modulation (Amina, Marcus, Cipher, etc.)
 * - Natural text preprocessing: expands technical acronyms (CVE, SOC, SMB, ZRTP) into
 *   phonetic spoken English and cleans markdown / sound-effect stage notes.
 * - Speech state listener for dynamic audio wave oscilloscope synchronization.
 * - Global mute toggle with localStorage persistence ('cyberlife_voice_muted').
 * - Unit-test safe: graceful fallback when Web Speech API is unavailable in headless environments.
 */

export interface VoiceSpeakerOptions {
  speaker?: string;
  role?: string;
  gender?: 'female' | 'male';
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

const DEFAULT_CHARACTER_PROFILES: Record<string, CharacterVoiceProfile> = {
  // Lead SecOps / Mentor
  'Temitope Blessing': {
    preferredGender: 'female',
    pitch: 1.12,
    rate: 0.97,
    volume: 1.0,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'en_ng', 'female', 'victoria', 'serena', 'samantha'],
  },
  'Amina Okonjo': {
    preferredGender: 'female',
    pitch: 1.12,
    rate: 0.97,
    volume: 1.0,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'en_ng', 'female', 'victoria', 'serena', 'samantha'],
  },

  // Junior Sysadmin
  'Marcus Adebayo': {
    preferredGender: 'male',
    pitch: 0.98,
    rate: 1.01,
    volume: 1.0,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'en_ng', 'male', 'oliver', 'daniel', 'george'],
  },

  // Underground Broker / Hacker Phone Calls
  'Cipher': {
    preferredGender: 'male',
    pitch: 0.86,
    rate: 0.93,
    volume: 0.95,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'male', 'deep', 'daniel', 'rishi'],
  },
  'Mr. K': {
    preferredGender: 'male',
    pitch: 0.86,
    rate: 0.93,
    volume: 0.95,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'male', 'deep', 'daniel'],
  },

  // VP / Enterprise Executive
  'Femi Martins': {
    preferredGender: 'male',
    pitch: 0.91,
    rate: 0.94,
    volume: 1.0,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'male', 'authority', 'daniel'],
  },

  // Merchant / Vendor
  'Mama Nkechi': {
    preferredGender: 'female',
    pitch: 1.18,
    rate: 0.96,
    volume: 1.0,
    voiceHints: ['nigeria', 'nigerian', 'en-ng', 'female', 'serena'],
  },

  // Lead AI Engineer
  'Dr. Elena Chen': {
    preferredGender: 'female',
    pitch: 1.06,
    rate: 0.99,
    volume: 0.98,
    voiceHints: ['female', 'en-gb', 'en-us', 'karen', 'serena'],
  },
};

class VoiceDialogueService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private speakingListeners: Set<(isSpeaking: boolean) => void> = new Set();
  private lastSpokenText: string = '';
  private lastSpokenOptions?: VoiceSpeakerOptions;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cyberlife_voice_muted');
        this.isMuted = stored === 'true';
      } catch {
        this.isMuted = false;
      }

      this.initVoices();
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const populate = () => {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
      }
    };

    populate();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populate;
    }
  }

  /**
   * Find best matching voice for Nigerian English cadence and character profile.
   */
  private selectVoice(profile: CharacterVoiceProfile): SpeechSynthesisVoice | null {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    if (this.voices.length === 0) return null;

    // 1. Direct Nigerian English voice match
    const nigerianVoice = this.voices.find(v => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang === 'en-ng' ||
        lang.startsWith('en-ng') ||
        lang.includes('ng') ||
        name.includes('nigeria') ||
        name.includes('nigerian')
      );
    });
    if (nigerianVoice) return nigerianVoice;

    // 2. West African or African Commonwealth English voice (en-GH, en-ZA)
    const africanVoice = this.voices.find(v => {
      const lang = v.lang.toLowerCase();
      return lang.startsWith('en-gh') || lang.startsWith('en-za');
    });
    if (africanVoice) return africanVoice;

    // 3. Match character gender preference with British / Commonwealth English (foundational roots of Nigerian English)
    const genderMatches = this.voices.filter(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isEnglish = lang.startsWith('en');
      if (!isEnglish) return false;

      if (profile.preferredGender === 'female') {
        return (
          name.includes('female') ||
          name.includes('serena') ||
          name.includes('victoria') ||
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('moira') ||
          name.includes('fiona')
        );
      } else {
        return (
          name.includes('male') ||
          name.includes('daniel') ||
          name.includes('oliver') ||
          name.includes('george') ||
          name.includes('rishi') ||
          name.includes('alex')
        );
      }
    });

    if (genderMatches.length > 0) {
      // Prioritize British English (en-GB) if available among gender matches
      const gbMatch = genderMatches.find(v => v.lang.toLowerCase().startsWith('en-gb'));
      return gbMatch ?? genderMatches[0] ?? null;
    }

    // 4. Fallback to any British English or standard English voice
    const gbVoice = this.voices.find(v => v.lang.toLowerCase().startsWith('en-gb'));
    if (gbVoice) return gbVoice;

    const anyEnglish = this.voices.find(v => v.lang.toLowerCase().startsWith('en'));
    return anyEnglish ?? this.voices[0] ?? null;
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
   */
  public speak(text: string, options: VoiceSpeakerOptions = {}): void {
    this.lastSpokenText = text;
    this.lastSpokenOptions = options;

    if (this.isMuted) return;
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

    // Stop any in-progress speech first to prevent awkward overlap
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      this.currentUtterance = utterance;

      // Determine character profile
      const speakerKey = options.speaker ?? 'default';
      const profile: CharacterVoiceProfile = DEFAULT_CHARACTER_PROFILES[speakerKey] ?? {
        preferredGender: options.gender ?? 'male',
        pitch: options.gender === 'female' ? 1.12 : 0.96,
        rate: 0.98,
        volume: 1.0,
        voiceHints: ['nigeria', 'en-ng'],
      };

      const selectedVoice = this.selectVoice(profile);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = profile.volume;

      // Special modulation for hacker VoIP phone calls (deep tactical tone)
      if (options.isPhoneCall) {
        utterance.pitch = Math.max(0.75, profile.pitch - 0.08);
        utterance.rate = Math.max(0.88, profile.rate - 0.05);
      }

      utterance.onstart = () => {
        this.notifySpeaking(true);
        options.onStart?.();
      };

      utterance.onend = () => {
        this.notifySpeaking(false);
        this.currentUtterance = null;
        options.onEnd?.();
      };

      utterance.onerror = () => {
        this.notifySpeaking(false);
        this.currentUtterance = null;
        options.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.notifySpeaking(false);
      options.onEnd?.();
    }
  }

  /**
   * Stop any current speech synthesis utterance immediately.
   */
  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }
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
    return this.isMuted;
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
    this.speakingListeners.forEach(listener => {
      try {
        listener(isSpeaking);
      } catch {
        // Ignored
      }
    });
  }
}

export const voiceDialogueService = new VoiceDialogueService();
