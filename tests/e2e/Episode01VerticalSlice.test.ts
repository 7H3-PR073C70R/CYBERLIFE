/**
 * Cyberlife — Episode 01 End-to-End Vertical Slice Test
 *
 * Verifies the complete playable vertical slice:
 * "The Aster Anomaly & The Midnight Query" (ep01_triage_init.pcap)
 *
 * Full Story Arc & Cyber Operations Pipeline:
 * 1. Cold Open (Title Card) -> Apartment Morning 07:00 (Journal Entry 1, Blessing Call)
 * 2. Street Commute (Barry Encounter) -> Cedarline Workstation (Ticket ALT-2026-1012)
 * 3. Triage & Packet Lens (smb2.cmd == 5 && ip.addr == 10.0.4.15) & SIEM/Sysmon telemetry
 * 4. Mid-Episode Save & Load roundtrip preservation
 * 5. Human Beats & The Choice (Choice A: Escalate vs Choice B: Shield)
 * 6. Post-Day Debrief Screen (NIST SP 800-61r2, ATT&CK T1021.002/T1071.001)
 * 7. Night Job (Quiet Passive OSINT vs Loud Active Scanning triggering Defender View)
 * 8. Second Journal Entry (with seeded Ep 07 contradiction)
 * 9. Cliffhanger Blackout (power brownout, lost time, /tmp/nexus_handshake_dump.pcap, anonymous ping)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../src/simulation/core/initialState';
import {
  startEpisode,
  completeEpisodeBeat,
  dismissTitleCard,
  dismissBlackout,
  resolveEpisodeChoice,
} from '../../src/simulation/narrative/episodeDirector';
import { EPISODE_01_DEFINITION } from '../../src/simulation/narrative/episodeData';
import { evaluateDisplayFilterExpression } from '../../src/simulation/cyber/network/trafficAnalyzer';
import { EPISODE_01_TRAFFIC_EVENTS } from '../../src/simulation/cyber/network/ep01TrafficFixtures';
import { virtualFilesystem } from '../../src/simulation/cyber/filesystem/virtualFilesystem';
import { evaluateEpisode01DayCase } from '../../src/simulation/narrative/ep01DebriefData';
import { recordActionNoise } from '../../src/simulation/cyber/trace/traceEngine';

describe('Episode 01: The Aster Anomaly & The Midnight Query (E2E Vertical Slice)', () => {
  beforeEach(() => {
    virtualFilesystem.reset();
  });

  it('plays the complete vertical slice along Choice A (Escalate) & Quiet Night Path', () => {
    const initialState = createInitialSimulationState();

    // ------------------------------------------------------------------------
    // 1. COLD OPEN: Title Card
    // ------------------------------------------------------------------------
    const { state: s1 } = startEpisode(initialState, EPISODE_01_DEFINITION.id);
    expect(s1.episode!.activeEpisodeId).toBe('ep01_triage_init');
    expect(s1.episode!.activeBeatId).toBe('ep01_beat_01_title');
    expect(s1.episode!.activeTitleCard).toBeDefined();
    expect(s1.episode!.activeTitleCard?.title).toBe('ep01_triage_init.pcap');

    // ------------------------------------------------------------------------
    // 2. APARTMENT MORNING (07:00): Journal Entry 1 & Blessing Call
    // ------------------------------------------------------------------------
    const { state: s2 } = dismissTitleCard(s1);
    expect(s2.episode!.activeBeatId).toBe('ep01_beat_02_morning');
    expect(s2.episode!.unlockedJournalEntryIds).toContain('ep01_journal_01');

    // Verify journal file synced to virtual filesystem
    const journalFile = virtualFilesystem.readFile('/home/analyst/.vault/journal.enc');
    expect(journalFile).not.toBeNull();
    expect(journalFile?.content).toContain('[DECRYPTED ENTRY: ep01_journal_01]');
    expect(journalFile?.content).toContain('Before the Marina Tower Shift');
    expect(journalFile?.content).toContain('RECORDED CLAIMS & FORENSIC ASSERTIONS:');

    // Verify Blessing's morning VoIP call
    expect(s2.episode!.activeCall).toBeDefined();
    expect(s2.episode!.activeCall?.callerName).toBe('Blessing');

    // ------------------------------------------------------------------------
    // 3. COMMUTE: Barry Street Encounter
    // ------------------------------------------------------------------------
    const { state: s3 } = completeEpisodeBeat(s2, 'ep01_beat_02_morning');
    expect(s3.episode!.activeBeatId).toBe('ep01_beat_03_commute');

    // ------------------------------------------------------------------------
    // 4. CEDARLINE WORKSTATION: Blessing Assigns Ticket ALT-2026-1012
    // ------------------------------------------------------------------------
    const { state: s4 } = completeEpisodeBeat(s3, 'ep01_beat_03_commute');
    expect(s4.episode!.activeBeatId).toBe('ep01_beat_04_ticket');
    expect(s4.episode!.activeTickets.length).toBeGreaterThanOrEqual(1);

    const ticket = s4.episode!.activeTickets.find((t) => t.ticketId === 'ALT-2026-1012');
    expect(ticket).toBeDefined();
    expect(ticket?.title).toContain('svc-aster');
    expect(ticket?.scope).toContain('app-portal-01');
    expect(ticket?.targetSystem).toContain('filesrv-01');

    // ------------------------------------------------------------------------
    // 5. RECONNAISSANCE: Terminal Tools (logview, netmap, svcscan)
    // ------------------------------------------------------------------------
    const { state: s5 } = completeEpisodeBeat(s4, 'ep01_beat_04_ticket');
    expect(s5.episode!.activeBeatId).toBe('ep01_beat_05_recon');

    // ------------------------------------------------------------------------
    // 6. PACKET LENS: Wireshark Display Filter Mastery
    // ------------------------------------------------------------------------
    const { state: s6 } = completeEpisodeBeat(s5, 'ep01_beat_05_recon');
    expect(s6.episode!.activeBeatId).toBe('ep01_beat_06_packetlens');

    // Apply precision filter
    const smb2Filter = 'smb2.cmd == 5 && ip.addr == 10.0.4.15';
    const filteredPackets = EPISODE_01_TRAFFIC_EVENTS.filter((pkt) =>
      evaluateDisplayFilterExpression(pkt, smb2Filter)
    );
    expect(filteredPackets.length).toBe(2);

    const treeConnectReq = filteredPackets.find((p) => p.summaryInfo.includes('Tree Connect Request'));
    expect(treeConnectReq).toBeDefined();
    expect(treeConnectReq?.smb2?.sharePath).toBe('\\\\filesrv-01.cedarline.internal\\confidential$');

    // Verify outbound TLS anomaly to Eko Nexus gateway
    const tlsAnomaly = EPISODE_01_TRAFFIC_EVENTS.find((p) => p.tls?.sni === 'vault-core-01.transit.internal');
    expect(tlsAnomaly).toBeDefined();
    expect(tlsAnomaly?.destinationIp).toBe('196.220.10.5');

    // ------------------------------------------------------------------------
    // 4. MID-EPISODE SAVE & LOAD ROUNDTRIP TEST
    // ------------------------------------------------------------------------
    const savedJson = JSON.stringify(s6);
    const loadedState = JSON.parse(savedJson);

    expect(loadedState.episode.activeEpisodeId).toBe(s6.episode!.activeEpisodeId);
    expect(loadedState.episode.activeBeatId).toBe(s6.episode!.activeBeatId);
    expect(loadedState.episode.unlockedJournalEntryIds).toEqual(s6.episode!.unlockedJournalEntryIds);
    expect(loadedState.flags).toEqual(s6.flags);
    expect(loadedState.trace).toEqual(s6.trace);

    // ------------------------------------------------------------------------
    // 7. CONTAINMENT & HUMAN BEATS (Blessing, Barry, Michael Call)
    // ------------------------------------------------------------------------
    const { state: s7 } = completeEpisodeBeat(loadedState, 'ep01_beat_06_packetlens');
    expect(s7.episode!.activeBeatId).toBe('ep01_beat_07_containment');

    // ------------------------------------------------------------------------
    // 8. THE CHOICE: Branch A (Escalate Outbound Pipeline Staging)
    // ------------------------------------------------------------------------
    const { state: s8 } = completeEpisodeBeat(s7, 'ep01_beat_07_containment');
    expect(s8.episode!.activeBeatId).toBe('ep01_beat_08_choice');
    expect(s8.episode!.activeChoice).toBeDefined();
    expect(s8.episode!.activeChoice?.options.length).toBe(2);

    const initialSecOps = s8.narrative!.factions['faction_cedarline']?.standing ?? 0;
    const { state: s9ChoiceA } = resolveEpisodeChoice(s8, 'A');

    // Verify faction deltas and flags for Choice A
    expect(s9ChoiceA.narrative!.factions['faction_cedarline']?.standing).toBe(initialSecOps + 10);
    expect(s9ChoiceA.flags['flag_ep01_choice_escalate']).toBe(true);
    expect(s9ChoiceA.flags['flag_nexus_escalated']).toBe(true);

    // ------------------------------------------------------------------------
    // 9. ENTERPRISE DEBRIEF SCREEN
    // ------------------------------------------------------------------------
    expect(s9ChoiceA.episode!.activeBeatId).toBe('ep01_beat_09_day_debrief');
    const scorecard = evaluateEpisode01DayCase({
      usedSmbFilter: true,
      preservedIamEvidence: true,
      preservedPcapEvidence: true,
      executedContainment: true,
      executedRemediation: true,
      executedVerification: true,
      choice: 'A',
    });
    expect(scorecard.grade).toBe('GRADE S');
    expect(scorecard.attckMappings).toContain('T1021.002: Remote Services — SMB/Windows Admin Shares');
    expect(scorecard.attckMappings).toContain('T1071.001: Command and Control — Web Protocols');

    // ------------------------------------------------------------------------
    // 10. NIGHT JOB: Quiet Path (Passive OSINT)
    // ------------------------------------------------------------------------
    const { state: s10 } = completeEpisodeBeat(s9ChoiceA, 'ep01_beat_09_day_debrief');
    expect(s10.episode!.activeBeatId).toBe('ep01_beat_10_night_recon');

    // In quiet path, analyst gathers intelligence without triggering active defender telemetry
    expect(s10.trace!.traceMeter).toBe(0);

    // ------------------------------------------------------------------------
    // 11. JOURNAL ENTRY 2: Second Entry with Seeded Contradiction
    // ------------------------------------------------------------------------
    const { state: s11 } = completeEpisodeBeat(s10, 'ep01_beat_10_night_recon');
    expect(s11.episode!.activeBeatId).toBe('ep01_beat_11_journal_night');
    expect(s11.episode!.unlockedJournalEntryIds).toContain('ep01_journal_02');

    // ------------------------------------------------------------------------
    // 12. CLIFFHANGER: Blackout Beat & Evidence PCAP Drop
    // ------------------------------------------------------------------------
    const { state: s12 } = completeEpisodeBeat(s11, 'ep01_beat_11_journal_night');
    expect(s12.episode!.activeBeatId).toBe('ep01_beat_12_cliffhanger');
    expect(s12.episode!.activeBlackout).toBeDefined();

    // Verify dropped file on virtual filesystem
    const droppedPcap = virtualFilesystem.readFile('/tmp/nexus_handshake_dump.pcap');
    expect(droppedPcap).not.toBeNull();
    expect(droppedPcap?.content).toContain('vault-core-01.transit.internal');

    // Dismiss blackout
    const { state: sFinal } = dismissBlackout(s12);
    expect(sFinal.episode!.activeBlackout).toBeNull();

    // Verify final anonymous Onion Chat message delivered
    const anonMsg = sFinal.episode!.deliveredMessages.find((m) =>
      m.text.includes('You saw the Nexus address. Walk away.')
    );
    expect(anonMsg).toBeDefined();
    expect(anonMsg?.contactId).toBe('anonymous_nexus');
  });

  it('plays Choice B (Shield) & Loud Active Scan triggering Defender View', () => {
    const initialState = createInitialSimulationState();
    const { state: s1 } = startEpisode(initialState, EPISODE_01_DEFINITION.id);
    const { state: s2 } = dismissTitleCard(s1);

    // Fast-forward to Choice Beat
    let curr = s2;
    while (curr.episode?.activeBeatId && curr.episode.activeBeatId !== 'ep01_beat_08_choice') {
      const adv = completeEpisodeBeat(curr, curr.episode.activeBeatId);
      curr = adv.state;
    }

    expect(curr.episode!.activeBeatId).toBe('ep01_beat_08_choice');
    const initialSecOps = curr.narrative!.factions['faction_cedarline']?.standing ?? 0;
    const initialExposure = curr.trace!.legalExposureMeter ?? 0;

    // Choice B: Shield internal team
    const { state: sChoiceB } = resolveEpisodeChoice(curr, 'B');
    expect(sChoiceB.narrative!.factions['faction_cedarline']?.standing).toBe(initialSecOps - 5);
    expect(sChoiceB.trace!.legalExposureMeter).toBe(initialExposure + 10);
    expect(sChoiceB.flags['flag_ep01_choice_shield']).toBe(true);

    // Advance through Debrief to Night Recon
    const { state: sNight } = completeEpisodeBeat(sChoiceB, 'ep01_beat_09_day_debrief');
    expect(sNight.episode!.activeBeatId).toBe('ep01_beat_10_night_recon');

    // Loud path: Player executes active port scan against app-portal-01:8080
    const noisyAction = recordActionNoise(
      sNight.trace!,
      'nmap_syn_scan',
      'app-portal-01',
      sNight.time.simulationTimeSeconds,
      '2026-10-23T20:30:00Z',
      '10.0.4.15'
    );

    expect(noisyAction.event.noiseValue).toBeGreaterThan(0);
    expect(noisyAction.state.traceMeter).toBeGreaterThan(0);
    expect(noisyAction.state.actionHistory.length).toBeGreaterThanOrEqual(1);

    const historyEntry = noisyAction.state.actionHistory[0]!;
    expect(historyEntry.actionId).toBe('nmap_syn_scan');
    expect(historyEntry.target).toBe('app-portal-01');
  });
});
