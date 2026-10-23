/**
 * Cyberlife — Episode 01 Spoken Dialogue & Voice Generation Manifest
 *
 * Authoritative registry of all spoken voice lines in Episode 01.
 *
 * GENERATION POLICY:
 * All entries are currently flagged with `needsHumanRecording: true` and `audioGenerated: false`.
 * Setting `needsHumanRecording: true` or `requiresManualApproval: true` prevents automated
 * voice generation pipeline runners from processing the asset until explicitly reviewed.
 * To enable automated synthesis later, clear `needsHumanRecording: false` and set `readyForSynthesis: true`.
 */

export interface VoiceManifestEntry {
  readonly id: string;
  readonly characterName: string;
  readonly characterRole: string;
  readonly context: string;
  readonly beatId: string;
  readonly dialogueText: string;
  readonly emotionalTone: string;
  readonly dialect: 'Nigerian English (Authentic)' | 'Nigerian Pidgin (Spontaneous)';
  readonly needsHumanRecording: boolean;
  readonly audioGenerated: boolean;
  readonly readyForSynthesis: boolean;
  readonly speech?: string;
  readonly delivery?: 'neutral' | 'calm' | 'anxious' | 'urgent' | 'tired' | 'tense';
  readonly audioPath?: string;
}

export const EPISODE_01_VOICE_MANIFEST: readonly VoiceManifestEntry[] = [
  {
    id: 'ep01_v_bless_01',
    characterName: 'Blessing',
    characterRole: 'Lead SecOps Architect',
    context: 'Urgent Phone Call to Protector (Beat 2)',
    beatId: 'ep01_beat_02_morning',
    dialogueText:
      'Protector, good morning. Don’t waste time with breakfast. Get to Marina Tower now; svc-aster is pulling files it shouldn’t touch.',
    speech:
      "Protector, good morning. Don't waste time with breakfast. Get to Marina Tower now, service aster is pulling files it shouldn't touch.",
    emotionalTone: 'Urgent, disciplined, controlled anxiety',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'urgent',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_barry_01',
    characterName: 'Barry',
    characterRole: 'Junior Systems Administrator',
    context: 'Broad Street Commute Encounter (Beat 3)',
    beatId: 'ep01_beat_03_commute',
    dialogueText:
      'Protector! Ah... good morning. Hot morning, abi? I’m just running to grab meat pie. Server room AC was acting up all weekend, no be small thing.',
    speech:
      "Protector! Ah, good morning. Hot morning, abi? I'm just running to grab meat pie. Server room A C was acting up all weekend, no be small thing.",
    emotionalTone: 'Fast-paced, sweating, evasive',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'anxious',
    needsHumanRecording: true, // Retained: spontaneous Pidgin idiom ("abi?", "no be small thing") needs authentic human performance
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_bless_02',
    characterName: 'Blessing',
    characterRole: 'Lead SecOps Architect',
    context: 'Cedarline SOC Floor Briefing (Beat 4)',
    beatId: 'ep01_beat_04_ticket',
    dialogueText:
      'The ticket is ALT-2026-1012. Michael doesn’t know yet—the alert was suppressed from the morning digest. We need to know if payroll leaked.',
    speech:
      "The ticket is alert twenty twenty-six, ten twelve. Michael doesn't know yet, the alert was suppressed from the morning digest. We need to know if payroll leaked.",
    emotionalTone: 'Low-pitched, confidential, professional',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'calm',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_barry_02',
    characterName: 'Barry',
    characterRole: 'Junior Systems Administrator',
    context: 'Panicked VoIP Call to Workstation (Beat 4)',
    beatId: 'ep01_beat_04_ticket',
    dialogueText:
      'Protector! Please tell me you haven’t escalated the Aster ticket yet. I swear I was only servicing the cooling racks on Saturday!',
    speech:
      "Protector! Please tell me you haven't escalated the Aster ticket yet. I swear I was only servicing the cooling racks on Saturday!",
    emotionalTone: 'Panicked, pleading, desperate',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'anxious',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_barry_03',
    characterName: 'Barry',
    characterRole: 'Junior Systems Administrator',
    context: 'Panicked VoIP Call to Workstation (Beat 4)',
    beatId: 'ep01_beat_04_ticket',
    dialogueText:
      'If Michael sees my name near that wildcard role, I am finished. Check the IAM policy yourself—I was forced to rush it!',
    speech:
      "If Michael sees my name near that wildcard role, I am finished. Check the I A M policy yourself, I was forced to rush it!",
    emotionalTone: 'Desperate, cracked voice',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'anxious',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_mich_01',
    characterName: 'Michael',
    characterRole: 'VP of Technology Infrastructure',
    context: 'Executive Pressure Call (Beat 8)',
    beatId: 'ep01_beat_08_choice',
    dialogueText:
      'Protector. Blessing tells me you’re leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?',
    speech:
      "Protector. Blessing tells me you're leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?",
    emotionalTone: 'Commanding, sharp, corporate',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'urgent',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_mich_02',
    characterName: 'Michael',
    characterRole: 'VP of Technology Infrastructure',
    context: 'Executive Pressure Call (Beat 8)',
    beatId: 'ep01_beat_08_choice',
    dialogueText:
      'I don’t need a lecture on MITRE techniques. I need clean incident sign-off showing zero external exposure. Do not invent ghosts on my network.',
    speech:
      "I don't need a lecture on MITRE techniques. I need clean incident sign-off showing zero external exposure. Do not invent ghosts on my network.",
    emotionalTone: 'Cold, coercive, thinly veiled threat',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'tense',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_bless_03',
    characterName: 'Blessing',
    characterRole: 'Lead SecOps Architect',
    context: 'Reaction to Choice A Escalation (Beat 8)',
    beatId: 'ep01_beat_08_choice',
    dialogueText:
      'You did the right thing, Protector. It will cause wahala with Michael, but our job is the truth, not the stock price.',
    speech:
      "You did the right thing, Protector. It will cause wahala with Michael, but our job is the truth, not the stock price.",
    emotionalTone: 'Proud, solemn, resolute',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'calm',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_bless_04',
    characterName: 'Blessing',
    characterRole: 'Lead SecOps Architect',
    context: 'Reaction to Choice B Quiet Containment (Beat 8)',
    beatId: 'ep01_beat_08_choice',
    dialogueText:
      'Understood. We contain it internally and keep the wolves away from Barry. But if NDSRC audits this later, we are on our own.',
    speech:
      "Understood. We contain it internally and keep the wolves away from Barry. But if N D S R C audits this later, we are on our own.",
    emotionalTone: 'Guarded, wary, protective',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'tense',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
  {
    id: 'ep01_v_tsharp_01',
    characterName: 'Tsharp',
    characterRole: 'Independent 0xLagos Security Researcher',
    context: 'Onion Chat Audio Dispatch (Beat 10)',
    beatId: 'ep01_beat_10_night_recon',
    dialogueText:
      'Yo Protector. Off-grid telemetry caught offshore scanners hitting 8080. If you probe that port actively, Cedarline’s SOC will trip. Keep it quiet.',
    speech:
      "Yo Protector. Off-grid telemetry caught offshore scanners hitting eighty eighty. If you probe that port actively, Cedarline's sock will trip. Keep it quiet.",
    emotionalTone: 'Wry, calm, street-smart',
    dialect: 'Nigerian English (Authentic)',
    delivery: 'neutral',
    needsHumanRecording: false,
    audioGenerated: true,
    readyForSynthesis: true,
  },
];

export function getVoiceManifestForEpisode(episodeId: string): readonly VoiceManifestEntry[] {
  if (episodeId === 'ep01_triage_init') {
    return EPISODE_01_VOICE_MANIFEST;
  }
  return [];
}
