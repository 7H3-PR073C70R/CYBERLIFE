/**
 * Cyberlife — Pronunciation Dictionary & Spoken Text Normalization Engine
 *
 * Provides phonetically accurate, human-sounding spoken representations of
 * acronyms, cybersecurity terms, network identifiers, and Nigerian proper names
 * without altering in-game display text or dialogue scripts.
 */

export interface PronunciationEntry {
  /** Term pattern or string to match */
  readonly term: string;
  /** Spoken phonetic expansion */
  readonly spoken: string;
  /** Category or rationale */
  readonly category: 'acronym' | 'technical' | 'proper_name' | 'network' | 'number' | 'pidgin';
  /** Optional case sensitivity flag (defaults to case-insensitive) */
  readonly caseSensitive?: boolean;
}

export type DeliveryTag = 'neutral' | 'calm' | 'anxious' | 'urgent' | 'tired' | 'tense';

/**
 * Project-Wide Voice Synthesis Defaults (Variant B: Conversational / Natural Cadence)
 * Authoritative defaults for all episodes.
 */
export const VOICE_PROJECT_DEFAULTS = {
  /** Target internal sentence boundary silence for natural conversational cadence (Variant B) */
  targetSentenceGapMs: 185,
  /** Target comma pause duration */
  targetCommaGapMs: 85,
  /** Exact trimmed leading silence */
  leadingSilenceMs: 25,
  /** Exact trimmed trailing silence */
  trailingSilenceMs: 35,
  /** Maximum allowable leading or trailing silence under quality gate */
  maxLeadingTrailingSilenceMs: 60,
  /** Maximum allowable internal silence before compression */
  maxInternalSilenceMs: 220,
  /** Project default rate boost (+3% for brisk human cadence across all characters) */
  rateBoostPercent: 3,
  /** Conversational gap between sequential phone call speakers */
  phoneCallInterSpeakerGapMs: 200,
  /** Fadeout duration when interrupting or skipping speech (60-80 ms) */
  skipFadeOutMs: 70,
  /** Target integrated loudness per EBU R128 */
  loudnessTargetLUFS: -16.0,
  /** True peak limit to prevent clipping */
  truePeakLimitDbFS: -1.5,
} as const;

export interface DeliveryProsodyModifier {
  readonly rateDeltaPercent: number;
  readonly pitchDeltaPercent: number;
}

export const DELIVERY_PROSODY_TABLE: Record<DeliveryTag, DeliveryProsodyModifier> = {
  neutral: { rateDeltaPercent: 0, pitchDeltaPercent: 0 },
  calm: { rateDeltaPercent: -2, pitchDeltaPercent: -1 },
  anxious: { rateDeltaPercent: +5, pitchDeltaPercent: +2.5 },
  urgent: { rateDeltaPercent: +7, pitchDeltaPercent: +3 },
  tired: { rateDeltaPercent: -4, pitchDeltaPercent: -2 },
  tense: { rateDeltaPercent: +4, pitchDeltaPercent: +1 },
};

export interface CharacterVoiceDefinition {
  readonly characterId: string;
  readonly displayName: string;
  readonly voice: 'en-NG-EzinneNeural' | 'en-NG-AbeoNeural' | 'en-US-ChristopherNeural' | 'en-US-JennyNeural';
  readonly gender: 'female' | 'male';
  readonly baseRatePercent: number; // e.g. -2 for 0.98
  readonly basePitchHz: number; // e.g. -6Hz
  readonly isSynthetic?: boolean;
}

export const CHARACTER_VOICE_CASTING: Record<string, CharacterVoiceDefinition> = {
  // Blessing — Confident, steady, disciplined, slightly lower
  npc_amina: {
    characterId: 'npc_amina',
    displayName: 'Blessing',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: -2, // 0.98
    basePitchHz: -6,
  },
  'amina-okonjo': {
    characterId: 'npc_amina',
    displayName: 'Blessing',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: -2,
    basePitchHz: -6,
  },
  Blessing: {
    characterId: 'npc_amina',
    displayName: 'Blessing',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: -2,
    basePitchHz: -6,
  },

  // Barry — Younger, faster, nervous, slightly higher
  npc_marcus: {
    characterId: 'npc_marcus',
    displayName: 'Barry',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: +5, // 1.05
    basePitchHz: +7,
  },
  Barry: {
    characterId: 'npc_marcus',
    displayName: 'Barry',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: +5,
    basePitchHz: +7,
  },

  // Michael — Slower, deeper, controlled, corporate authority
  npc_femi: {
    characterId: 'npc_femi',
    displayName: 'Michael',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -5, // 0.95
    basePitchHz: -10,
  },
  Michael: {
    characterId: 'npc_femi',
    displayName: 'Michael',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -5,
    basePitchHz: -10,
  },

  // Tsharp — Relaxed, quicker, casual, street-smart researcher
  npc_tunde: {
    characterId: 'npc_tunde',
    displayName: 'Tsharp',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: +3, // 1.03
    basePitchHz: -2,
  },
  Tsharp: {
    characterId: 'npc_tunde',
    displayName: 'Tsharp',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: +3,
    basePitchHz: -2,
  },

  // Mama Esther — Older, deliberate, warm matriarch
  npc_nkechi: {
    characterId: 'npc_nkechi',
    displayName: 'Mama Esther',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: -4, // 0.96
    basePitchHz: +2,
  },
  'Mama Esther': {
    characterId: 'npc_nkechi',
    displayName: 'Mama Esther',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: -4,
    basePitchHz: +2,
  },

  // Choker — Low, slow, deliberate private IR lead
  npc_chidi: {
    characterId: 'npc_chidi',
    displayName: 'Choker',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -6, // 0.94
    basePitchHz: -12,
  },
  Choker: {
    characterId: 'npc_chidi',
    displayName: 'Choker',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -6,
    basePitchHz: -12,
  },

  // Mercy — Applied ML specialist, steady, analytical
  npc_elena: {
    characterId: 'npc_elena',
    displayName: 'Mercy',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: 0, // 1.00
    basePitchHz: +3,
  },
  Mercy: {
    characterId: 'npc_elena',
    displayName: 'Mercy',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: 0,
    basePitchHz: +3,
  },

  // Goodness — Senior talent liaison, engaging, warm
  npc_folake: {
    characterId: 'npc_folake',
    displayName: 'Goodness',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: +2, // 1.02
    basePitchHz: +4,
  },
  Goodness: {
    characterId: 'npc_folake',
    displayName: 'Goodness',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: +2,
    basePitchHz: +4,
  },

  // Uncle Segun — Community elder & historian, deliberate, warm
  npc_segun: {
    characterId: 'npc_segun',
    displayName: 'Uncle Segun',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -8, // 0.92
    basePitchHz: -8,
  },
  'Uncle Segun': {
    characterId: 'npc_segun',
    displayName: 'Uncle Segun',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -8,
    basePitchHz: -8,
  },

  // Daniel — Regulatory inspector, solemn, methodical
  npc_babatunde: {
    characterId: 'npc_babatunde',
    displayName: 'Daniel',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -4, // 0.96
    basePitchHz: -5,
  },
  Daniel: {
    characterId: 'npc_babatunde',
    displayName: 'Daniel',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -4,
    basePitchHz: -5,
  },

  // Mary — Investigative editor, sharp, engaged
  npc_kemi: {
    characterId: 'npc_kemi',
    displayName: 'Mary',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: 0, // 1.00
    basePitchHz: +2,
  },
  Mary: {
    characterId: 'npc_kemi',
    displayName: 'Mary',
    voice: 'en-NG-EzinneNeural',
    gender: 'female',
    baseRatePercent: 0,
    basePitchHz: +2,
  },

  // Cipher — Autonomous encrypted relay contact
  cipher: {
    characterId: 'cipher',
    displayName: 'Cipher',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -6,
    basePitchHz: -10,
  },
  Cipher: {
    characterId: 'cipher',
    displayName: 'Cipher',
    voice: 'en-NG-AbeoNeural',
    gender: 'male',
    baseRatePercent: -6,
    basePitchHz: -10,
  },

  // Aster SIEM Bot — Completely synthetic, robotic, flat
  'aster-watchdog': {
    characterId: 'aster-watchdog',
    displayName: 'Aster SIEM Bot',
    voice: 'en-US-ChristopherNeural',
    gender: 'male',
    baseRatePercent: 0,
    basePitchHz: 0,
    isSynthetic: true,
  },
  'Aster SIEM Bot': {
    characterId: 'aster-watchdog',
    displayName: 'Aster SIEM Bot',
    voice: 'en-US-ChristopherNeural',
    gender: 'male',
    baseRatePercent: 0,
    basePitchHz: 0,
    isSynthetic: true,
  },
};

/**
 * Authoritative Pronunciation Dictionary for Episode 01.
 * Evaluated in order from top to bottom.
 */
export const PRONUNCIATION_DICTIONARY: readonly PronunciationEntry[] = [
  // --- Technical IDs (Never read raw IDs aloud) ---
  { term: 'T1021.002', spoken: 'MITRE technique remote SMB shares', category: 'technical' },
  { term: 'T1071.001', spoken: 'MITRE technique web command and control', category: 'technical' },
  { term: 'T1078.004', spoken: 'MITRE technique service accounts', category: 'technical' },
  { term: 'T1078', spoken: 'MITRE technique valid accounts', category: 'technical' },

  // --- Cybersecurity Acronyms & Terms ---
  { term: 'ATT&CK', spoken: 'attack', category: 'acronym' },
  { term: 'Sysmon', spoken: 'sis-mon', category: 'technical' },
  { term: 'SIEM', spoken: 'seem', category: 'acronym' },
  { term: 'SOC', spoken: 'sock', category: 'acronym' },
  { term: 'PCAP', spoken: 'pee-cap', category: 'acronym' },
  { term: 'SMB2', spoken: 'S M B two', category: 'acronym' },
  { term: 'SMB', spoken: 'S M B', category: 'acronym' },
  { term: 'EDR', spoken: 'E D R', category: 'acronym' },
  { term: 'VPN', spoken: 'V P N', category: 'acronym' },
  { term: 'DNS', spoken: 'D N S', category: 'acronym' },
  { term: 'SSH', spoken: 'S S H', category: 'acronym' },
  { term: 'TCP', spoken: 'T C P', category: 'acronym' },
  { term: 'UDP', spoken: 'U D P', category: 'acronym' },
  { term: 'OSINT', spoken: 'O-sint', category: 'acronym' },
  { term: 'ZRTP', spoken: 'Z R T P', category: 'acronym' },
  { term: 'AES', spoken: 'A E S', category: 'acronym' },
  { term: 'IAM', spoken: 'I A M', category: 'acronym' },
  { term: 'RCE', spoken: 'R C E', category: 'acronym' },
  { term: 'IoCs', spoken: "I o C's", category: 'acronym' },
  { term: 'IoC', spoken: 'I o C', category: 'acronym' },
  { term: 'IPs', spoken: "I P's", category: 'acronym' },
  { term: 'IP', spoken: 'I P', category: 'acronym' },
  { term: 'TLS', spoken: 'T L S', category: 'acronym' },
  { term: 'C2', spoken: 'C two', category: 'acronym' },
  { term: 'RoE', spoken: 'R o E', category: 'acronym' },
  { term: 'NIST', spoken: 'nist', category: 'acronym' },
  { term: 'OPSEC', spoken: 'op-sec', category: 'acronym' },
  { term: 'RFC', spoken: 'R F C', category: 'acronym' },
  { term: 'SANS', spoken: 'sans', category: 'acronym' },
  { term: 'API', spoken: 'A P I', category: 'acronym' },
  { term: 'AC', spoken: 'A C', category: 'acronym' },
  { term: 'ASAP', spoken: 'as soon as possible', category: 'acronym' },
  { term: 'SHA-256', spoken: 'S H A two fifty-six', category: 'acronym' },

  // --- Institutional & Faction Entities ---
  { term: 'Cedarline', spoken: 'See-dar-line', category: 'proper_name' },
  { term: 'NDSRC', spoken: 'N D S R C', category: 'acronym' },
  { term: 'CRCII', spoken: 'C R C I I', category: 'acronym' },
  { term: 'NIPC', spoken: 'N I P C', category: 'acronym' },
  { term: '0xLagos', spoken: 'Zero X Lagos', category: 'proper_name' },

  // --- Systems & Tools ---
  { term: 'Mimikatz', spoken: 'mimi-katz', category: 'technical' },
  { term: 'PowerShell', spoken: 'Power Shell', category: 'technical' },
  { term: 'Cobalt Strike', spoken: 'Cobalt Strike', category: 'technical' },
  { term: 'Ransomware', spoken: 'ran-som-ware', category: 'technical' },

  // --- Systems & Tools ---
  { term: 'netmap', spoken: 'net-map', category: 'technical' },
  { term: 'svcscan', spoken: 'service scan', category: 'technical' },
  { term: 'logview', spoken: 'log view', category: 'technical' },
  { term: 'aster-admin', spoken: 'Aster admin', category: 'technical' },
  { term: 'filesrv-01', spoken: 'file server 0 1', category: 'network' },
  { term: 'app-portal-01', spoken: 'the app portal server', category: 'network' },
  { term: 'svc-aster', spoken: 'service aster', category: 'network' },
  { term: 'vault-core-01.transit.internal', spoken: 'vault core transit internal', category: 'network' },

  // --- Nigerian Names, Locations & Accent Guidance ---
  { term: 'Tsharp', spoken: 'Tee-sharp', category: 'proper_name' },
  { term: 'Eko', spoken: 'Eh-ko', category: 'proper_name' },
  { term: 'Lagos', spoken: 'Lay-gos', category: 'proper_name' },
  { term: 'Odunlami', spoken: 'Oh-doon-lah-mee', category: 'proper_name' },
  { term: 'Marina', spoken: 'Marina', category: 'proper_name' },
  { term: 'Balogun', spoken: 'Bah-loh-goon', category: 'proper_name' },
  { term: 'Tinubu', spoken: 'Tee-noo-boo', category: 'proper_name' },

  // --- Common Ticket & Evidence Numbers ---
  { term: 'ALT-2026-1012', spoken: 'alert twenty twenty-six, ten twelve', category: 'number' },
  { term: 'TKT-2026-1012', spoken: 'ticket twenty twenty-six, ten twelve', category: 'number' },
  { term: 'EVD-2026-001', spoken: 'evidence twenty twenty-six, double-oh-one', category: 'number' },
  { term: 'EVD-2026-004', spoken: 'evidence twenty twenty-six, double-oh-four', category: 'number' },

  // --- Network Addresses & Ports ---
  { term: '10.0.4.15', spoken: 'ten dot zero dot four dot fifteen', category: 'network' },
  { term: '10.0.4.0/24', spoken: 'ten dot zero dot four subnet', category: 'network' },
  { term: '8080', spoken: 'eighty eighty', category: 'number' },
  { term: '443', spoken: 'four forty-three', category: 'number' },
];

/**
 * Normalises dialogue or speech text for authentic, human-sounding prosody:
 * 1. Honors explicit speech field over raw text when provided
 * 2. Strips visual stage directions and brackets while preserving author `[beat]`
 * 3. Converts ellipses and em-dashes to commas or beats to eliminate unnatural speech pauses
 * 4. Expands '&' to 'and'
 * 5. Converts semicolons to commas
 * 6. Applies pronunciation dictionary entries (case-insensitively, whole-word aware)
 * 7. Keeps Nigerian Pidgin words uncorrupted by English phonetic spelling
 * 8. Trims and lightens excessive punctuation
 */
export function normalizeTextForSpeech(
  rawText: string,
  options: {
    speechOverride?: string;
    isPidgin?: boolean;
    keepBeatMarker?: boolean;
  } = {}
): string {
  const source = options.speechOverride && options.speechOverride.trim().length > 0
    ? options.speechOverride
    : rawText;

  if (!source) return '';

  const trimmed = source.trim();
  // Entirely bracketed system notifications or directions
  if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes('[beat]')) {
    return '';
  }

  let text = source;

  // 1. Remove sound effects inside asterisks (*electronic audio static*, etc.)
  text = text.replace(/\*[^*]+\*/g, '');

  // 2. Remove square bracket stage directions, EXCEPT author [beat]
  text = text.replace(/\[(?!beat\])[^\]]+\]/g, '');

  // 3. Normalize ellipses and long dashes into natural breath pauses (commas)
  text = text
    .replace(/\.{3,}/g, ', ')
    .replace(/[—–]/g, ', ')
    .replace(/--+/g, ', ')
    .replace(/;/g, ', ');

  // 4. Expand ampersands outside of ATT&CK (handled specifically in dictionary)
  text = text.replace(/\bATT&CK\b/gi, 'attack');
  text = text.replace(/\s+&\s+/g, ' and ');

  // 5. Expand CVE patterns: CVE-2026-445 -> C V E twenty twenty-six, 445
  text = text.replace(/\bCVE-(\d{4})-(\d+)\b/gi, 'C V E $1, $2');

  // 6. Apply Pronunciation Dictionary (for non-Pidgin speech text)
  if (!options.isPidgin) {
    for (const entry of PRONUNCIATION_DICTIONARY) {
      if (entry.term === 'ATT&CK' || entry.term === 'CVE') continue;

      // Escape special regex characters in term
      const escaped = entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = entry.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(`\\b${escaped}\\b`, flags);
      text = text.replace(regex, entry.spoken);
    }
  }

  // 7. Lighten punctuation and clean whitespace
  text = text
    .replace(/!+/g, '!')
    .replace(/\?+/g, '?')
    .replace(/,+/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  // If beat markers are not preserved in downstream engine, replace with comma
  if (!options.keepBeatMarker) {
    text = text.replace(/\[beat\]/gi, ', ');
  }

  return text.replace(/\s+/g, ' ').trim();
}
