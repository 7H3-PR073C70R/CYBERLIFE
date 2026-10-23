/**
/**
 * Cyberlife — Episode Delivery Framework: Authoritative Domain Types
 *
 * Defines data-driven Episode, Beat, Trigger, Effect, Journal, and Blackout models.
 * Completely deterministic, headless, and save-safe.
 */

import { WorldFlagValue } from '../core/types';

export type EpisodeBeatType =
  | 'titleCard'
  | 'ticket'
  | 'onionMessage'
  | 'call'
  | 'fileDrop'
  | 'journalEntry'
  | 'blackout'
  | 'dayCase'
  | 'nightJob'
  | 'debrief'
  | 'choice';

export type BeatTriggerType =
  | 'immediate'
  | 'clockTime'
  | 'flag'
  | 'previousBeatFinished'
  | 'appOpened'
  | 'manual';

export interface BeatClockTimeTrigger {
  readonly hour: number; // 0-23
  readonly minute: number; // 0-59
}

export interface BeatFlagTrigger {
  readonly flagKey: string;
  readonly expectedValue: WorldFlagValue;
}

export interface BeatTrigger {
  readonly type: BeatTriggerType;
  readonly clockTime?: BeatClockTimeTrigger;
  readonly flag?: BeatFlagTrigger;
  readonly previousBeatId?: string;
  readonly appId?: string;
}

export interface JournalClaim {
  readonly claimId: string;
  readonly statement: string;
  readonly truthfulness: 'TRUE' | 'FALSE' | 'UNVERIFIED' | 'CONTRADICTED';
  readonly evidenceRef?: string;
}

export interface JournalEntry {
  readonly id: string;
  readonly episodeId: string;
  readonly timestampString: string;
  readonly title: string;
  readonly text: string;
  readonly claims: readonly JournalClaim[];
}

export interface EpisodeTicket {
  readonly ticketId: string; // e.g. 'TKT-2026-1012'
  readonly title: string;
  readonly requester: string; // e.g. 'Blessing (SecOps Lead)'
  readonly organization: string; // e.g. 'Cedarline Solutions'
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly targetSystem: string;
  readonly scope: string;
  readonly description: string;
  readonly instructions: readonly string[];
  readonly createdAtSimTime?: number;
}

export interface EpisodeMessage {
  readonly id: string;
  readonly contactId: string;
  readonly contactName: string;
  readonly text: string;
  readonly timestampString: string;
  readonly typingDelayMs: number;
  readonly isEncrypted?: boolean;
}

export interface EpisodeCallDialogueLine {
  readonly text: string;
  readonly delayMs: number;
  readonly speech?: string;
  readonly delivery?: 'neutral' | 'calm' | 'anxious' | 'urgent' | 'tired' | 'tense';
}

export interface EpisodeCall {
  readonly id: string;
  readonly callerId: string;
  readonly callerName: string;
  readonly callerRole: string;
  readonly callerOrg?: string;
  readonly dialogue: readonly EpisodeCallDialogueLine[];
}

export interface FileDropDefinition {
  readonly path: string;
  readonly content: string;
  readonly readOnly?: boolean;
  readonly description?: string;
}

export interface EpisodeMutation {
  readonly type: 'WRITE_FILE' | 'APPEND_LOG' | 'SET_FLAG' | 'TIME_SKIP';
  readonly targetPath?: string;
  readonly content?: string;
  readonly flagKey?: string;
  readonly flagValue?: WorldFlagValue;
  readonly skipMinutes?: number;
}

export interface EpisodeChoiceOption {
  readonly id: string; // e.g. 'A' | 'B'
  readonly label: string;
  readonly description: string;
  readonly factionStandingDeltas?: Readonly<Record<string, number>>;
  readonly flagsToSet?: Readonly<Record<string, WorldFlagValue>>;
  readonly legalExposureDelta?: number;
}

export interface EpisodeChoiceDefinition {
  readonly choiceId: string;
  readonly title: string;
  readonly prompt: string;
  readonly options: readonly EpisodeChoiceOption[];
}

export interface BeatEffects {
  readonly setFlags?: Readonly<Record<string, WorldFlagValue>>;
  readonly factionStandingDeltas?: Readonly<Record<string, number>>;
  readonly unlockJournalEntryId?: string;
  readonly fileDrops?: readonly FileDropDefinition[];
  readonly ticket?: EpisodeTicket;
  readonly onionMessage?: EpisodeMessage;
  readonly call?: EpisodeCall;
  readonly choice?: EpisodeChoiceDefinition;
  readonly clockSkipSeconds?: number;
  readonly blackout?: {
    readonly durationSeconds: number;
    readonly clockSkipSeconds: number;
    readonly mutations: readonly EpisodeMutation[];
  };
  readonly debrief?: {
    readonly attckMappings: readonly string[];
    readonly realWorldSummary: string;
    readonly nextStudyTopics: readonly string[];
  };
  readonly notification?: {
    readonly title: string;
    readonly body: string;
    readonly icon?: string;
  };
}

export interface EpisodeBeatDefinition {
  readonly id: string;
  readonly type: EpisodeBeatType;
  readonly title: string;
  readonly description?: string;
  readonly trigger: BeatTrigger;
  readonly effects: BeatEffects;
}

export interface EpisodeDefinition {
  readonly id: string;
  readonly title: string; // e.g. 'ep01_triage_init.pcap'
  readonly episodeHash: string; // 64-char SHA-256 hash
  readonly season: number;
  readonly episodeNumber: number;
  readonly synopsis: string;
  readonly kernelBanner?: string;
  readonly initialJournalEntries?: readonly JournalEntry[];
  readonly beats: readonly EpisodeBeatDefinition[];
}

// ============================================================================
// SIMULATION STATE FOR EPISODE DIRECTOR
// ============================================================================

export type GuidanceMode = 'Guided' | 'Immersive';
export type EpisodeGuidanceMode = GuidanceMode;

export interface EpisodeDirectorState {
  readonly activeEpisodeId: string | null;
  readonly activeBeatId: string | null;
  readonly completedBeatIds: readonly string[];
  readonly completedEpisodeIds: readonly string[];
  readonly unlockedJournalEntryIds: readonly string[];
  readonly activeTickets: readonly EpisodeTicket[];
  readonly deliveredMessages: readonly EpisodeMessage[];
  readonly guidanceMode: GuidanceMode;
  readonly activeBlackout: {
    readonly beatId: string;
    readonly durationSeconds: number;
    readonly clockSkipSeconds: number;
    readonly startedAtSimTime: number;
  } | null;
  readonly activeTitleCard: {
    readonly episodeId: string;
    readonly title: string;
    readonly episodeHash: string;
    readonly kernelBanner: string;
    readonly timestampIso: string;
  } | null;
  readonly activeCall: EpisodeCall | null;
  readonly activeChoice: EpisodeChoiceDefinition | null;
  readonly mentorHintsDelivered: readonly string[];
}
