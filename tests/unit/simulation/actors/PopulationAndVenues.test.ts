import { describe, it, expect } from 'vitest';
import { PopulationController } from '@/simulation/actors/population/PopulationController';
import { URBAN_ENVIRONMENT_PROFILES } from '@/simulation/actors/population/districtProfiles';
import { LAGOS_ISLAND_VENUES, getVenue } from '@/simulation/actors/population/venues';
import { POPULATION_TIERS } from '@/simulation/actors/population/types';

describe('Population Hierarchy & Urban Location System', () => {
  describe('Four-Tier Population Hierarchy Resolution', () => {
    it('defines 4 explicit performance tiers with bounded instances and cost scores', () => {
      expect(POPULATION_TIERS.length).toBe(4);
      expect(POPULATION_TIERS.map(t => t.tier)).toEqual([
        'TIER_1_AMBIENT_CROWD',
        'TIER_2_ROUTINE_NPC',
        'TIER_3_INTERACTIVE_NPC',
        'TIER_4_STORY_CRITICAL',
      ]);
    });

    it('resolves named story characters to TIER_4_STORY_CRITICAL', () => {
      expect(PopulationController.resolveNpcTier('npc_amina')).toBe('TIER_4_STORY_CRITICAL');
      expect(PopulationController.resolveNpcTier('npc_marcus')).toBe('TIER_4_STORY_CRITICAL');
      expect(PopulationController.resolveNpcTier('npc_femi')).toBe('TIER_4_STORY_CRITICAL');
    });

    it('resolves interactive merchants and desk guards to TIER_3_INTERACTIVE_NPC', () => {
      expect(PopulationController.resolveNpcTier('npc_contact_hr')).toBe('TIER_3_INTERACTIVE_NPC');
      expect(PopulationController.resolveNpcTier('npc_vendor_kiosk')).toBe('TIER_3_INTERACTIVE_NPC');
    });

    it('resolves scheduled commuters to TIER_2_ROUTINE_NPC', () => {
      expect(PopulationController.resolveNpcTier('ped_routine_commuter_01')).toBe('TIER_2_ROUTINE_NPC');
    });

    it('defaults unknown ambient actors to TIER_1_AMBIENT_CROWD', () => {
      expect(PopulationController.resolveNpcTier('ambient_ped_999')).toBe('TIER_1_AMBIENT_CROWD');
    });
  });

  describe('Nine Urban Environment Profiles & Density Schedules', () => {
    it('defines all 9 required urban environments', () => {
      expect(URBAN_ENVIRONMENT_PROFILES.length).toBe(9);
      const ids = URBAN_ENVIRONMENT_PROFILES.map(p => p.id);
      expect(ids).toContain('residential_neighborhood');
      expect(ids).toContain('commercial_street_market');
      expect(ids).toContain('cafe_coffee_shop');
      expect(ids).toContain('restaurant_food_venue');
      expect(ids).toContain('nightlife_venue');
      expect(ids).toContain('corporate_office_reception');
      expect(ids).toContain('repair_shop_cybercafe');
      expect(ids).toContain('soc_technical_lab');
      expect(ids).toContain('transit_hub_street');
    });

    it('simulates peak daytime rush at Balogun market (10:00 - 17:00)', () => {
      const densityAtMidday = PopulationController.calculateTargetDensity('commercial_street_market', 13);
      const densityAtNight = PopulationController.calculateTargetDensity('commercial_street_market', 2);

      expect(densityAtMidday).toBeGreaterThan(35); // 24 * 2.0 = 48
      expect(densityAtNight).toBeLessThanOrEqual(2); // Market closed at night
    });

    it('simulates peak corporate lobby rush at 08:00 and 17:00', () => {
      const densityMorning = PopulationController.calculateTargetDensity('corporate_office_reception', 8);
      const densityMidday = PopulationController.calculateTargetDensity('corporate_office_reception', 11);

      expect(densityMorning).toBeGreaterThan(densityMidday);
    });

    it('simulates evening activity at Marina Lagoon Lounge (21:00 - 24:00)', () => {
      const densityNoon = PopulationController.calculateTargetDensity('nightlife_venue', 12);
      const densityNight = PopulationController.calculateTargetDensity('nightlife_venue', 22);

      expect(densityNoon).toBeLessThan(2);
      expect(densityNight).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Meaningful Interior Venues & Operating Hours', () => {
    it('defines interior venues with authentic services and capacity limits', () => {
      expect(LAGOS_ISLAND_VENUES.length).toBeGreaterThanOrEqual(5);

      const bistro = getVenue('venue-eko-tech-bistro')!;
      expect(bistro.availableServices).toContain('COFFEE_AND_FOOD');
      expect(bistro.availableServices).toContain('WIFI_HOTSPOT');
      expect(bistro.maxCapacity).toBe(30);
    });

    it('allows player into Eko Bistro during normal operating hours (14:00, Monday)', () => {
      const status = PopulationController.evaluateVenueAccess('venue-eko-tech-bistro', 14, 1);
      expect(status.isOpen).toBe(true);
      expect(status.isPlayerPermitted).toBe(true);
    });

    it('rejects entry to Eko Bistro at 03:00 AM due to CLOSED_FOR_NIGHT', () => {
      const status = PopulationController.evaluateVenueAccess('venue-eko-tech-bistro', 3, 1);
      expect(status.isOpen).toBe(false);
      expect(status.denialReason).toBe('CLOSED_FOR_NIGHT');
      expect(status.nextOpenTimeString).toContain('07:00');
    });

    it('requires SECURITY_SECOPS badge for entry into Cedarline Level 4 SOC', () => {
      // Without badge
      const noBadgeStatus = PopulationController.evaluateVenueAccess('venue-cedarline-soc', 10, 1, []);
      expect(noBadgeStatus.isOpen).toBe(true);
      expect(noBadgeStatus.isPlayerPermitted).toBe(false);
      expect(noBadgeStatus.denialReason).toBe('BADGE_REQUIRED');

      // With badge
      const withBadgeStatus = PopulationController.evaluateVenueAccess('venue-cedarline-soc', 10, 1, ['SECURITY_SECOPS']);
      expect(withBadgeStatus.isPlayerPermitted).toBe(true);
    });
  });

  describe('Contextual Interaction Eligibility Standards', () => {
    it('allows sensitive investigative dialogue inside protected interior spaces', () => {
      const checkInterior = PopulationController.isMeaningfulInteractionAllowed('cedarline_interior', 'npc_amina');
      expect(checkInterior.allowed).toBe(true);
      expect(checkInterior.reason).toContain('Interior environment supports secure, confidential discussion');
    });

    it('allows meaningful interaction at designated contextual street spots (e.g. Mama Esther stall, Uncle Segun fountain bench)', () => {
      const checkNkechi = PopulationController.isMeaningfulInteractionAllowed('neighborhood', 'npc_nkechi');
      expect(checkNkechi.allowed).toBe(true);
      expect(checkNkechi.reason).toContain('Balogun electronics stall');

      const checkSegun = PopulationController.isMeaningfulInteractionAllowed('neighborhood', 'npc_segun');
      expect(checkSegun.allowed).toBe(true);
      expect(checkSegun.reason).toContain('Tinubu Square civic fountain bench');
    });

    it('rejects deep corporate investigations on random exposed sidewalks unless urgent story phase active', () => {
      const checkStreet = PopulationController.isMeaningfulInteractionAllowed('neighborhood', 'npc_amina', false);
      expect(checkStreet.allowed).toBe(false);
      expect(checkStreet.reason).toContain('too exposed for sensitive corporate investigations');

      const checkUrgent = PopulationController.isMeaningfulInteractionAllowed('neighborhood', 'npc_amina', true);
      expect(checkUrgent.allowed).toBe(true);
    });
  });
});
