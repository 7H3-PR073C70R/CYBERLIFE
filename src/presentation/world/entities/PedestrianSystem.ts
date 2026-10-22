import * as THREE from 'three';
import { HumanoidCharacter } from './HumanoidCharacter';
import { RiggedPedestrian, PedestrianBodyType } from './RiggedPedestrian';

export interface PedestrianWaypoint {
  x: number;
  z: number;
}

export interface PedestrianArchetype {
  id: string;
  name: string;
  role: string;
  bodyType: PedestrianBodyType;
}

export interface PedestrianJourney {
  origin: string;
  destination: string;
  waypoints: PedestrianWaypoint[];
}

export const PEDESTRIAN_ARCHETYPES: PedestrianArchetype[] = [
  // 1. Babajide - Managing Director, Marina Capital Holdings (Elite Executive)
  {
    id: 'marina_managing_director',
    name: 'Babajide',
    role: 'Managing Director, Marina Capital',
    bodyType: 'male_1',
  },
  // 2. Ngozi - Senior Commercial Legal Counsel (Elite Executive)
  {
    id: 'broad_street_legal_counsel',
    name: 'Ngozi',
    role: 'Senior Commercial Legal Counsel',
    bodyType: 'female_1',
  },
  // 3. Chidi - Executive Chairman, Eko Maritime (Elite Executive)
  {
    id: 'marina_executive_chairman',
    name: 'Chidi',
    role: 'Executive Chairman, Eko Maritime',
    bodyType: 'male_2',
  },
  // 4. Zainab - Chief Investment Officer, Sovereign Wealth (Elite Executive)
  {
    id: 'chief_investment_officer',
    name: 'Zainab',
    role: 'Chief Investment Officer',
    bodyType: 'female_2',
  },
  // 5. Olumide - VP of Digital Infrastructure (Elite Executive)
  {
    id: 'fintech_vp_infrastructure',
    name: 'Olumide',
    role: 'VP of Digital Infrastructure',
    bodyType: 'male_1',
  },
  // 6. Folashade - Senior Partner, Maritime Arbitration (Elite Executive)
  {
    id: 'commercial_arbitration_partner',
    name: 'Folashade',
    role: 'Senior Partner, Maritime Law',
    bodyType: 'female_1',
  },
  // 7. Femi - Chief Risk Officer, Broad Street Interbank (Elite Executive)
  {
    id: 'interbank_risk_director',
    name: 'Femi',
    role: 'Chief Risk Officer, Interbank',
    bodyType: 'male_2',
  },
  // 8. Ronke - Managing Partner, Eko Private Equity (Elite Executive)
  {
    id: 'private_equity_partner',
    name: 'Ronke',
    role: 'Managing Partner, Private Equity',
    bodyType: 'female_2',
  },
  // 9. Tsharp - Lagos Tech Entrepreneur (Smart Casual)
  {
    id: 'lagos_tech_entrepreneur',
    name: 'Tsharp',
    role: 'Lagos Tech Entrepreneur',
    bodyType: 'male_1',
  },
  // 10. Emeka - Balogun Market Merchant (Vibrant Ankara)
  {
    id: 'balogun_market_merchant',
    name: 'Emeka',
    role: 'Balogun Market Merchant',
    bodyType: 'male_2',
  },
  // 11. Amina - Broad Street Cyber Researcher (Smart Casual)
  {
    id: 'broad_street_cyber_researcher',
    name: 'Amina',
    role: 'Broad Street Cyber Researcher',
    bodyType: 'female_2',
  },
  // 12. Halima - Lagos Urban Systems Planner (Smart Casual)
  {
    id: 'urban_planner_consultant',
    name: 'Halima',
    role: 'Lagos Urban Systems Planner',
    bodyType: 'female_1',
  },
  // 13. Kunle - Broad Street Creative Director (Smart Casual)
  {
    id: 'creative_agency_director',
    name: 'Kunle',
    role: 'Broad Street Creative Director',
    bodyType: 'male_1',
  },
  // 14. Blessing - Idumota Logistics Coordinator (Smart Casual)
  {
    id: 'logistics_operations_lead',
    name: 'Blessing',
    role: 'Idumota Logistics Coordinator',
    bodyType: 'female_2',
  },
  // 15. Dayo - Marina Ferry Operations Officer (Maritime Casual)
  {
    id: 'marina_ferry_captain',
    name: 'Dayo',
    role: 'Marina Ferry Transit Officer',
    bodyType: 'male_1',
  },
  // 16. Funke - Fintech Systems Architect (Smart Casual)
  {
    id: 'fintech_systems_architect',
    name: 'Funke',
    role: 'Fintech Systems Architect',
    bodyType: 'female_1',
  },
  // 17. Femi - Balogun Textile Designer (Vibrant Ankara)
  {
    id: 'balogun_textile_designer',
    name: 'Femi',
    role: 'Balogun Textile Designer',
    bodyType: 'male_2',
  },
  // 18. Yetunde - 5G Infrastructure Engineer (Streetwear)
  {
    id: 'telecoms_rf_engineer',
    name: 'Yetunde',
    role: '5G Infrastructure Engineer',
    bodyType: 'female_2',
  },
  // 19. Seyi - Green Energy Grid Consultant (Smart Casual)
  {
    id: 'clean_energy_consultant',
    name: 'Seyi',
    role: 'Green Energy Consultant',
    bodyType: 'male_1',
  },
  // 20. Aisha - Cyber Threat Intelligence Analyst (Smart Casual)
  {
    id: 'digital_forensics_analyst',
    name: 'Aisha',
    role: 'Cyber Forensics Analyst',
    bodyType: 'female_1',
  },
  // 21. Kayode - Eko Port Logistics Agent (Smart Casual)
  {
    id: 'maritime_shipping_agent',
    name: 'Kayode',
    role: 'Eko Maritime Logistics Agent',
    bodyType: 'male_2',
  },
  // 22. Uche - Balogun Premium Ankara Wholesaler (Vibrant Ankara)
  {
    id: 'balogun_fashion_wholesaler',
    name: 'Uche',
    role: 'Balogun Ankara Wholesaler',
    bodyType: 'male_1',
  },
  // 23. Hadiza - Tinubu Cultural Heritage Curator (Vibrant Ankara)
  {
    id: 'tinubu_cultural_curator',
    name: 'Hadiza',
    role: 'Tinubu Cultural Curator',
    bodyType: 'female_2',
  },
  // 24. Segun - Solar Micro-Grid Engineer (Streetwear)
  {
    id: 'solar_infrastructure_lead',
    name: 'Segun',
    role: 'Solar Grid Engineer',
    bodyType: 'male_2',
  },
];

export interface PedestrianAgent {
  character: HumanoidCharacter | RiggedPedestrian;
  riggedCharacter: RiggedPedestrian | null;
  fallbackCharacter: HumanoidCharacter | null;
  agentGroup: THREE.Group;
  originName: string;
  destinationName: string;
  waypoints: PedestrianWaypoint[];
  currentWaypointIndex: number;
  journeyDirection: number; // +1 = forward to destination, -1 = return trip
  speed: number;
  position: THREE.Vector3;
  targetYaw: number;
  currentYaw: number;
  pauseTimer: number;
  stuckTimer: number;
  lastStuckPos: THREE.Vector3;
  archetype: PedestrianArchetype;
}

import { CharacterPalette } from './CharacterCustomizer';

const NPC_PALETTES: CharacterPalette[] = [
  // 0. Babajide Adeleke - Managing Director (Elite: Presidential Midnight Navy Suit + High-Gloss Oxfords)
  {
    style: 'ELITE_SUIT',
    skin: 0x321a0e, // Deep Midnight Ebony
    jacket: 0x0b1329, // Presidential Midnight Navy
    pants: 0x0b1329, // Matching tailored suit trousers
    shoes: 0x050505, // High-gloss polished black patent leather oxfords
    hair: 0x111111,
  },
  // 1. Ngozi Okonjo - Senior Commercial Legal Counsel (Elite: Italian Charcoal Wool Suit + Mahogany Pumps)
  {
    style: 'ELITE_SUIT',
    skin: 0x643c28, // Warm Mahogany
    jacket: 0x1a1e24, // Italian Tailored Charcoal
    pants: 0x1a1e24, // Matching charcoal trousers
    shoes: 0x451a03, // Polished dark mahogany leather
    hair: 0x1c1917,
  },
  // 2. Chidi - Executive Chairman (Elite: Executive Obsidian Black Suit + Black Monk-Straps)
  {
    style: 'ELITE_SUIT',
    skin: 0x482818, // Deep Espresso
    jacket: 0x0a0a0c, // Executive Obsidian Black
    pants: 0x0a0a0c, // Matching obsidian trousers
    shoes: 0x050505, // Black patent leather
    hair: 0x111111,
  },
  // 3. Zainab - Chief Investment Officer (Elite: Marina Corporate Emerald Suit + Chestnut Monk-Strap Heels)
  {
    style: 'ELITE_SUIT',
    skin: 0x8d5c3f, // Warm Caramel
    jacket: 0x064e3b, // Marina Corporate Emerald Suit
    pants: 0x064e3b, // Matching emerald trousers
    shoes: 0x5c2b14, // Burnished chestnut monk-straps
    hair: 0x1c1917,
  },
  // 4. Olumide - VP Digital Infrastructure (Elite: Bespoke Champagne Camel Suit + Cognac Loafers)
  {
    style: 'ELITE_SUIT',
    skin: 0x4d2d1d, // Rich Dark Chocolate
    jacket: 0xb49a78, // Bespoke Champagne Camel Suit
    pants: 0xb49a78, // Matching champagne camel trousers
    shoes: 0x451a03, // Rich cognac leather loafers
    hair: 0x09090b,
  },
  // 5. Folashade - Senior Partner Maritime Law (Elite: Silk Ivory/Cream Executive Suit + Cordovan Heels)
  {
    style: 'ELITE_SUIT',
    skin: 0x7b5036, // Radiant Bronze
    jacket: 0xf1ece1, // Silk Ivory / Cream Executive Suit
    pants: 0xf1ece1, // Matching silk ivory slacks
    shoes: 0x3b0713, // Italian cordovan burgundy leather
    hair: 0x141414,
  },
  // 6. Femi - Chief Risk Officer (Elite: Sapphire Banker Navy Suit + Cordovan Loafers)
  {
    style: 'ELITE_SUIT',
    skin: 0x523220, // Deep Warm Umber
    jacket: 0x172554, // Sapphire Banker Navy Suit
    pants: 0x172554, // Matching banker navy trousers
    shoes: 0x3b0713, // Cordovan burgundy dress loafers
    hair: 0x111111,
  },
  // 7. Ronke - Managing Partner PE (Elite: Imperial Royal Burgundy Suit + Crimson Sole Heels)
  {
    style: 'ELITE_SUIT',
    skin: 0xa87250, // Golden Honey
    jacket: 0x4c0519, // Imperial Royal Burgundy Suit
    pants: 0x4c0519, // Matching royal burgundy slacks
    shoes: 0x7f1d1d, // Designer crimson sole heels
    hair: 0x141414,
  },
  // 8. Tsharp - Tech Entrepreneur (Warm Cocoa + Royal Blue + White Runners)
  {
    style: 'SMART_CASUAL',
    skin: 0x5c3826,
    jacket: 0x0284c7, // Cedarline Royal Blue
    pants: 0x1e293b, // Dark denim indigo
    shoes: 0xffffff, // Crisp white street runners
    hair: 0x111111,
  },
  // 9. Emeka - Balogun Market Merchant (Warm Mahogany + Ankara Indigo + Cognac Loafers)
  {
    style: 'VIBRANT_ANKARA',
    skin: 0x543220,
    jacket: 0x4338ca, // Vibrant Ankara indigo
    pants: 0x312e81,
    shoes: 0x451a03, // Rich cognac dress loafers
    hair: 0x0f0f0f,
  },
  // 10. Amina - Cyber Researcher (Deep Dark Ebony + Sunset Terracotta + Modern Tech Runners)
  {
    style: 'SMART_CASUAL',
    skin: 0x3a2012,
    jacket: 0xd97706, // Warm terracotta amber
    pants: 0x18181b,
    shoes: 0xf8fafc, // Modern white tech runners
    hair: 0x18181b,
  },
  // 11. Halima - Urban Planner (Warm Pecan + Danfo Yellow + Sand Suede Loafers)
  {
    style: 'SMART_CASUAL',
    skin: 0xb17a56,
    jacket: 0xfacc15, // Danfo saffron yellow
    pants: 0x1e293b,
    shoes: 0xca8a04, // Sand suede loafers
    hair: 0x18181b,
  },
  // 12. Kunle - Creative Director (Warm Chestnut + Deep Crimson + Walnut Brogues)
  {
    style: 'SMART_CASUAL',
    skin: 0x6c442c,
    jacket: 0x991b1b, // Deep crimson
    pants: 0x334155, // Slate chinos
    shoes: 0x27150a, // Dark walnut leather brogues
    hair: 0x09090b,
  },
  // 13. Blessing - Logistics Coordinator (Rich Amber Honey + Mint Emerald + Pristine Runners)
  {
    style: 'SMART_CASUAL',
    skin: 0x9f6a4a,
    jacket: 0x10b981, // Mint emerald
    pants: 0x1e1b4b,
    shoes: 0xffffff, // Crisp white runners
    hair: 0x17120e,
  },
  // 14. Dayo - Ferry Operations Officer (Deep Dark Ebony + Ecru + Suede Navy Loafers)
  {
    style: 'SMART_CASUAL',
    skin: 0x3a2012,
    jacket: 0xf1f5f9, // Crisp ecru sailor jacket
    pants: 0x1e293b, // Navy chinos
    shoes: 0x172554, // Suede navy loafers
    hair: 0x111111,
  },
  // 15. Funke - Systems Architect (Golden Sand + Royal Violet + Violet Patent Heels)
  {
    style: 'SMART_CASUAL',
    skin: 0xb9825d,
    jacket: 0x6d28d9, // Royal violet
    pants: 0x0f172a,
    shoes: 0x581c87, // Royal violet patent heels
    hair: 0x1c1917,
  },
  // 16. Femi - Textile Designer (Warm Cocoa + Ochre Gold Ankara + Chestnut Monk-Straps)
  {
    style: 'VIBRANT_ANKARA',
    skin: 0x5c3826,
    jacket: 0xb45309, // Ochre gold Ankara
    pants: 0x5c3826, // Tobacco brown
    shoes: 0x5c2b14, // Burnished chestnut monk-straps
    hair: 0x111111,
  },
  // 17. Yetunde - 5G Engineer (Warm Mahogany + Electric Coral + Gold Accent Shoes)
  {
    style: 'STREETWEAR',
    skin: 0x543220,
    jacket: 0xf43f5e, // Electric Lagos coral
    pants: 0x334155,
    shoes: 0xd4af37, // Metallic gold accent shoes
    hair: 0x18181b,
  },
  // 18. Seyi - Green Energy Consultant (Dark Roast Cocoa + Lagos Green + Suede Desert Boots)
  {
    style: 'SMART_CASUAL',
    skin: 0x422416,
    jacket: 0x15803d, // Lagos green
    pants: 0x78716c, // Khaki chinos
    shoes: 0x92400e, // Suede desert boots
    hair: 0x0a0a0a,
  },
  // 19. Aisha - Cyber Forensics Analyst (Light Honey + Turquoise + Midnight Blue Heels)
  {
    style: 'SMART_CASUAL',
    skin: 0xc9936c,
    jacket: 0x06b6d4, // Tropical turquoise
    pants: 0x1e1b4b,
    shoes: 0x0c1e3d, // Midnight blue patent leather heels
    hair: 0x1c1917,
  },
  // 20. Kayode - Port Logistics Agent (Deep Bronze + Ruby Wine + Oxblood Derby Shoes)
  {
    style: 'SMART_CASUAL',
    skin: 0x734a32,
    jacket: 0xbe123c, // Ruby wine
    pants: 0x18181b,
    shoes: 0x581825, // Oxblood derby shoes
    hair: 0x111111,
  },
  // 21. Uche - Ankara Wholesaler (Deep Espresso + Sunset Tangerine + Tan Chelsea Boots)
  {
    style: 'VIBRANT_ANKARA',
    skin: 0x482818,
    jacket: 0xf97316, // Vibrant sunset tangerine
    pants: 0x334155,
    shoes: 0xa16207, // Tan suede Chelsea boots
    hair: 0x111111,
  },
  // 22. Hadiza - Cultural Curator (Golden Bronze + Traditional Indigo + Rose Gold Heels)
  {
    style: 'VIBRANT_ANKARA',
    skin: 0x84563a,
    jacket: 0x4338ca, // Traditional indigo
    pants: 0x1e1b4b,
    shoes: 0xb76e79, // Rose gold metallic heels
    hair: 0x18181b,
  },
  // 23. Segun - Solar Grid Engineer (Deep Midnight Ebony + Danfo Yellow + Black High-Tops)
  {
    style: 'STREETWEAR',
    skin: 0x321a0e,
    jacket: 0xfacc15, // Danfo yellow
    pants: 0x18181b,
    shoes: 0x18181b, // Obsidian black high-tops
    hair: 0x111111,
  },
];

export class PedestrianSystem {
  private group: THREE.Group;
  private agents: PedestrianAgent[] = [];
  private frameCount = 0;
  private frustum = new THREE.Frustum();
  private projScreenMatrix = new THREE.Matrix4();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PedestrianSystem';

    this.spawnPedestrians();
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public getAgents(): PedestrianAgent[] {
    return this.agents;
  }

  private spawnPedestrians(): void {
    // 24 authored, purposeful linear destination journeys across Lagos Island
    const journeys: PedestrianJourney[] = [
      // 0. North District Gateway -> Cedarline Corporate HQ
      {
        origin: 'North District Gateway',
        destination: 'Cedarline Corporate HQ',
        waypoints: [
          { x: -8.2, z: -32.0 },
          { x: -8.2, z: -18.0 },
          { x: -8.2, z: -2.0 },
          { x: -8.2, z: 12.0 },
          { x: -4.0, z: 16.5 },
          { x: 4.0, z: 16.5 },
          { x: 8.5, z: 14.0 },
          { x: 9.5, z: 6.5 },
        ],
      },
      // 1. Marina Ferry Terminal -> Balogun Electronics Market
      {
        origin: 'Marina Ferry Terminal',
        destination: 'Balogun Electronics Market',
        waypoints: [
          { x: 0.0, z: 17.2 },
          { x: 8.5, z: 17.0 },
          { x: 8.5, z: 8.0 },
          { x: 8.5, z: -2.0 },
          { x: 8.5, z: -13.5 },
          { x: 16.0, z: -13.5 },
          { x: 24.0, z: -13.5 },
        ],
      },
      // 2. Player Apartment Sidewalk -> Tinubu Square Civic Monument
      {
        origin: 'Player Apartment Sidewalk',
        destination: 'Tinubu Square Civic Monument',
        waypoints: [
          { x: -8.4, z: -14.0 },
          { x: -8.4, z: -6.0 },
          { x: -8.4, z: 2.0 },
          { x: -12.5, z: 3.5 },
          { x: -17.5, z: 3.5 },
        ],
      },
      // 3. Balogun Electronics & Cables -> Broad Street West Sidewalk
      {
        origin: 'Balogun Electronics & Cables',
        destination: 'Broad Street West Sidewalk',
        waypoints: [
          { x: 24.0, z: -13.2 },
          { x: 14.0, z: -13.2 },
          { x: 8.5, z: -13.2 },
          { x: 2.0, z: -13.5 },
          { x: -4.0, z: -13.5 },
          { x: -7.6, z: -13.5 },
          { x: -7.6, z: -24.0 },
        ],
      },
      // 4. Lagos Maritime House Promenade -> Marina East Pier & Seawall
      {
        origin: 'Lagos Maritime House Promenade',
        destination: 'Marina East Pier & Seawall',
        waypoints: [
          { x: -28.0, z: 17.5 },
          { x: -14.0, z: 17.5 },
          { x: 0.0, z: 17.5 },
          { x: 14.0, z: 17.5 },
          { x: 28.0, z: 17.5 },
        ],
      },
      // 5. Marina East Pier -> Lagos Maritime House Promenade
      {
        origin: 'Marina East Pier',
        destination: 'Lagos Maritime House Promenade',
        waypoints: [
          { x: 28.0, z: 16.5 },
          { x: 14.0, z: 16.5 },
          { x: 0.0, z: 16.5 },
          { x: -14.0, z: 16.5 },
          { x: -28.0, z: 16.5 },
        ],
      },
      // 6. Tinubu Community Noticeboard -> Marina Waterfront Pier
      {
        origin: 'Tinubu Community Noticeboard',
        destination: 'Marina Waterfront Pier',
        waypoints: [
          { x: -11.5, z: 7.2 },
          { x: -8.4, z: 7.2 },
          { x: -8.4, z: 14.0 },
          { x: -8.4, z: 17.0 },
          { x: -16.0, z: 17.2 },
        ],
      },
      // 7. Marina / Broad Street Junction -> Balogun Market Junction
      {
        origin: 'Marina / Broad Street Junction',
        destination: 'Balogun Market Junction',
        waypoints: [
          { x: 8.8, z: 17.0 },
          { x: 8.8, z: 10.0 },
          { x: 8.8, z: 2.0 },
          { x: 8.8, z: -6.0 },
          { x: 8.8, z: -12.0 },
        ],
      },
      // 8. Balogun Market Junction -> Cedarline Services Entrance
      {
        origin: 'Balogun Market Junction',
        destination: 'Cedarline Services Entrance',
        waypoints: [
          { x: 8.2, z: -10.0 },
          { x: 8.2, z: -2.0 },
          { x: 8.2, z: 4.0 },
          { x: 9.5, z: 6.5 },
        ],
      },
      // 9. North District Boundary -> Tinubu Square Civic Plaza
      {
        origin: 'North District Boundary',
        destination: 'Tinubu Square Civic Plaza',
        waypoints: [
          { x: -8.4, z: -32.0 },
          { x: -8.4, z: -20.0 },
          { x: -8.4, z: -8.0 },
          { x: -8.4, z: 2.0 },
          { x: -12.5, z: 3.5 },
          { x: -16.5, z: 3.5 },
        ],
      },
      // 10. Tinubu Plaza South -> North District Boundary
      {
        origin: 'Tinubu Plaza South',
        destination: 'North District Boundary',
        waypoints: [
          { x: -16.5, z: 8.5 },
          { x: -12.5, z: 8.5 },
          { x: -7.6, z: 6.0 },
          { x: -7.6, z: -6.0 },
          { x: -7.6, z: -18.0 },
          { x: -7.6, z: -32.0 },
        ],
      },
      // 11. Cedarline Corporate Tower -> Eko Merchant Bank Plaza
      {
        origin: 'Cedarline Corporate Tower',
        destination: 'Eko Merchant Bank Plaza',
        waypoints: [
          { x: 9.5, z: 6.5 },
          { x: 8.5, z: 14.0 },
          { x: 8.5, z: 17.0 },
          { x: 16.0, z: 17.5 },
          { x: 22.0, z: 20.0 },
        ],
      },
      // 12. Balogun Fresh Citrus & Yams Stall -> Marina Ferry Concourse
      {
        origin: 'Balogun Fresh Citrus & Yams Stall',
        destination: 'Marina Ferry Concourse',
        waypoints: [
          { x: 26.0, z: -13.5 },
          { x: 16.0, z: -13.5 },
          { x: 8.5, z: -13.5 },
          { x: 8.5, z: -2.0 },
          { x: 8.5, z: 8.0 },
          { x: 8.5, z: 16.5 },
          { x: 0.0, z: 17.0 },
        ],
      },
      // 13. Tinubu Square North Garden -> Broad Street East Sidewalk
      {
        origin: 'Tinubu Square North Garden',
        destination: 'Broad Street East Sidewalk',
        waypoints: [
          { x: -17.5, z: 2.0 },
          { x: -12.0, z: 2.0 },
          { x: -8.4, z: 2.0 },
          { x: -8.4, z: 14.0 },
          { x: -2.0, z: 16.5 },
          { x: 4.0, z: 16.5 },
          { x: 8.5, z: 14.0 },
        ],
      },
      // 14. Maritime House Forecourt -> Tinubu Square Fountain
      {
        origin: 'Maritime House Forecourt',
        destination: 'Tinubu Square Fountain',
        waypoints: [
          { x: -22.0, z: 22.0 },
          { x: -22.0, z: 17.5 },
          { x: -18.0, z: 16.5 },
          { x: -14.0, z: 12.0 },
          { x: -16.5, z: 8.5 },
        ],
      },
      // 15. Idumota Wholesale Depot -> Balogun Fabrics Emporium
      {
        origin: 'Idumota Wholesale Depot',
        destination: 'Balogun Fabrics Emporium',
        waypoints: [
          { x: 2.0, z: -32.0 },
          { x: 6.0, z: -24.0 },
          { x: 8.5, z: -18.0 },
          { x: 8.5, z: -13.5 },
          { x: 18.0, z: -13.5 },
          { x: 24.0, z: -13.5 },
        ],
      },
      // 16. Marina Central Pier -> Cedarline Canopy
      {
        origin: 'Marina Central Pier',
        destination: 'Cedarline Canopy',
        waypoints: [
          { x: 0.0, z: 17.2 },
          { x: 6.0, z: 17.2 },
          { x: 8.5, z: 14.0 },
          { x: 9.5, z: 6.5 },
        ],
      },
      // 17. Lagos Printing House Alley -> Player Apartment Sidewalk
      {
        origin: 'Lagos Printing House Alley',
        destination: 'Player Apartment Sidewalk',
        waypoints: [
          { x: -8.4, z: -30.0 },
          { x: -8.4, z: -22.0 },
          { x: -8.4, z: -14.0 },
        ],
      },
      // 18. Balogun Mobile Accessories Stall -> Tinubu Noticeboard Hub
      {
        origin: 'Balogun Mobile Accessories Stall',
        destination: 'Tinubu Noticeboard Hub',
        waypoints: [
          { x: 16.0, z: -13.2 },
          { x: 8.5, z: -13.2 },
          { x: 0.0, z: -13.5 },
          { x: -7.6, z: -13.5 },
          { x: -7.6, z: -2.0 },
          { x: -11.5, z: 6.0 },
        ],
      },
      // 19. Marina Promenade East -> Balogun Market Entry
      {
        origin: 'Marina Promenade East',
        destination: 'Balogun Market Entry',
        waypoints: [
          { x: 26.0, z: 17.2 },
          { x: 14.0, z: 17.2 },
          { x: 8.5, z: 17.0 },
          { x: 8.5, z: 6.0 },
          { x: 8.5, z: -4.0 },
          { x: 8.5, z: -12.0 },
        ],
      },
      // 20. Tinubu Square South Promenade -> Marina Seawall Lookout
      {
        origin: 'Tinubu Square South Promenade',
        destination: 'Marina Seawall Lookout',
        waypoints: [
          { x: -16.5, z: 9.0 },
          { x: -12.0, z: 9.0 },
          { x: -8.4, z: 12.0 },
          { x: -8.4, z: 16.8 },
          { x: -18.0, z: 17.2 },
        ],
      },
      // 21. Broad Street West Mid-Block -> North District Gateway
      {
        origin: 'Broad Street West Mid-Block',
        destination: 'North District Gateway',
        waypoints: [
          { x: -7.6, z: 4.0 },
          { x: -7.6, z: -8.0 },
          { x: -7.6, z: -20.0 },
          { x: -7.6, z: -32.0 },
        ],
      },
      // 22. Balogun Market North Sidewalk -> Marina Road Junction
      {
        origin: 'Balogun Market North Sidewalk',
        destination: 'Marina Road Junction',
        waypoints: [
          { x: 8.2, z: -6.0 },
          { x: 8.2, z: 2.0 },
          { x: 8.2, z: 10.0 },
          { x: 8.2, z: 16.5 },
        ],
      },
      // 23. West Marina Seawall -> Marina Ferry Terminal Pier
      {
        origin: 'West Marina Seawall',
        destination: 'Marina Ferry Terminal Pier',
        waypoints: [
          { x: -26.0, z: 17.2 },
          { x: -16.0, z: 17.2 },
          { x: -6.0, z: 17.2 },
          { x: 0.0, z: 17.2 },
        ],
      },
    ];

    journeys.forEach((journey, idx) => {
      const archetype =
        PEDESTRIAN_ARCHETYPES[idx % PEDESTRIAN_ARCHETYPES.length] ??
        PEDESTRIAN_ARCHETYPES[0]!;
      const palette = NPC_PALETTES[idx % NPC_PALETTES.length] ?? NPC_PALETTES[0]!;

      const agentGroup = new THREE.Group();
      agentGroup.name = `PedestrianAgent_${archetype.id}_${idx}`;

      // Start with procedural HumanoidCharacter as immediate fallback
      const fallbackCharacter = new HumanoidCharacter(palette);
      agentGroup.add(fallbackCharacter.getMesh());

      // Distribute starting positions along the journey so pedestrians don't all clump at start
      const startWpIndex = idx % Math.max(1, journey.waypoints.length - 1);
      const startWp = journey.waypoints[startWpIndex] ?? journey.waypoints[0]!;

      const randomScale = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
      const speedVariation = 0.92 + Math.random() * 0.16; // +/- 8%
      const baseSpeed = 1.15 + (idx % 3) * 0.15; // 1.15 to 1.45 m/s

      // Create rigged pedestrian instance with unique Nigerian skin tone & clothing palette
      const rigged = new RiggedPedestrian({
        bodyType: archetype.bodyType,
        palette,
        randomScale,
        speedVariation,
      });

      const nextWpIndex = Math.min(journey.waypoints.length - 1, startWpIndex + 1);

      const agent: PedestrianAgent = {
        character: fallbackCharacter,
        riggedCharacter: rigged,
        fallbackCharacter,
        agentGroup,
        originName: journey.origin,
        destinationName: journey.destination,
        waypoints: journey.waypoints,
        currentWaypointIndex: nextWpIndex,
        journeyDirection: 1,
        speed: baseSpeed * speedVariation,
        position: new THREE.Vector3(startWp.x, 0, startWp.z),
        targetYaw: 0,
        currentYaw: 0,
        pauseTimer: (idx % 5 === 0) ? 2.5 : 0.0,
        stuckTimer: 0,
        lastStuckPos: new THREE.Vector3(startWp.x, 0, startWp.z),
        archetype,
      };

      agentGroup.position.set(startWp.x, 0, startWp.z);
      this.agents.push(agent);
      this.group.add(agentGroup);

      // Asynchronously load rigged model and hot-swap when ready
      this.loadRiggedModel(agent, rigged);
    });
  }

  private async loadRiggedModel(agent: PedestrianAgent, rigged: RiggedPedestrian): Promise<void> {
    try {
      await rigged.load();
      // On success, replace box character with rigged model
      if (agent.fallbackCharacter) {
        agent.agentGroup.remove(agent.fallbackCharacter.getMesh());
        agent.fallbackCharacter.dispose();
        agent.fallbackCharacter = null;
      }
      agent.character = rigged;
      agent.agentGroup.add(rigged.getMesh());
      rigged.setRotation(agent.currentYaw);
    } catch (err) {
      console.warn(
        `PedestrianSystem: Failed to load rigged pedestrian model (${agent.archetype.bodyType}), falling back to procedural box character.`,
        err
      );
      agent.riggedCharacter = null;
      agent.character = agent.fallbackCharacter!;
    }
  }

  public update(deltaTime: number): void {
    this.frameCount++;

    // Retrieve active camera & player position for LOD, frustum culling, and player separation
    const worldManager =
      typeof window !== 'undefined'
        ? (
            window as unknown as {
              __CYBERLIFE_WORLD_MANAGER__?: {
                camera?: THREE.Camera;
                playerController?: { getPosition(): { x: number; y: number; z: number } };
              };
            }
          ).__CYBERLIFE_WORLD_MANAGER__
        : undefined;

    const camera = worldManager?.camera;
    const playerPos = worldManager?.playerController?.getPosition();

    let hasFrustum = false;
    if (camera && camera.projectionMatrix && camera.matrixWorldInverse) {
      this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
      hasFrustum = true;
    }

    const AVOID_RADIUS = 1.35; // Anticipatory avoidance steering threshold (meters)
    const MIN_SEPARATION = 0.78; // Hard physical non-penetration boundary (meters)
    const WAYPOINT_ARRIVE_RADIUS = 0.85; // Waypoint transition tolerance (meters)

    // Pass 1: Navigation, anti-stuck watchdog, and anticipatory steering
    this.agents.forEach((agent, i) => {
      // 1. Stuck Watchdog: detects any obstacle hangup or path blockage
      agent.stuckTimer += deltaTime;
      if (agent.stuckTimer > 2.0) {
        const distMoved = agent.position.distanceTo(agent.lastStuckPos);
        if (distMoved < 0.35 && agent.pauseTimer <= 0) {
          // Agent was hindered — advance waypoint along journey direction
          agent.currentWaypointIndex += agent.journeyDirection;
          if (agent.currentWaypointIndex >= agent.waypoints.length) {
            agent.currentWaypointIndex = Math.max(0, agent.waypoints.length - 2);
            agent.journeyDirection = -1;
          } else if (agent.currentWaypointIndex < 0) {
            agent.currentWaypointIndex = Math.min(1, agent.waypoints.length - 1);
            agent.journeyDirection = 1;
          }
          // Lateral nudge perpendicular to heading to slide off corners/seams
          const nudge = (i % 2 === 0 ? 0.35 : -0.35);
          agent.position.x += nudge;
        }
        agent.lastStuckPos.copy(agent.position);
        agent.stuckTimer = 0;
      }

      // 2. Linear Destination Waypoint Navigation
      let isMoving = false;
      if (agent.pauseTimer > 0) {
        agent.pauseTimer -= deltaTime;
      } else {
        const targetWp = agent.waypoints[agent.currentWaypointIndex];
        if (targetWp) {
          const toWpX = targetWp.x - agent.position.x;
          const toWpZ = targetWp.z - agent.position.z;
          const distToWp = Math.hypot(toWpX, toWpZ);

          if (distToWp < WAYPOINT_ARRIVE_RADIUS) {
            // Reached waypoint: check if reached the final destination of this journey
            const isAtEnd =
              (agent.journeyDirection === 1 &&
                agent.currentWaypointIndex === agent.waypoints.length - 1) ||
              (agent.journeyDirection === -1 && agent.currentWaypointIndex === 0);

            if (isAtEnd) {
              // Reached final journey destination: dwell naturally (browsing, resting, meeting)
              agent.pauseTimer = 3.5 + Math.random() * 3.0;
              // Reverse journey to return or commute onward
              agent.journeyDirection = -agent.journeyDirection;
              agent.currentWaypointIndex += agent.journeyDirection;
            } else {
              // Advance to next milestone along the journey
              agent.currentWaypointIndex += agent.journeyDirection;
              // Occasional brief pause at crosswalks and plaza views
              if (Math.random() < 0.08) {
                agent.pauseTimer = 1.5 + Math.random() * 2.0;
              }
            }
          } else {
            isMoving = true;

            // 3. Dynamic Anticipatory Collision Avoidance (Right-Hand Rule)
            let avoidX = 0;
            let avoidZ = 0;

            const fwdX = toWpX / distToWp;
            const fwdZ = toWpZ / distToWp;

            for (let j = 0; j < this.agents.length; j++) {
              if (i === j) continue;
              const other = this.agents[j]!;
              const sepDx = agent.position.x - other.position.x;
              const sepDz = agent.position.z - other.position.z;
              const sepDistSq = sepDx * sepDx + sepDz * sepDz;

              if (sepDistSq < AVOID_RADIUS * AVOID_RADIUS && sepDistSq > 0.0001) {
                const sepDist = Math.sqrt(sepDistSq);
                const push = (AVOID_RADIUS - sepDist) / AVOID_RADIUS;
                const nx = sepDx / sepDist;
                const nz = sepDz / sepDist;

                // Repulsion away from neighbor
                avoidX += nx * push * 2.6;
                avoidZ += nz * push * 2.6;

                // Bilateral Right-Hand passing rule:
                // If neighbor is approaching in front, add lateral right bias
                const dotFacing = fwdX * (-nx) + fwdZ * (-nz);
                if (dotFacing > 0.15) {
                  // Right vector of forward travel: (fwdZ, -fwdX)
                  avoidX += fwdZ * push * 2.0;
                  avoidZ += -fwdX * push * 2.0;
                }
              }
            }

            // 4. Pedestrian-to-Player Separation Avoidance
            if (playerPos) {
              const pDx = agent.position.x - playerPos.x;
              const pDz = agent.position.z - playerPos.z;
              const pDistSq = pDx * pDx + pDz * pDz;
              const PLAYER_CLEARANCE = 1.6;

              if (pDistSq < PLAYER_CLEARANCE * PLAYER_CLEARANCE && pDistSq > 0.0001) {
                const pDist = Math.sqrt(pDistSq);
                const pPush = (PLAYER_CLEARANCE - pDist) / PLAYER_CLEARANCE;
                avoidX += (pDx / pDist) * pPush * 3.8;
                avoidZ += (pDz / pDist) * pPush * 3.8;
              }
            }

            // 4b. Pedestrian-to-Vehicle Avoidance (Characters never walk into moving vehicles)
            const trafficSys = (worldManager as { worldEnvironment?: { trafficSystem?: { getVehicles?: () => Array<{ position: THREE.Vector3; speed: number }> } } })?.worldEnvironment?.trafficSystem;
            if (trafficSys && typeof trafficSys.getVehicles === 'function') {
              const activeVehicles = trafficSys.getVehicles();
              for (const veh of activeVehicles) {
                const vPos = veh.position;
                const vDx = agent.position.x - vPos.x;
                const vDz = agent.position.z - vPos.z;
                const distToVehicle = Math.hypot(vDx, vDz);

                // If a vehicle is within 4.0 meters of pedestrian
                if (distToVehicle < 4.0 && distToVehicle > 0.001) {
                  const push = (4.0 - distToVehicle) / 4.0;
                  avoidX += (vDx / distToVehicle) * push * 6.5;
                  avoidZ += (vDz / distToVehicle) * push * 6.5;

                  // If vehicle is moving and close (< 2.8m), pedestrian stops safely on sidewalk
                  if (distToVehicle < 2.8 && veh.speed > 0.8) {
                    isMoving = false;
                    agent.pauseTimer = 0.6;
                  }
                }
              }
            }

            // 5. Combine goal trajectory with avoidance steering
            const desiredMoveX = fwdX * agent.speed + avoidX;
            const desiredMoveZ = fwdZ * agent.speed + avoidZ;

            const moveSpeedActual = Math.hypot(desiredMoveX, desiredMoveZ);
            if (moveSpeedActual > 0.001) {
              const finalMoveX = (desiredMoveX / moveSpeedActual) * agent.speed * deltaTime;
              const finalMoveZ = (desiredMoveZ / moveSpeedActual) * agent.speed * deltaTime;

              agent.position.x += finalMoveX;
              agent.position.z += finalMoveZ;

              // Smooth yaw rotation toward movement vector
              agent.targetYaw = Math.atan2(desiredMoveX, desiredMoveZ);
              let diff = agent.targetYaw - agent.currentYaw;
              while (diff < -Math.PI) diff += Math.PI * 2;
              while (diff > Math.PI) diff -= Math.PI * 2;
              agent.currentYaw += diff * Math.min(1.0, 5.0 * deltaTime);
              agent.character.setRotation(agent.currentYaw);
            }
          }
        }
      }

      // 6. Frustum Culling & Distance LOD for Skeletal Animations
      let shouldUpdateAnimation = true;
      if (hasFrustum && camera) {
        const inFrustum = this.frustum.containsPoint(agent.position);
        if (!inFrustum) {
          // Off-screen: skip skeletal animation update
          shouldUpdateAnimation = false;
        } else {
          // Distance LOD
          const camDist = camera.position.distanceTo(agent.position);
          if (camDist > 26.0) {
            // Beyond 26m: update animation every 3rd frame
            shouldUpdateAnimation = (this.frameCount + i) % 3 === 0;
          } else if (camDist > 16.0) {
            // Between 16m and 26m: update animation every 2nd frame
            shouldUpdateAnimation = (this.frameCount + i) % 2 === 0;
          }
        }
      }

      // 7. Update character animation
      if (agent.riggedCharacter && agent.riggedCharacter.isReady()) {
        agent.riggedCharacter.update(deltaTime, isMoving, agent.speed, shouldUpdateAnimation);
      } else if (agent.fallbackCharacter) {
        agent.fallbackCharacter.update(deltaTime, isMoving, agent.speed / 1.3);
      }
    });

    // Pass 2: Hard physical non-penetration constraint between pedestrians (2 relaxation passes)
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < this.agents.length; i++) {
        const a = this.agents[i]!;
        for (let j = i + 1; j < this.agents.length; j++) {
          const b = this.agents[j]!;
          const dx = a.position.x - b.position.x;
          const dz = a.position.z - b.position.z;
          const dSq = dx * dx + dz * dz;

          if (dSq < MIN_SEPARATION * MIN_SEPARATION && dSq > 0.000001) {
            const d = Math.sqrt(dSq);
            const overlap = (MIN_SEPARATION - d) * 0.5;
            const nx = dx / d;
            const nz = dz / d;

            a.position.x += nx * overlap;
            a.position.z += nz * overlap;
            b.position.x -= nx * overlap;
            b.position.z -= nz * overlap;
          }
        }
      }
    }

    // Pass 3: Hard physical non-penetration constraint against player
    if (playerPos) {
      const PLAYER_HARD_RADIUS = 0.85;
      for (const agent of this.agents) {
        const pDx = agent.position.x - playerPos.x;
        const pDz = agent.position.z - playerPos.z;
        const pDistSq = pDx * pDx + pDz * pDz;
        if (pDistSq < PLAYER_HARD_RADIUS * PLAYER_HARD_RADIUS && pDistSq > 0.00001) {
          const pDist = Math.sqrt(pDistSq);
          const pushOut = PLAYER_HARD_RADIUS - pDist;
          agent.position.x += (pDx / pDist) * pushOut;
          agent.position.z += (pDz / pDist) * pushOut;
        }
      }
    }

    // Pass 4: Unconditionally synchronize visual 3D mesh position every frame
    for (const agent of this.agents) {
      agent.agentGroup.position.set(agent.position.x, 0, agent.position.z);
    }
  }

  public getPedestrianPositions(): THREE.Vector3[] {
    return this.agents.map(a => a.position);
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public dispose(): void {
    this.agents.forEach(a => {
      if (a.riggedCharacter) a.riggedCharacter.dispose();
      if (a.fallbackCharacter) a.fallbackCharacter.dispose();
      if (a.agentGroup.parent) a.agentGroup.parent.remove(a.agentGroup);
    });
    this.agents = [];
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
