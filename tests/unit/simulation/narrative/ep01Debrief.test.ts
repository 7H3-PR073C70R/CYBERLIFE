/**
 * Cyberlife — Episode 01 Debrief, Scoring Rubric, Hint Ladder & Faction Effects
 *
 * Validates:
 * 1. Post-day-case educational debrief evaluation (evaluateEpisode01DayCase).
 * 2. MITRE ATT&CK mappings (T1021.002, T1071.001) and NIST SP 800-61r2 phases.
 * 3. Learning-based scoring rubric (not speed-based): Grade S/A/B/C.
 * 4. 3-tier Blessing Mentor Hint Ladder progression (nudge -> direction -> answer).
 * 5. Choice A vs Choice B faction effects (+10/-5 Cedarline SecOps, +5 0xLagos) and legal exposure.
 */

import { describe, it, expect } from 'vitest';
import { evaluateEpisode01DayCase } from '../../../../src/simulation/narrative/ep01DebriefData';
import { evaluateMentorHint } from '../../../../src/simulation/narrative/mentorHintLadder';
import { EPISODE_01_MENTOR_HINTS } from '../../../../src/simulation/narrative/ep01MentorHints';
import { createInitialSimulationState } from '../../../../src/simulation/core/initialState';
import {
  startEpisode,
  completeEpisodeBeat,
  resolveEpisodeChoice,
} from '../../../../src/simulation/narrative/episodeDirector';
import { EPISODE_01_DEFINITION } from '../../../../src/simulation/narrative/episodeData';

describe('Episode 01 Debrief, Scoring & Narrative Progression', () => {
  describe('1. Enterprise Debrief & Learning-Based Scorecard', () => {
    it('awards Grade S for complete triage, filter mastery, evidence preservation and Choice A', () => {
      const scorecard = evaluateEpisode01DayCase({
        usedSmbFilter: true,
        preservedIamEvidence: true,
        preservedPcapEvidence: true,
        executedContainment: true,
        executedRemediation: true,
        executedVerification: true,
        choice: 'A',
      });

      expect(scorecard.totalScore).toBe(100);
      expect(scorecard.grade).toBe('GRADE S');
      expect(scorecard.correctFindings.length).toBeGreaterThanOrEqual(4);
      expect(scorecard.missedFindings.length).toBe(0);
      expect(scorecard.attckMappings).toContain('T1021.002: Remote Services — SMB/Windows Admin Shares');
      expect(scorecard.attckMappings).toContain('T1071.001: Command and Control — Web Protocols');
      expect(scorecard.tier1Lesson).toContain('Tier-1 analysts must always correlate perimeter proxy logs');
    });

    it('awards Grade B for partial evidence preservation and internal suppression choice B', () => {
      const scorecard = evaluateEpisode01DayCase({
        usedSmbFilter: true,
        preservedIamEvidence: true,
        preservedPcapEvidence: false,
        executedContainment: true,
        executedRemediation: true,
        executedVerification: false,
        choice: 'B',
      });

      // 30 (filter) + 15 (partial evd) + 15 (partial cont) + 10 (choice B) = 70
      expect(scorecard.totalScore).toBe(70);
      expect(scorecard.grade).toBe('GRADE B');
      expect(scorecard.missedFindings).toContain('Missed preserving full multi-source forensic artifacts before initiating containment.');
      expect(scorecard.missedFindings).toContain('Did not complete formal recovery verification test suite.');
    });

    it('rates performance on learning accuracy rather than speed elapsed', () => {
      // Two cases with the exact same investigation actions have identical score, regardless of speed
      const scorecard1 = evaluateEpisode01DayCase({
        usedSmbFilter: true,
        preservedIamEvidence: true,
        preservedPcapEvidence: true,
        executedContainment: true,
        executedRemediation: true,
        executedVerification: true,
        choice: 'A',
      });

      const scorecard2 = evaluateEpisode01DayCase({
        usedSmbFilter: true,
        preservedIamEvidence: true,
        preservedPcapEvidence: true,
        executedContainment: true,
        executedRemediation: true,
        executedVerification: true,
        choice: 'A',
      });

      expect(scorecard1.totalScore).toBe(scorecard2.totalScore);
      expect(scorecard1.grade).toBe(scorecard2.grade);
    });
  });

  describe('2. Blessing 3-Tier Mentor Hint Ladder', () => {
    const reconHintDef = EPISODE_01_MENTOR_HINTS.find((h) => h.beatId === 'ep01_beat_05_recon');

    it('delivers Level 1 (Nudge) after idle threshold 1', () => {
      expect(reconHintDef).toBeDefined();
      const res = evaluateMentorHint(reconHintDef, 50, []);
      expect(res.shouldDeliver).toBe(true);
      expect(res.tier).toBe(1);
      expect(res.hintText).toContain('Protector, start with subnet reconnaissance.');
    });

    it('progresses to Level 2 (Direction) after idle threshold 2', () => {
      const delivered = ['ep01_beat_05_recon_tier1'];
      const res = evaluateMentorHint(reconHintDef, 95, delivered);
      expect(res.shouldDeliver).toBe(true);
      expect(res.tier).toBe(2);
      expect(res.hintText).toContain('Run netmap to confirm filesrv-01');
    });

    it('escalates to Level 3 (Answer) with exact CLI command when player remains stalled', () => {
      const delivered = ['ep01_beat_05_recon_tier1', 'ep01_beat_05_recon_tier2'];
      const res = evaluateMentorHint(reconHintDef, 140, delivered);
      expect(res.shouldDeliver).toBe(true);
      expect(res.tier).toBe(3);
      expect(res.hintText).toContain('Execute: "netmap hosts"');
    });

    it('does not repeat previously delivered hint tier', () => {
      const delivered = ['ep01_beat_05_recon_tier1', 'ep01_beat_05_recon_tier2', 'ep01_beat_05_recon_tier3'];
      const res = evaluateMentorHint(reconHintDef, 200, delivered);
      expect(res.shouldDeliver).toBe(false);
    });
  });

  describe('3. Choice A vs Choice B Faction Effects, Exposure & Persistent Flags', () => {
    it('applies Choice A effects: Cedarline SecOps +10, Exposure 0, flag_ep01_choice_escalate', () => {
      const state0 = createInitialSimulationState();
      const { state: stateEp } = startEpisode(state0, EPISODE_01_DEFINITION.id);

      // Fast-forward to Choice Beat (ep01_beat_08_choice)
      let curr = stateEp;
      while (curr.episode?.activeBeatId && curr.episode.activeBeatId !== 'ep01_beat_08_choice') {
        const adv = completeEpisodeBeat(curr, curr.episode.activeBeatId);
        curr = adv.state;
      }

      expect(curr.episode!.activeChoice).toBeDefined();
      expect(curr.episode!.activeChoice?.choiceId).toBe('ep01_choice_escalate_vs_shield');

      const initialSecOps = curr.narrative!.factions['faction_cedarline']?.standing ?? 0;
      const initialExposure = curr.trace!.legalExposureMeter ?? 0;

      const { state: resolvedState } = resolveEpisodeChoice(curr, 'A');

      expect(resolvedState.narrative!.factions['faction_cedarline']?.standing).toBe(initialSecOps + 10);
      expect(resolvedState.trace!.legalExposureMeter).toBe(initialExposure);
      expect(resolvedState.flags['flag_ep01_choice_escalate']).toBe(true);
      expect(resolvedState.flags['flag_ep01_choice_shield']).toBeFalsy();
    });

    it('applies Choice B effects: Cedarline SecOps -5, Legal Exposure +10, flag_ep01_choice_shield', () => {
      const state0 = createInitialSimulationState();
      const { state: stateEp } = startEpisode(state0, EPISODE_01_DEFINITION.id);

      let curr = stateEp;
      while (curr.episode?.activeBeatId && curr.episode.activeBeatId !== 'ep01_beat_08_choice') {
        const adv = completeEpisodeBeat(curr, curr.episode.activeBeatId);
        curr = adv.state;
      }

      const initialSecOps = curr.narrative!.factions['faction_cedarline']?.standing ?? 0;
      const initialExposure = curr.trace!.legalExposureMeter ?? 0;

      const { state: resolvedState } = resolveEpisodeChoice(curr, 'B');

      expect(resolvedState.narrative!.factions['faction_cedarline']?.standing).toBe(initialSecOps - 5);
      expect(resolvedState.trace!.legalExposureMeter).toBe(initialExposure + 10);
      expect(resolvedState.flags['flag_ep01_choice_shield']).toBe(true);
      expect(resolvedState.flags['flag_ep01_choice_escalate']).toBeFalsy();
    });
  });
});
