import { describe, it, expect } from 'vitest';
import { NPC_PROFILES, getNpcProfile } from '@/simulation/actors/npcProfiles';
import { getNpcActiveSchedule } from '@/simulation/actors/npcSchedules';
import {
  clampRelationship,
  getRelationshipBand,
  getRelationshipBandLabel,
  MIN_RELATIONSHIP,
  MAX_RELATIONSHIP,
} from '@/simulation/actors/types';

describe('Milestone 7: NPC Profiles, Schedules & Relationship System', () => {
  it('defines at least 8 meaningfully distinct NPC profiles', () => {
    expect(NPC_PROFILES.length).toBeGreaterThanOrEqual(8);

    const ids = new Set(NPC_PROFILES.map(p => p.id));
    expect(ids.size).toBe(NPC_PROFILES.length);

    // Verify key target roles are represented
    const roles = NPC_PROFILES.map(p => p.role.toLowerCase());
    expect(roles.some(r => r.includes('security') || r.includes('analyst'))).toBe(true); // Mentor
    expect(roles.some(r => r.includes('infrastructure') || r.includes('administrator'))).toBe(true); // Cedarline employee / sysadmin
    expect(roles.some(r => r.includes('ai') || r.includes('engineer'))).toBe(true); // Technical colleague
    expect(roles.some(r => r.includes('vp') || r.includes('operations'))).toBe(true); // Management stakeholder
    expect(roles.some(r => r.includes('merchant') || r.includes('vendor'))).toBe(true); // Local shopkeeper
    expect(roles.some(r => r.includes('elder') || r.includes('historian'))).toBe(true); // Neighborhood resident
    expect(roles.some(r => r.includes('talent') || r.includes('liaison'))).toBe(true); // Recruiter/client
    expect(roles.some(r => r.includes('researcher') || r.includes('security'))).toBe(true); // Independent perspective
  });

  it('validates each NPC profile has complete data attributes', () => {
    for (const profile of NPC_PROFILES) {
      expect(profile.id).toMatch(/^npc_[a-z0-9_]+$/);
      expect(profile.name.length).toBeGreaterThan(2);
      expect(profile.role.length).toBeGreaterThan(2);
      expect(profile.bio.length).toBeGreaterThan(10);
      expect(profile.voiceTone.length).toBeGreaterThan(5);
      expect(profile.initialRelationship).toBeGreaterThanOrEqual(MIN_RELATIONSHIP);
      expect(profile.initialRelationship).toBeLessThanOrEqual(MAX_RELATIONSHIP);
      expect(profile.palette).toBeDefined();
      expect(profile.palette.skin).toBeGreaterThan(0);
      expect(profile.schedule.length).toBeGreaterThan(0);

      // Verify knowledge boundaries
      expect(profile.knowledgeBoundaries.knownFacts.length).toBeGreaterThan(0);
      expect(profile.knowledgeBoundaries.unknownFacts.length).toBeGreaterThan(0);
    }
  });

  it('retrieves profile by ID correctly', () => {
    const amina = getNpcProfile('npc_amina');
    expect(amina).toBeDefined();
    expect(amina?.name).toBe('Blessing');

    const unknown = getNpcProfile('npc_nonexistent');
    expect(unknown).toBeUndefined();
  });

  describe('Relationship Math & Bands', () => {
    it('clamps relationship strictly within [-100, 100]', () => {
      expect(clampRelationship(0)).toBe(0);
      expect(clampRelationship(150)).toBe(100);
      expect(clampRelationship(-200)).toBe(-100);
      expect(clampRelationship(50)).toBe(50);
      expect(clampRelationship(-15)).toBe(-15);
    });

    it('classifies relationship into the 5 specified bands', () => {
      // Hostile: -100 to -51
      expect(getRelationshipBand(-100)).toBe('HOSTILE');
      expect(getRelationshipBand(-51)).toBe('HOSTILE');
      expect(getRelationshipBandLabel('HOSTILE')).toBe('Hostile');

      // Distrustful: -50 to -16
      expect(getRelationshipBand(-50)).toBe('DISTRUSTFUL');
      expect(getRelationshipBand(-16)).toBe('DISTRUSTFUL');
      expect(getRelationshipBandLabel('DISTRUSTFUL')).toBe('Distrustful');

      // Neutral: -15 to +15
      expect(getRelationshipBand(-15)).toBe('NEUTRAL');
      expect(getRelationshipBand(0)).toBe('NEUTRAL');
      expect(getRelationshipBand(15)).toBe('NEUTRAL');
      expect(getRelationshipBandLabel('NEUTRAL')).toBe('Neutral');

      // Friendly: +16 to +50
      expect(getRelationshipBand(16)).toBe('FRIENDLY');
      expect(getRelationshipBand(50)).toBe('FRIENDLY');
      expect(getRelationshipBandLabel('FRIENDLY')).toBe('Friendly');

      // Trusted: +51 to +100
      expect(getRelationshipBand(51)).toBe('TRUSTED');
      expect(getRelationshipBand(100)).toBe('TRUSTED');
      expect(getRelationshipBandLabel('TRUSTED')).toBe('Trusted');
    });
  });

  describe('Daily Schedules & Routines', () => {
    it('evaluates active schedule based on simulation hour', () => {
      const amina = getNpcProfile('npc_amina')!;

      // 09:00 -> On shift in Cedarline SOC
      const morningSched = getNpcActiveSchedule(amina, 9);
      expect(morningSched.locationId).toBe('cedarline_interior');
      expect(morningSched.activity.toLowerCase()).toContain('soc');

      // 21:00 -> Evening shift / review in Cedarline
      const eveningSched = getNpcActiveSchedule(amina, 21);
      expect(eveningSched.activity.toLowerCase()).toContain('telemetry');
    });

    it('handles wrapping across midnight (23 -> 0)', () => {
      const tunde = getNpcProfile('npc_tunde')!;
      const lateNightSched = getNpcActiveSchedule(tunde, 23);
      expect(lateNightSched).toBeDefined();

      const earlyMorningSched = getNpcActiveSchedule(tunde, 2);
      expect(earlyMorningSched).toBeDefined();
    });
  });
});
