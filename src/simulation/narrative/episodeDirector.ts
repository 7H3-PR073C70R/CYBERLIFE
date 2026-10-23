/**
 * Cyberlife — Episode Director & Narrative Progression Engine
 *
 * Authoritative, deterministic simulation service for Episode & Beat lifecycle:
 * - Triggers, progression, and completion of data-driven beats.
 * - Manages tickets, encrypted Onion messages, VoIP calls, and file drops.
 * - Controls the encrypted journal (~/.vault/journal.enc) and claim states.
 * - Executes blackout beats (lost-time clock skip, brownout state, file mutations).
 * - Implements dual guidance modes ('Guided' vs 'Immersive') and mentor delivery.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory domain logic. Fully save-safe and replayable.
 */

import { SimulationState } from '../core/types';
import { SimulationEvent } from '../events/types';
import { createSimulationEvent } from '../events/eventFactory';
import { calculateCalendarTime } from '../time/calendar';
import { virtualFilesystem } from '../cyber/filesystem/virtualFilesystem';
import {
  EpisodeDefinition,
  EpisodeBeatDefinition,
  EpisodeDirectorState,
  GuidanceMode,
  JournalEntry,
} from './episodeTypes';
import { getEpisodeById, EPISODE_01_JOURNAL_ENTRIES } from './episodeData';
import { createInitialNarrativeState } from './initialNarrativeState';

/**
 * Creates the initial state for the Episode Director.
 */
export function createInitialEpisodeDirectorState(
  guidanceMode: GuidanceMode = 'Guided'
): EpisodeDirectorState {
  return {
    activeEpisodeId: null,
    activeBeatId: null,
    completedBeatIds: [],
    completedEpisodeIds: [],
    unlockedJournalEntryIds: [],
    activeTickets: [],
    deliveredMessages: [],
    guidanceMode,
    activeBlackout: null,
    activeTitleCard: null,
    activeCall: null,
    activeChoice: null,
    mentorHintsDelivered: [],
  };
}

/**
 * Formats unlocked journal entries into an authentic encrypted vault file format.
 */
export function formatEncryptedJournalFile(unlockedEntries: readonly JournalEntry[]): string {
  const header = [
    '================================================================================',
    '       CYBERLIFE WORKSTATION SECURE ENCLAVE // ENCRYPTED VAULT ARCHIVE          ',
    '================================================================================',
    'VAULT_ID:        VAULT-2026-PROTECTOR-ODUNLAMI',
    'CIPHER:          AES-256-GCM // HMAC-SHA256 (Hardware Enclave Keyed)',
    'OWNER:           Protector (Security Analyst, ws-sec-04)',
    'SECURITY NOTICE: Forensic record of personal investigation and memory logs.',
    '                 Any discrepancy between claims and evidence indicates compromise.',
    '================================================================================',
    '',
  ];

  if (unlockedEntries.length === 0) {
    return header.concat(['[VAULT EMPTY: No decrypted entries unlocked yet.]', '']).join('\n');
  }

  const sections: string[] = [...header];

  for (const entry of unlockedEntries) {
    sections.push(`--- [DECRYPTED ENTRY: ${entry.id}] ------------------------------------------`);
    sections.push(`TIMESTAMP: ${entry.timestampString}`);
    sections.push(`TITLE:     ${entry.title}`);
    sections.push('');
    sections.push(entry.text);
    sections.push('');
    sections.push('RECORDED CLAIMS & FORENSIC ASSERTIONS:');
    for (const claim of entry.claims) {
      const statusBadge =
        claim.truthfulness === 'TRUE'
          ? '[VERIFIED TRUE]'
          : claim.truthfulness === 'CONTRADICTED'
            ? '[CONTRADICTED BY EVIDENCE]'
            : claim.truthfulness === 'FALSE'
              ? '[REFUTED FALSE]'
              : '[UNVERIFIED CLAIM]';
      const ref = claim.evidenceRef ? ` (Evidence Ref: ${claim.evidenceRef})` : '';
      sections.push(`  * ${claim.claimId}: "${claim.statement}" ${statusBadge}${ref}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Synchronizes unlocked journal entries to the virtual filesystem (~/.vault/journal.enc).
 */
export function syncJournalToFilesystem(unlockedEntryIds: readonly string[]): void {
  const allEntries = EPISODE_01_JOURNAL_ENTRIES; // Extendable across episodes
  const unlocked = allEntries.filter(entry => unlockedEntryIds.includes(entry.id));
  const fileContent = formatEncryptedJournalFile(unlocked);

  virtualFilesystem.mkdir('/home/protector/.vault');
  virtualFilesystem.writeFile('/home/protector/.vault/journal.enc', fileContent);
  virtualFilesystem.mkdir('/home/analyst/.vault');
  virtualFilesystem.writeFile('/home/analyst/.vault/journal.enc', fileContent);
}

/**
 * Starts an episode in the simulation state.
 */
export function startEpisode(
  state: SimulationState,
  episodeId: string
): { state: SimulationState; events: SimulationEvent[] } {
  const episodeDef = getEpisodeById(episodeId);
  if (!episodeDef) {
    throw new Error(`Episode "${episodeId}" not found in authored catalog`);
  }

  const currentDirector = state.episode ?? createInitialEpisodeDirectorState();
  const nextRevision = state.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('EPISODE_STARTED', state.time.simulationTimeSeconds, nextRevision, {
      episodeId: episodeDef.id,
      title: episodeDef.title,
      hash: episodeDef.episodeHash,
      season: episodeDef.season,
      episodeNumber: episodeDef.episodeNumber,
    })
  );

  let updatedState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    episode: {
      ...currentDirector,
      activeEpisodeId: episodeDef.id,
      activeBeatId: null,
    },
  };

  // If there are beats, activate beat 0 if immediate
  const firstBeat = episodeDef.beats[0];
  if (firstBeat && firstBeat.trigger.type === 'immediate') {
    const beatResult = activateBeat(updatedState, episodeDef, firstBeat);
    updatedState = beatResult.state;
    events.push(...beatResult.events);
  }

  return { state: updatedState, events };
}

/**
 * Activates a beat, applying its presentation hooks and immediate effects.
 */
function activateBeat(
  state: SimulationState,
  episodeDef: EpisodeDefinition,
  beat: EpisodeBeatDefinition
): { state: SimulationState; events: SimulationEvent[] } {
  const currentDirector = state.episode ?? createInitialEpisodeDirectorState();
  const nextRevision = state.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('EPISODE_BEAT_TRIGGERED', state.time.simulationTimeSeconds, nextRevision, {
      episodeId: episodeDef.id,
      beatId: beat.id,
      beatType: beat.type,
      beatTitle: beat.title,
    })
  );

  let updatedDirector: EpisodeDirectorState = {
    ...currentDirector,
    activeBeatId: beat.id,
  };

  let updatedFlags = { ...state.flags };
  let updatedTime = { ...state.time };

  // 1. Title Card Beat
  if (beat.type === 'titleCard') {
    updatedDirector = {
      ...updatedDirector,
      activeTitleCard: {
        episodeId: episodeDef.id,
        title: episodeDef.title,
        episodeHash: episodeDef.episodeHash,
        kernelBanner:
          episodeDef.kernelBanner ?? 'EkoSec Linux 6.12.0-cyberlife-arm64 #1 SMP PREEMPT_DYNAMIC WAT 2026',
        timestampIso: state.time.calendar.iso,
      },
    };
    events.push(
      createSimulationEvent('EPISODE_TITLE_CARD_TRIGGERED', state.time.simulationTimeSeconds, nextRevision, {
        episodeId: episodeDef.id,
        title: episodeDef.title,
        hash: episodeDef.episodeHash,
      })
    );
  }

  // 2. Ticket Effect
  if (beat.effects.ticket) {
    const ticket = beat.effects.ticket;
    const exists = updatedDirector.activeTickets.some(t => t.ticketId === ticket.ticketId);
    if (!exists) {
      updatedDirector = {
        ...updatedDirector,
        activeTickets: [...updatedDirector.activeTickets, ticket],
      };
      events.push(
        createSimulationEvent('EPISODE_TICKET_DELIVERED', state.time.simulationTimeSeconds, nextRevision, {
          ticketId: ticket.ticketId,
          title: ticket.title,
          requester: ticket.requester,
          severity: ticket.severity,
        })
      );
    }
  }

  // 3. Onion Message Effect
  if (beat.effects.onionMessage) {
    const msg = beat.effects.onionMessage;
    const exists = updatedDirector.deliveredMessages.some(m => m.id === msg.id);
    if (!exists) {
      updatedDirector = {
        ...updatedDirector,
        deliveredMessages: [...updatedDirector.deliveredMessages, msg],
      };
      events.push(
        createSimulationEvent('EPISODE_MESSAGE_DELIVERED', state.time.simulationTimeSeconds, nextRevision, {
          messageId: msg.id,
          contactId: msg.contactId,
          contactName: msg.contactName,
          text: msg.text,
        })
      );
    }
  }

  // 4. Call Effect
  if (beat.effects.call) {
    updatedDirector = {
      ...updatedDirector,
      activeCall: beat.effects.call,
    };
    events.push(
      createSimulationEvent('EPISODE_CALL_INITIATED', state.time.simulationTimeSeconds, nextRevision, {
        callId: beat.effects.call.id,
        callerId: beat.effects.call.callerId,
        callerName: beat.effects.call.callerName,
      })
    );
  }

  // 5. File Drops
  if (beat.effects.fileDrops && beat.effects.fileDrops.length > 0) {
    for (const drop of beat.effects.fileDrops) {
      virtualFilesystem.writeFile(drop.path, drop.content);
    }
  }

  // 6. Journal Entry Unlock
  if (beat.effects.unlockJournalEntryId) {
    const entryId = beat.effects.unlockJournalEntryId;
    if (!updatedDirector.unlockedJournalEntryIds.includes(entryId)) {
      updatedDirector = {
        ...updatedDirector,
        unlockedJournalEntryIds: [...updatedDirector.unlockedJournalEntryIds, entryId],
      };
      syncJournalToFilesystem(updatedDirector.unlockedJournalEntryIds);
      events.push(
        createSimulationEvent('EPISODE_JOURNAL_UNLOCKED', state.time.simulationTimeSeconds, nextRevision, {
          journalEntryId: entryId,
        })
      );
    }
  }

  // 7. Flags
  if (beat.effects.setFlags) {
    updatedFlags = {
      ...updatedFlags,
      ...beat.effects.setFlags,
    };
  }

  // 7b. Faction standing deltas
  let updatedNarrative = state.narrative ? { ...state.narrative } : createInitialNarrativeState();
  if (beat.effects.factionStandingDeltas && updatedNarrative.factions) {
    const nextFactions = { ...updatedNarrative.factions };
    for (const [factionId, delta] of Object.entries(beat.effects.factionStandingDeltas)) {
      const existing = nextFactions[factionId];
      if (existing) {
        const nextStanding = Math.max(-100, Math.min(100, existing.standing + delta));
        nextFactions[factionId] = {
          ...existing,
          standing: nextStanding,
          history: [
            ...existing.history,
            { delta, reason: `Episode beat: ${beat.title}`, timestamp: state.time.simulationTimeSeconds },
          ],
        };
      }
    }
    updatedNarrative = { ...updatedNarrative, factions: nextFactions };
  }

  // 7c. Choice Beat
  if (beat.type === 'choice' && beat.effects.choice) {
    updatedDirector = {
      ...updatedDirector,
      activeChoice: beat.effects.choice,
    };
    events.push(
      createSimulationEvent('EPISODE_CHOICE_PRESENTED', state.time.simulationTimeSeconds, nextRevision, {
        episodeId: episodeDef.id,
        beatId: beat.id,
        choiceId: beat.effects.choice.choiceId,
        title: beat.effects.choice.title,
      })
    );
  }

  // 8. Blackout Beat
  if (beat.type === 'blackout' && beat.effects.blackout) {
    const bo = beat.effects.blackout;
    updatedDirector = {
      ...updatedDirector,
      activeBlackout: {
        beatId: beat.id,
        durationSeconds: bo.durationSeconds,
        clockSkipSeconds: bo.clockSkipSeconds,
        startedAtSimTime: state.time.simulationTimeSeconds,
      },
    };

    // Apply lost-time clock skip
    const newSimTime = state.time.simulationTimeSeconds + bo.clockSkipSeconds;
    const newCalendar = calculateCalendarTime(newSimTime, state.metadata.initializedAtIso);
    updatedTime = {
      simulationTimeSeconds: newSimTime,
      calendar: newCalendar,
    };

    // Apply blackout mutations
    for (const mut of bo.mutations) {
      if (mut.type === 'WRITE_FILE' && mut.targetPath && mut.content !== undefined) {
        virtualFilesystem.writeFile(mut.targetPath, mut.content);
      } else if (mut.type === 'SET_FLAG' && mut.flagKey && mut.flagValue !== undefined) {
        updatedFlags[mut.flagKey] = mut.flagValue;
      }
    }

    events.push(
      createSimulationEvent('EPISODE_BLACKOUT_TRIGGERED', newSimTime, nextRevision, {
        beatId: beat.id,
        durationSeconds: bo.durationSeconds,
        clockSkipSeconds: bo.clockSkipSeconds,
        newCalendarIso: newCalendar.iso,
      })
    );
  }

  return {
    state: {
      ...state,
      metadata: {
        ...state.metadata,
        revision: nextRevision,
      },
      time: updatedTime,
      flags: updatedFlags,
      narrative: updatedNarrative,
      episode: updatedDirector,
    },
    events,
  };
}

/**
 * Completes a beat and advances to next beats if their triggers are satisfied.
 */
export function completeEpisodeBeat(
  state: SimulationState,
  beatId: string
): { state: SimulationState; events: SimulationEvent[] } {
  const director = state.episode;
  if (!director || !director.activeEpisodeId) {
    return { state, events: [] };
  }

  const episodeDef = getEpisodeById(director.activeEpisodeId);
  if (!episodeDef) {
    return { state, events: [] };
  }

  const beatIndex = episodeDef.beats.findIndex(
    b => b.id === beatId || (b.effects.call && b.effects.call.id === beatId)
  );
  if (beatIndex === -1) {
    return { state, events: [] };
  }

  const beat = episodeDef.beats[beatIndex]!;
  const nextRevision = state.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('EPISODE_BEAT_COMPLETED', state.time.simulationTimeSeconds, nextRevision, {
      episodeId: episodeDef.id,
      beatId: beat.id,
      beatType: beat.type,
    })
  );

  const completedBeats = Array.from(new Set([...director.completedBeatIds, beat.id]));

  const updatedDirector: EpisodeDirectorState = {
    ...director,
    activeBeatId: director.activeBeatId === beatId ? null : director.activeBeatId,
    completedBeatIds: completedBeats,
    activeCall: beat.type === 'call' ? null : director.activeCall,
    activeBlackout: beat.type === 'blackout' ? null : director.activeBlackout,
    activeChoice: beat.type === 'choice' ? null : director.activeChoice,
  };

  let updatedState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    episode: updatedDirector,
  };

  // Check if there is an immediately triggered subsequent beat
  const nextBeat = episodeDef.beats[beatIndex + 1];
  if (nextBeat) {
    const trigger = nextBeat.trigger;
    let shouldTrigger = false;

    if (trigger.type === 'immediate') {
      shouldTrigger = true;
    } else if (trigger.type === 'previousBeatFinished' && trigger.previousBeatId === beat.id) {
      shouldTrigger = true;
    } else if (trigger.type === 'flag' && trigger.flag) {
      shouldTrigger = updatedState.flags[trigger.flag.flagKey] === trigger.flag.expectedValue;
    }

    if (shouldTrigger) {
      const nextBeatResult = activateBeat(updatedState, episodeDef, nextBeat);
      updatedState = nextBeatResult.state;
      events.push(...nextBeatResult.events);
    }
  } else {
    // Episode completed
    const completedEpisodes = Array.from(new Set([...director.completedEpisodeIds, episodeDef.id]));
    updatedState = {
      ...updatedState,
      episode: {
        ...(updatedState.episode ?? updatedDirector),
        activeEpisodeId: null,
        activeBeatId: null,
        completedEpisodeIds: completedEpisodes,
      },
    };
    events.push(
      createSimulationEvent('EPISODE_COMPLETED', updatedState.time.simulationTimeSeconds, nextRevision + 1, {
        episodeId: episodeDef.id,
        title: episodeDef.title,
      })
    );
  }

  return { state: updatedState, events };
}

/**
 * Resolves an active episode choice dilemma.
 */
export function resolveEpisodeChoice(
  state: SimulationState,
  optionId: string
): { state: SimulationState; events: SimulationEvent[] } {
  const director = state.episode;
  if (!director || !director.activeChoice) {
    return { state, events: [] };
  }

  const choiceDef = director.activeChoice;
  const option = choiceDef.options.find(o => o.id === optionId);
  if (!option) {
    return { state, events: [] };
  }

  const nextRevision = state.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('EPISODE_CHOICE_RESOLVED', state.time.simulationTimeSeconds, nextRevision, {
      episodeId: director.activeEpisodeId ?? '',
      choiceId: choiceDef.choiceId,
      optionId: option.id,
      label: option.label,
    })
  );

  let updatedFlags = { ...state.flags };
  if (option.flagsToSet) {
    updatedFlags = { ...updatedFlags, ...option.flagsToSet };
  }

  let updatedNarrative = state.narrative ? { ...state.narrative } : createInitialNarrativeState();
  if (option.factionStandingDeltas && updatedNarrative.factions) {
    const nextFactions = { ...updatedNarrative.factions };
    for (const [factionId, delta] of Object.entries(option.factionStandingDeltas)) {
      const existing = nextFactions[factionId];
      if (existing) {
        const nextStanding = Math.max(-100, Math.min(100, existing.standing + delta));
        nextFactions[factionId] = {
          ...existing,
          standing: nextStanding,
          history: [
            ...existing.history,
            { delta, reason: `Episode choice: ${option.label}`, timestamp: state.time.simulationTimeSeconds },
          ],
        };
      }
    }
    updatedNarrative = { ...updatedNarrative, factions: nextFactions };
  }

  let updatedTrace = state.trace;
  if (option.legalExposureDelta !== undefined && updatedTrace) {
    const currentMeter = updatedTrace.legalExposureMeter ?? 0;
    updatedTrace = {
      ...updatedTrace,
      legalExposureMeter: Math.max(0, Math.min(100, currentMeter + option.legalExposureDelta)),
    };
  }

  const intermediateState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    flags: updatedFlags,
    narrative: updatedNarrative,
    trace: updatedTrace,
    episode: {
      ...director,
      activeChoice: null,
    },
  };

  if (director.activeBeatId) {
    return completeEpisodeBeat(intermediateState, director.activeBeatId);
  }

  return { state: intermediateState, events };
}

/**
 * Dismisses the active title card overlay.
 */
export function dismissTitleCard(
  state: SimulationState
): { state: SimulationState; events: SimulationEvent[] } {
  if (!state.episode?.activeTitleCard) return { state, events: [] };

  const currentBeatId = state.episode.activeBeatId;
  const updatedDirector: EpisodeDirectorState = {
    ...state.episode,
    activeTitleCard: null,
  };

  const nextRevision = state.metadata.revision + 1;
  const dismissEvent = createSimulationEvent(
    'EPISODE_TITLE_CARD_DISMISSED',
    state.time.simulationTimeSeconds,
    nextRevision,
    {
      episodeId: state.episode.activeEpisodeId ?? '',
    }
  );

  const resultState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    episode: updatedDirector,
  };

  // If the active beat was titleCard, mark it complete!
  if (currentBeatId) {
    const ep = state.episode.activeEpisodeId ? getEpisodeById(state.episode.activeEpisodeId) : null;
    const beat = ep?.beats.find(b => b.id === currentBeatId);
    if (beat && beat.type === 'titleCard') {
      const completeRes = completeEpisodeBeat(resultState, currentBeatId);
      return {
        state: completeRes.state,
        events: [dismissEvent, ...completeRes.events],
      };
    }
  }

  return { state: resultState, events: [dismissEvent] };
}

/**
 * Dismisses the active blackout overlay.
 */
export function dismissBlackout(
  state: SimulationState
): { state: SimulationState; events: SimulationEvent[] } {
  if (!state.episode?.activeBlackout) return { state, events: [] };

  const currentBeatId = state.episode.activeBlackout.beatId;
  const updatedDirector: EpisodeDirectorState = {
    ...state.episode,
    activeBlackout: null,
  };

  const nextRevision = state.metadata.revision + 1;
  const events = [
    createSimulationEvent('EPISODE_BLACKOUT_ENDED', state.time.simulationTimeSeconds, nextRevision, {
      beatId: currentBeatId,
    }),
  ];

  const resultState: SimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      revision: nextRevision,
    },
    episode: updatedDirector,
  };

  // Complete the blackout beat to trigger subsequent beats (like the anonymous Onion ping)
  const completeResult = completeEpisodeBeat(resultState, currentBeatId);
  return {
    state: completeResult.state,
    events: [...events, ...completeResult.events],
  };
}

/**
 * Triggers a blackout beat manually or through scripted command.
 */
export function triggerBlackoutBeat(
  state: SimulationState,
  beatId?: string
): { state: SimulationState; events: SimulationEvent[] } {
  const director = state.episode;
  if (!director || !director.activeEpisodeId) {
    // Standalone test blackout if no episode active
    const nextRevision = state.metadata.revision + 1;
    const skipSeconds = 5400;
    const newSimTime = state.time.simulationTimeSeconds + skipSeconds;
    const newCalendar = calculateCalendarTime(newSimTime, state.metadata.initializedAtIso);

    virtualFilesystem.writeFile(
      '/tmp/nexus_handshake_dump.pcap',
      '[BINARY PCAP ARTIFACT: TLS Handshake to vault-core-01.transit.internal // JA3: 72c6499890ba // Eko Nexus Clearing Relay]'
    );

    const updatedDirector: EpisodeDirectorState = {
      ...(director ?? createInitialEpisodeDirectorState()),
      activeBlackout: {
        beatId: beatId ?? 'standalone_blackout',
        durationSeconds: 4,
        clockSkipSeconds: skipSeconds,
        startedAtSimTime: state.time.simulationTimeSeconds,
      },
    };

    const events = [
      createSimulationEvent('EPISODE_BLACKOUT_TRIGGERED', newSimTime, nextRevision, {
        beatId: beatId ?? 'standalone_blackout',
        durationSeconds: 4,
        clockSkipSeconds: skipSeconds,
        newCalendarIso: newCalendar.iso,
      }),
    ];

    return {
      state: {
        ...state,
        metadata: { ...state.metadata, revision: nextRevision },
        time: { simulationTimeSeconds: newSimTime, calendar: newCalendar },
        episode: updatedDirector,
      },
      events,
    };
  }

  const episodeDef = getEpisodeById(director.activeEpisodeId);
  if (!episodeDef) return { state, events: [] };

  const targetBeatId = beatId ?? director.activeBeatId;
  const beat = episodeDef.beats.find(b => b.id === targetBeatId && b.type === 'blackout');
  if (!beat) return { state, events: [] };

  return activateBeat(state, episodeDef, beat);
}

/**
 * Sets player guidance mode ('Guided' vs 'Immersive').
 */
export function setGuidanceMode(
  state: SimulationState,
  mode: GuidanceMode
): { state: SimulationState; events: SimulationEvent[] } {
  const director = state.episode ?? createInitialEpisodeDirectorState();
  const nextRevision = state.metadata.revision + 1;

  const events = [
    createSimulationEvent('EPISODE_GUIDANCE_MODE_CHANGED', state.time.simulationTimeSeconds, nextRevision, {
      previousMode: director.guidanceMode,
      newMode: mode,
    }),
  ];

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      episode: {
        ...director,
        guidanceMode: mode,
      },
    },
    events,
  };
}

/**
 * Unlocks a journal entry and writes it to ~/.vault/journal.enc.
 */
export function unlockJournalEntry(
  state: SimulationState,
  entryId: string
): { state: SimulationState; events: SimulationEvent[] } {
  const director = state.episode ?? createInitialEpisodeDirectorState();
  if (director.unlockedJournalEntryIds.includes(entryId)) {
    return { state, events: [] };
  }

  const unlocked = [...director.unlockedJournalEntryIds, entryId];
  syncJournalToFilesystem(unlocked);

  const nextRevision = state.metadata.revision + 1;
  const events = [
    createSimulationEvent('EPISODE_JOURNAL_UNLOCKED', state.time.simulationTimeSeconds, nextRevision, {
      journalEntryId: entryId,
    }),
  ];

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      episode: {
        ...director,
        unlockedJournalEntryIds: unlocked,
      },
    },
    events,
  };
}

/**
 * Sends a mentor guidance message in Immersive mode if player is stalled.
 */
export function deliverMentorHint(
  state: SimulationState,
  hintId: string,
  hintText: string
): { state: SimulationState; events: SimulationEvent[] } {
  const director = state.episode ?? createInitialEpisodeDirectorState();
  if (director.guidanceMode !== 'Immersive' || director.mentorHintsDelivered.includes(hintId)) {
    return { state, events: [] };
  }

  const msg = {
    id: `mentor-${hintId}-${Date.now()}`,
    contactId: 'amina-okonjo',
    contactName: 'Blessing',
    text: hintText,
    timestampString: state.time.calendar.timeString,
    typingDelayMs: 1200,
    isEncrypted: true,
  };

  const nextRevision = state.metadata.revision + 1;
  const events = [
    createSimulationEvent('EPISODE_MESSAGE_DELIVERED', state.time.simulationTimeSeconds, nextRevision, {
      messageId: msg.id,
      contactId: msg.contactId,
      contactName: msg.contactName,
      text: msg.text,
      isMentorHint: true,
    }),
  ];

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      episode: {
        ...director,
        deliveredMessages: [...director.deliveredMessages, msg],
        mentorHintsDelivered: [...director.mentorHintsDelivered, hintId],
      },
    },
    events,
  };
}
