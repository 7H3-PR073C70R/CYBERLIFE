import { describe, it, expect } from 'vitest';
import {
  PEDESTRIAN_ROLES,
  generatePedestrianAppearance,
  ensureAdjacentDistinctness,
  getPedestrianRoleById,
} from '@/presentation/world/entities/PedestrianVariationEngine';
import { NAMED_NPC_PRESETS } from '@/presentation/world/entities/ModularCharacterRoles';
import { WEST_AFRICAN_SKIN_TONES } from '@/presentation/world/entities/ModularCharacter';

describe('PedestrianVariationEngine & Stage B Roster', () => {
  it('defines 22+ authentic Lagos pedestrian roles with valid configs', () => {
    expect(PEDESTRIAN_ROLES.length).toBeGreaterThanOrEqual(22);

    for (const role of PEDESTRIAN_ROLES) {
      expect(role.id).toBeDefined();
      expect(role.roleName).toBeDefined();
      expect(role.wardrobe.length).toBeGreaterThan(0);
      expect(role.heightRange[0]).toBeLessThan(role.heightRange[1]);
      expect(role.genderWeight.male + role.genderWeight.female).toBeCloseTo(1.0, 2);
    }
  });

  it('generates completely deterministic appearances for identical seeds', () => {
    const roleId = 'office_worker';
    const seed = 'test_seed_marina_42';

    const p1 = generatePedestrianAppearance(seed, roleId);
    const p2 = generatePedestrianAppearance(seed, roleId);

    expect(p1.seed).toBe(p2.seed);
    expect(p1.appearance.body).toBe(p2.appearance.body);
    expect(p1.appearance.skinToneIndex).toBe(p2.appearance.skinToneIndex);
    expect(p1.appearance.heightScale).toBe(p2.appearance.heightScale);
    expect(p1.appearance.clothing.top).toBe(p2.appearance.clothing.top);
    expect(p1.appearance.clothing.topColor).toBe(p2.appearance.clothing.topColor);
    expect(p1.appearance.clothing.bottomColor).toBe(p2.appearance.clothing.bottomColor);
    expect(p1.gaitSpeedModifier).toBe(p2.gaitSpeedModifier);
  });

  it('generates varied appearances across different seeds for the same role', () => {
    const roleId = 'banker';
    const samples = Array.from({ length: 15 }, (_, i) =>
      generatePedestrianAppearance(`banker_sample_${i}`, roleId)
    );

    const colors = new Set(samples.map(s => s.appearance.clothing.topColor));
    const heights = new Set(samples.map(s => s.appearance.heightScale));
    const tones = new Set(samples.map(s => s.appearance.skinToneIndex));

    expect(colors.size).toBeGreaterThan(1);
    expect(heights.size).toBeGreaterThan(5);
    expect(tones.size).toBeGreaterThan(2);
  });

  it('constrains skin tones within the 8 West African skin tone palette', () => {
    for (let i = 0; i < 50; i++) {
      const p = generatePedestrianAppearance(`skin_check_${i}`, 'market_trader');
      expect(p.appearance.skinToneIndex).toBeGreaterThanOrEqual(0);
      expect(p.appearance.skinToneIndex).toBeLessThan(WEST_AFRICAN_SKIN_TONES.length);
      expect(WEST_AFRICAN_SKIN_TONES[p.appearance.skinToneIndex]).toBeDefined();
    }
  });

  it('enforces height scaling within safe simulation bounds (0.93 - 1.07)', () => {
    for (const role of PEDESTRIAN_ROLES) {
      const p = generatePedestrianAppearance(`height_check_${role.id}`, role.id);
      expect(p.appearance.heightScale).toBeGreaterThanOrEqual(0.92);
      expect(p.appearance.heightScale).toBeLessThanOrEqual(1.08);
    }
  });

  it('validates anti-adjacency and anti-clash distinctness rules', () => {
    const p1 = generatePedestrianAppearance('seed_A', 'office_worker');
    const p2 = generatePedestrianAppearance('seed_B', 'office_worker');

    // Identical clone test
    const isDistinct = ensureAdjacentDistinctness(p1, p1);
    expect(isDistinct).toBe(false);

    // Varied seeds should generally pass distinctness
    expect(ensureAdjacentDistinctness(p1, p2)).toBe(true);
  });

  it('contains all 15 named NPC presets with valid configurations', () => {
    expect(NAMED_NPC_PRESETS.length).toBe(15);

    const expectedIds = [
      'npc_amina', // Blessing
      'npc_marcus', // Barry
      'npc_elena', // Mercy
      'npc_femi', // Michael
      'npc_nkechi', // Mama Esther
      'npc_segun', // Uncle Segun
      'npc_folake', // Goodness
      'npc_tunde', // Tsharp
      'npc_kemi', // Mary
      'npc_babatunde', // Daniel
      'npc_chidi', // Choker
      'cipher', // Cipher
      'canteen_bukky', // Mama Bukky
      'player_default_male', // Protector Male
      'player_default_female', // Protector Female
    ];

    for (const expectedId of expectedIds) {
      const found = NAMED_NPC_PRESETS.find(p => p.id === expectedId);
      expect(found, `Expected Named NPC with id ${expectedId} to exist`).toBeDefined();
      expect(found?.roleName).toBeDefined();
      expect(found?.signatureItem).toBeDefined();
      expect(found?.appearance.skinToneIndex).toBeGreaterThanOrEqual(0);
      expect(found?.appearance.clothing.top).toBeDefined();
      expect(found?.appearance.clothing.bottom).toBeDefined();
      expect(found?.appearance.clothing.shoes).toBeDefined();
    }
  });

  it('provides lookups for roles by ID', () => {
    expect(getPedestrianRoleById('okada_rider')).toBeDefined();
    expect(getPedestrianRoleById('danfo_conductor')).toBeDefined();
    expect(getPedestrianRoleById('non_existent_role')).toBeUndefined();
  });
});
