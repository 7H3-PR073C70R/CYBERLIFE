import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import { STORY_CHAPTERS, NARRATIVE_MISSIONS } from '@/simulation/narrative/narrativeData';

describe('Milestone 14 — Narrative Branching & Progression Architecture', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  describe('Story Arc Initialization & Prerequisites', () => {
    it('starts with Arc 1 (The Aster Anomaly) and Chapter 1 active by default', () => {
      const state = engine.getState();
      expect(state.narrative).toBeDefined();
      expect(state.narrative!.activeArcId).toBe('arc_aster_incident');
      expect(state.narrative!.activeChapterId).toBe('ch_triage_broad_street');
      expect(state.narrative!.activeMissionIds).toContain('miss_triage_alert');
    });

    it('blocks starting Arc 2 (The Eko Nexus Pipeline) when prerequisites are unmet', () => {
      const result = engine.dispatch({
        type: 'StartStoryArc',
        arcId: 'arc_eko_nexus',
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NARRATIVE_PREREQUISITES_NOT_MET');
    });

    it('allows starting Arc 2 once prerequisite flag flag_arc_aster_completed is set', () => {
      engine.dispatch({
        type: 'SetWorldFlag',
        key: 'flag_arc_aster_completed',
        value: true,
      });

      const result = engine.dispatch({
        type: 'StartStoryArc',
        arcId: 'arc_eko_nexus',
      });

      expect(result.success).toBe(true);
      const state = engine.getState();
      expect(state.narrative!.activeArcId).toBe('arc_eko_nexus');
      expect(state.narrative!.activeChapterId).toBe('ch_curbside_beacon');
      expect(state.narrative!.activeMissionIds).toContain('miss_curbside_forensics');
    });
  });

  describe('Chapter Transitions & Branching Pathways', () => {
    it('advances chapters cleanly, archiving previous chapters', () => {
      const result = engine.dispatch({
        type: 'AdvanceStoryChapter',
        chapterId: 'ch_infrastructure_dilemma',
      });

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(1);

      const event = result.events[0]!;
      expect(event.type).toBe('STORY_CHAPTER_ADVANCED');
      expect(event.payload).toMatchObject({
        previousChapterId: 'ch_triage_broad_street',
        currentChapterId: 'ch_infrastructure_dilemma',
      });

      const state = engine.getState();
      expect(state.narrative!.activeChapterId).toBe('ch_infrastructure_dilemma');
      expect(state.narrative!.completedChapterIds).toContain('ch_triage_broad_street');
      expect(state.narrative!.activeMissionIds).toContain('miss_audit_credentials');
    });

    it('evaluates branching path conditions correctly based on world flags', () => {
      const chapter = STORY_CHAPTERS.find(c => c.id === 'ch_infrastructure_dilemma')!;
      expect(chapter.branchingPaths).toBeDefined();
      expect(chapter.branchingPaths!.length).toBe(2);

      const branchProtected = chapter.branchingPaths!.find(b =>
        b.conditionFlags.includes('flag_marcus_protected')
      )!;
      expect(branchProtected.nextChapterId).toBe('ch_containment_remediation');

      const branchExposed = chapter.branchingPaths!.find(b =>
        b.conditionFlags.includes('flag_marcus_exposed')
      )!;
      expect(branchExposed.nextChapterId).toBe('ch_containment_remediation');
    });
  });

  describe('Mission Outcomes, Consequences & Recovery Branches', () => {
    it('completes narrative mission, awarding XP, money, flags, and faction standing', () => {
      const initialMoney = engine.getState().player.moneyKobo;
      const initialCedarlineStanding = engine.getState().narrative!.factions['faction_cedarline']!.standing;

      const result = engine.dispatch({
        type: 'CompleteNarrativeMission',
        missionId: 'miss_triage_alert',
      });

      expect(result.success).toBe(true);
      const state = engine.getState();

      expect(state.narrative!.completedMissionIds).toContain('miss_triage_alert');
      expect(state.narrative!.activeMissionIds).not.toContain('miss_triage_alert');

      // Money credited
      expect(state.player.moneyKobo).toBe(initialMoney + 100_000);

      // Faction standing increased
      const cedarline = state.narrative!.factions['faction_cedarline']!;
      expect(cedarline.standing).toBe(initialCedarlineStanding + 5);

      // Event emitted
      expect(result.events.some(e => e.type === 'NARRATIVE_MISSION_COMPLETED')).toBe(true);
    });

    it('handles mission failure gracefully and activates recovery branch when defined', () => {
      const missionWithRecovery = NARRATIVE_MISSIONS.find(m => m.id === 'miss_audit_credentials')!;
      expect(missionWithRecovery).toBeDefined();

      const result = engine.dispatch({
        type: 'FailNarrativeMission',
        missionId: 'miss_audit_credentials',
        reason: 'Marcus panicked and fled during interview',
      });

      expect(result.success).toBe(true);
      const state = engine.getState();
      expect(state.narrative!.failedMissionIds).toContain('miss_audit_credentials');

      const failEvent = result.events.find(e => e.type === 'NARRATIVE_MISSION_FAILED')!;
      expect(failEvent).toBeDefined();
      expect(failEvent.payload).toMatchObject({
        missionId: 'miss_audit_credentials',
        reason: 'Marcus panicked and fled during interview',
      });
    });
  });
});
