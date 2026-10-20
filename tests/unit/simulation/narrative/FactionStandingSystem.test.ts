import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import {
  clampFactionStanding,
  getFactionStandingBand,
} from '@/simulation/narrative/narrativeEvaluator';
import { FACTION_DEFINITIONS } from '@/simulation/narrative/narrativeData';

describe('Milestone 14 — Faction Standing System', () => {
  describe('Mathematical Clamping & Band Mapping', () => {
    it('clamps standing values strictly within [-100, 100]', () => {
      expect(clampFactionStanding(-150)).toBe(-100);
      expect(clampFactionStanding(-100)).toBe(-100);
      expect(clampFactionStanding(0)).toBe(0);
      expect(clampFactionStanding(50)).toBe(50);
      expect(clampFactionStanding(100)).toBe(100);
      expect(clampFactionStanding(250)).toBe(100);
      expect(clampFactionStanding(14.7)).toBe(15);
    });

    it('correctly categorizes standing into the 5 qualitative bands', () => {
      expect(getFactionStandingBand(-100)).toBe('HOSTILE');
      expect(getFactionStandingBand(-50)).toBe('HOSTILE');
      expect(getFactionStandingBand(-49)).toBe('DISTRUSTED');
      expect(getFactionStandingBand(-15)).toBe('DISTRUSTED');
      expect(getFactionStandingBand(-14)).toBe('NEUTRAL');
      expect(getFactionStandingBand(0)).toBe('NEUTRAL');
      expect(getFactionStandingBand(14)).toBe('NEUTRAL');
      expect(getFactionStandingBand(15)).toBe('FAVORED');
      expect(getFactionStandingBand(49)).toBe('FAVORED');
      expect(getFactionStandingBand(50)).toBe('ALLIED');
      expect(getFactionStandingBand(100)).toBe('ALLIED');
    });
  });

  describe('SimulationEngine Integration & Faction Transitions', () => {
    let engine: SimulationEngine;

    beforeEach(() => {
      engine = new SimulationEngine();
    });

    it('initializes all 8 authored factions with their default standings', () => {
      const state = engine.getState();
      expect(state.narrative).toBeDefined();

      const factions = state.narrative!.factions;
      expect(Object.keys(factions).length).toBe(FACTION_DEFINITIONS.length);

      expect(factions['faction_cedarline']?.standing).toBe(10);
      expect(factions['faction_cedarline']?.band).toBe('NEUTRAL');

      expect(factions['faction_balogun_traders']?.standing).toBe(15);
      expect(factions['faction_balogun_traders']?.band).toBe('FAVORED');

      expect(factions['faction_krest_ir']?.standing).toBe(-5);
      expect(factions['faction_krest_ir']?.band).toBe('NEUTRAL');
    });

    it('updates faction standing, records event and history, and updates reputation band', () => {
      const result = engine.dispatch({
        type: 'ChangeFactionStanding',
        factionId: 'faction_cedarline',
        delta: 20,
        reason: 'Resolved Aster Incident without executive liability',
      });

      expect(result.success).toBe(true);
      expect(result.events.length).toBe(1);

      const event = result.events[0]!;
      expect(event.type).toBe('FACTION_STANDING_CHANGED');
      expect(event.payload).toMatchObject({
        factionId: 'faction_cedarline',
        previousStanding: 10,
        newStanding: 30,
        delta: 20,
        band: 'FAVORED',
      });

      const cedarline = engine.getState().narrative!.factions['faction_cedarline']!;
      expect(cedarline.standing).toBe(30);
      expect(cedarline.band).toBe('FAVORED');
      expect(cedarline.history.length).toBe(1);
      expect(cedarline.history[0]?.reason).toContain('Resolved Aster Incident');
    });

    it('clamps negative delta standing to -100 and transitions to HOSTILE band', () => {
      const result = engine.dispatch({
        type: 'ChangeFactionStanding',
        factionId: 'faction_cedarline',
        delta: -150,
        reason: 'Handed unredacted internal executive logs to The Lagos Inquirer',
      });

      expect(result.success).toBe(true);
      const cedarline = engine.getState().narrative!.factions['faction_cedarline']!;
      expect(cedarline.standing).toBe(-100);
      expect(cedarline.band).toBe('HOSTILE');
    });

    it('rejects changes to unknown faction IDs with FACTION_NOT_FOUND error', () => {
      const result = engine.dispatch({
        type: 'ChangeFactionStanding',
        factionId: 'faction_unknown_syndicate',
        delta: 10,
        reason: 'Test unknown',
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('FACTION_NOT_FOUND');
    });
  });
});
