import { describe, it, expect, beforeEach } from 'vitest';
import {
  startEpisode,
  completeEpisodeBeat,
  dismissTitleCard,
  triggerBlackoutBeat,
  dismissBlackout,
  setGuidanceMode,
  unlockJournalEntry,
  deliverMentorHint,
  syncJournalToFilesystem,
  formatEncryptedJournalFile,
} from '@/simulation/narrative/episodeDirector';
import { EPISODE_01_DEFINITION, EPISODE_01_JOURNAL_ENTRIES } from '@/simulation/narrative/episodeData';
import { validateEpisodeDefinition } from '@/simulation/narrative/narrativeValidator';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { virtualFilesystem } from '@/simulation/cyber/filesystem/virtualFilesystem';
import { createDefaultCommandRegistry } from '@/simulation/cyber/terminal/TerminalCommandRegistry';
import { TerminalExecutionContext } from '@/simulation/cyber/terminal/types';
import { SimulationState } from '@/simulation/core/types';

describe('Episode Delivery Framework — EpisodeDirector', () => {
  let simState: SimulationState;
  let mockContext: TerminalExecutionContext;

  beforeEach(() => {
    simState = createInitialSimulationState();
    mockContext = {
      simulationTime: {
        timeString: '07:42:00',
        dateString: '2026-10-12',
        iso: '2026-10-12T07:42:00.000Z',
        year: 2026,
        month: 10,
        day: 12,
        hour: 7,
        minute: 42,
        second: 0,
        dayOfWeek: 'Monday',
      },
      currentUser: {
        username: 'analyst',
        displayName: 'Security Analyst',
        role: 'SOC Analyst L2',
        organization: 'Cedarline Health',
      },
      workstation: {
        id: 'ws-sec-04',
        hostname: 'cedarline-ws-04',
        osVersion: 'EkoSec Linux 6.12.0',
        ipAddress: '10.0.12.44',
        subnet: '10.0.12.0/24',
        status: 'ONLINE',
        locationId: 'lagos_island_facility',
      },
      history: [],
    };
  });

  describe('Episode Definition & Catalog Validation', () => {
    it('validates EPISODE_01_DEFINITION is structurally compliant with zero errors', () => {
      const errors = validateEpisodeDefinition(EPISODE_01_DEFINITION);
      expect(errors).toEqual([]);
    });

    it('rejects episode with missing or invalid SHA-256 hash', () => {
      const invalidEpisode = {
        ...EPISODE_01_DEFINITION,
        episodeHash: 'invalid_short_hash',
      };
      const errors = validateEpisodeDefinition(invalidEpisode);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('SHA-256'))).toBe(true);
    });

    it('rejects episode with duplicate beat IDs', () => {
      const duplicateBeat = EPISODE_01_DEFINITION.beats[0]!;
      const invalidEpisode = {
        ...EPISODE_01_DEFINITION,
        beats: [duplicateBeat, duplicateBeat],
      };
      const errors = validateEpisodeDefinition(invalidEpisode);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.code === 'DUPLICATE_ID')).toBe(true);
    });
  });

  describe('State Initialization & Filesystem Sync', () => {
    it('starts episode with cold-open beat and active title card', () => {
      const { state, events } = startEpisode(simState, 'ep01_triage_init');

      expect(state.episode?.activeEpisodeId).toBe('ep01_triage_init');
      expect(state.episode?.guidanceMode).toBe('Guided');
      expect(state.episode?.activeTitleCard).not.toBeNull();
      expect(state.episode?.activeTitleCard?.title).toBe('ep01_triage_init.pcap');
      expect(state.episode?.activeTitleCard?.episodeHash).toBe(EPISODE_01_DEFINITION.episodeHash);

      // Verifies events
      expect(events.some(e => e.type === 'EPISODE_STARTED')).toBe(true);
      expect(events.some(e => e.type === 'EPISODE_TITLE_CARD_TRIGGERED')).toBe(true);
    });

    it('formats encrypted vault file and synchronizes with virtual filesystem', () => {
      const rawEnc = formatEncryptedJournalFile(EPISODE_01_JOURNAL_ENTRIES);
      expect(rawEnc).toContain('CYBERLIFE WORKSTATION SECURE ENCLAVE');
      expect(rawEnc).toContain('ep01_claim_01');

      syncJournalToFilesystem(['ep01_journal_01']);
      expect(virtualFilesystem.exists('/home/protector/.vault/journal.enc')).toBe(true);
      expect(virtualFilesystem.exists('/home/analyst/.vault/journal.enc')).toBe(true);
      const file = virtualFilesystem.readFile('/home/protector/.vault/journal.enc');
      expect(file?.content).toContain('CYBERLIFE WORKSTATION SECURE ENCLAVE');
    });
  });

  describe('Beat Progression & Diegetic Delivery', () => {
    it('dismisses title card and advances to morning Blessing call beat', () => {
      const result = startEpisode(simState, 'ep01_triage_init');
      let state = result.state;

      // Dismissing title card completes beat 1 and triggers beat 2 (Blessing call)
      const dismissResult = dismissTitleCard(state);
      state = dismissResult.state;

      expect(state.episode?.activeTitleCard).toBeNull();
      expect(state.episode?.completedBeatIds).toContain('ep01_beat_01_title');
      expect(state.episode?.activeCall).not.toBeNull();
      expect(state.episode?.activeCall?.callerId).toBe('npc_amina');
      expect(state.episode?.activeCall?.callerName).toBe('Blessing');
      expect(dismissResult.events.some(e => e.type === 'EPISODE_CALL_INITIATED')).toBe(true);
    });

    it('advances through commute Barry encounter to Cedarline ticket dispatch', () => {
      let state = startEpisode(simState, 'ep01_triage_init').state;
      state = dismissTitleCard(state).state;

      // Complete beat 2 (morning call) -> advances to beat 3 (Barry commute encounter)
      const completeCall1 = completeEpisodeBeat(state, 'ep01_beat_02_morning');
      state = completeCall1.state;
      expect(state.episode?.completedBeatIds).toContain('ep01_beat_02_morning');
      expect(state.episode?.activeCall?.callerId).toBe('npc_marcus');

      // Complete beat 3 (commute) -> advances to beat 4 (ticket ALT-2026-1012)
      const completeCall2 = completeEpisodeBeat(state, 'ep01_beat_03_commute');
      state = completeCall2.state;
      expect(state.episode?.completedBeatIds).toContain('ep01_beat_03_commute');
      expect(state.episode?.activeTickets.length).toBe(1);

      const ticket = state.episode?.activeTickets[0];
      expect(ticket?.ticketId).toBe('ALT-2026-1012');
      expect(ticket?.requester).toContain('Blessing');
      expect(completeCall2.events.some(e => e.type === 'EPISODE_TICKET_DELIVERED')).toBe(true);
    });
  });

  describe('Blackout Beat & Lost-Time Mutations', () => {
    it('executes blackout mutations, drops evidence file, and advances clock', () => {
      let state = startEpisode(simState, 'ep01_triage_init').state;
      state = dismissTitleCard(state).state;

      const initialTime = state.time.simulationTimeSeconds;
      const blackoutResult = triggerBlackoutBeat(state, 'ep01_beat_12_cliffhanger');
      state = blackoutResult.state;

      expect(state.episode?.activeBlackout).not.toBeNull();
      expect(state.episode?.activeBlackout?.durationSeconds).toBe(4);
      expect(state.episode?.activeBlackout?.clockSkipSeconds).toBe(5400);

      // Check clock skipped by 90 minutes (5400s)
      expect(state.time.simulationTimeSeconds).toBe(initialTime + 5400);

      // Verify file dropped
      expect(virtualFilesystem.exists('/tmp/nexus_handshake_dump.pcap')).toBe(true);
      const file = virtualFilesystem.readFile('/tmp/nexus_handshake_dump.pcap');
      expect(file?.content).toContain('TLS 1.3 Handshake');

      // Verify flag set
      expect(state.flags['flag_nexus_discovered']).toBe(true);

      // Dismiss blackout
      const dismissResult = dismissBlackout(state);
      state = dismissResult.state;
      expect(state.episode?.activeBlackout).toBeNull();
      expect(dismissResult.events.some(e => e.type === 'EPISODE_BLACKOUT_ENDED')).toBe(true);
    });
  });

  describe('Guidance Modes & Invariant Determinism', () => {
    it('toggles guidance mode between Guided and Immersive deterministically', () => {
      let state = startEpisode(simState, 'ep01_triage_init').state;
      expect(state.episode?.guidanceMode).toBe('Guided');

      const immersiveResult = setGuidanceMode(state, 'Immersive');
      state = immersiveResult.state;
      expect(state.episode?.guidanceMode).toBe('Immersive');
      expect(
        immersiveResult.events.some(
          e => e.type === 'EPISODE_GUIDANCE_MODE_CHANGED' && (e.payload as { newMode: string }).newMode === 'Immersive'
        )
      ).toBe(true);

      const guidedResult = setGuidanceMode(state, 'Guided');
      state = guidedResult.state;
      expect(state.episode?.guidanceMode).toBe('Guided');
    });

    it('delivers mentor hints diegetically in Immersive mode', () => {
      let state = startEpisode(simState, 'ep01_triage_init').state;
      state = setGuidanceMode(state, 'Immersive').state;
      const hint = 'Blessing says: Start by mapping the subnet with netmap hosts';

      const result = deliverMentorHint(state, 'hint-map-subnet', hint);
      state = result.state;

      expect(state.episode?.mentorHintsDelivered).toContain('hint-map-subnet');
      expect(result.events.some(e => e.type === 'EPISODE_MESSAGE_DELIVERED')).toBe(true);
    });

    it('survives JSON serialize/deserialize save round-trip with zero data loss', () => {
      let state = startEpisode(simState, 'ep01_triage_init').state;
      state = setGuidanceMode(state, 'Immersive').state;
      state = unlockJournalEntry(state, 'ep01_journal_01').state;

      const serialized = JSON.stringify(state.episode);
      const restored = JSON.parse(serialized);

      expect(restored.activeEpisodeId).toBe(state.episode?.activeEpisodeId);
      expect(restored.guidanceMode).toBe('Immersive');
      expect(restored.unlockedJournalEntryIds).toEqual(state.episode?.unlockedJournalEntryIds);
      expect(restored.activeTitleCard?.episodeHash).toBe(state.episode?.activeTitleCard?.episodeHash);
    });
  });

  describe('CLI journal command integration', () => {
    it('executes terminal journal tool to list entries and inspect claims', () => {
      syncJournalToFilesystem(['ep01_journal_01']);

      const registry = createDefaultCommandRegistry();
      const journalTool = registry.get('journal');

      expect(journalTool).toBeDefined();

      // List entries
      const listOutput = journalTool!.execute([], mockContext);
      expect(listOutput.isError).toBeFalsy();
      expect(listOutput.stdout.some(l => l.includes('ep01_journal_01'))).toBe(true);

      // Show specific entry with claims
      const showOutput = journalTool!.execute(['read', 'ep01_journal_01'], mockContext);
      expect(showOutput.isError).toBeFalsy();
      expect(showOutput.stdout.some(l => l.includes('ep01_claim_01'))).toBe(true);
      expect(showOutput.stdout.some(l => l.includes('VERIFIED TRUE'))).toBe(true);
    });
  });
});
