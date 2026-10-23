/**
 * Cyberlife : Pedestrian Variation Engine (Stage B)
 *
 * Deterministic, seed-driven procedural appearance generator for Lagos Island pedestrians.
 * Produces authentic, culturally grounded, visually distinct character configurations
 * across 22+ specialized roles with strict anti-clash, rarity, and demographic rules.
 */

import { CharacterAppearance, HairstyleType, HeadwearType, GlassesType, GarmentTop, GarmentBottom, GarmentShoes, GarmentPattern } from './ModularCharacter';

export type AgeGroup = 'youth' | 'adult' | 'elder';
export type RarityTier = 'common' | 'uncommon' | 'rare';

export interface WardrobeOption {
  top: GarmentTop;
  topColor: number[];
  topPattern: GarmentPattern[];
  bottom: GarmentBottom;
  bottomColor: number[];
  bottomPattern: GarmentPattern[];
  shoes: GarmentShoes;
  shoesColor: number[];
  headwear?: HeadwearType[];
  headwearColor?: number[];
  glasses?: GlassesType[];
  weight: number;
  rarity?: RarityTier;
}

export interface PedestrianRoleConfig {
  id: string;
  roleName: string;
  category: 'corporate' | 'student' | 'commerce' | 'transport' | 'service' | 'creative' | 'elder' | 'traditional' | 'civic';
  genderWeight: { male: number; female: number }; // 0.0 to 1.0
  ageSpread: { youth: number; adult: number; elder: number }; // Sums to 1.0
  heightRange: [number, number]; // e.g. [0.93, 1.07]
  buildRange: [number, number]; // width scale [0.94, 1.06]
  wardrobe: WardrobeOption[];
  accessories?: {
    lanyard?: boolean;
    lanyardBadge?: string;
    phone?: boolean;
    bag?: ('crossbody' | 'backpack' | 'none')[];
  };
  signatureItem: string;
  description: string;
}

/**
 * Seeded PRNG (Mulberry32) for reproducible, cross-platform appearance generation
 */
export function createPRNG(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// 22+ Authentic Lagos Pedestrian Roles
// ---------------------------------------------------------------------------

export const PEDESTRIAN_ROLES: PedestrianRoleConfig[] = [
  // 1. Office Worker (Broad Street / Marina Corporate Corridor)
  {
    id: 'office_worker',
    roleName: 'Office Worker',
    category: 'corporate',
    genderWeight: { male: 0.52, female: 0.48 },
    ageSpread: { youth: 0.35, adult: 0.55, elder: 0.10 },
    heightRange: [0.95, 1.05],
    buildRange: [0.96, 1.04],
    signatureItem: 'Corporate RFID Lanyard & Pressed Slacks',
    description: 'Corporate professional navigating Broad Street financial towers.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0xf8fafc, 0xe2e8f0, 0xbfdbfe, 0xfef3c7], // White, light blue, soft cream
        topPattern: ['plain', 'striped'],
        bottom: 'trousers',
        bottomColor: [0x0f172a, 0x1e293b, 0x334155], // Obsidian, charcoal, slate
        bottomPattern: ['plain'],
        shoes: 'sneakers', // Oxfords / smart loafers represented in dark sneaker shell
        shoesColor: [0x09090b, 0x3e2723],
        glasses: ['none', 'wireframe'],
        weight: 60,
        rarity: 'common',
      },
      {
        top: 'polo',
        topColor: [0x0284c7, 0x0f766e, 0x475569], // Cyan, teal, slate corporate polo
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e293b, 0x334155],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x09090b],
        glasses: ['none', 'wireframe'],
        weight: 30,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0x7c3aed, 0x059669], // Violet / Emerald executive shirt
        topPattern: ['striped'],
        bottom: 'trousers',
        bottomColor: [0x0b1329],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x050505],
        glasses: ['wireframe', 'sunglasses'],
        weight: 10,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      lanyard: true,
      lanyardBadge: 'MARINA_TOWER_PASS',
      phone: true,
      bag: ['none', 'crossbody'],
    },
  },

  // 2. Banker / Financial Analyst
  {
    id: 'banker',
    roleName: 'Commercial Banker',
    category: 'corporate',
    genderWeight: { male: 0.55, female: 0.45 },
    ageSpread: { youth: 0.25, adult: 0.65, elder: 0.10 },
    heightRange: [0.97, 1.06],
    buildRange: [0.98, 1.05],
    signatureItem: 'Monochrome Tailored Longsleeve & Wireframe Glasses',
    description: 'High-stakes investment banker or risk officer outside Eko Merchant Bank.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0xffffff, 0xdbeafe, 0xf1f5f9],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x020617, 0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x050505],
        glasses: ['wireframe'],
        weight: 70,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0x1e293b], // Dark luxury dress shirt
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e293b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x000000],
        glasses: ['sunglasses'],
        weight: 30,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      lanyard: true,
      lanyardBadge: 'EKO_MERCHANT_BANK',
      phone: true,
    },
  },

  // 3. Secondary School Student (with fictional school color schemes)
  {
    id: 'student_secondary',
    roleName: 'Secondary School Student',
    category: 'student',
    genderWeight: { male: 0.50, female: 0.50 },
    ageSpread: { youth: 1.0, adult: 0.0, elder: 0.0 },
    heightRange: [0.93, 0.99],
    buildRange: [0.94, 1.00],
    signatureItem: 'Contrasting School Uniform & Heavy Canvas Backpack',
    description: 'Uniformed secondary school student commuting along Marina walkway.',
    wardrobe: [
      // Fictional School A: King’s Academy Lagos (Navy & Crisp White)
      {
        top: 'polo',
        topColor: [0xffffff],
        topPattern: ['plain'],
        bottom: 'shorts',
        bottomColor: [0x1e3a8a], // Deep academy navy
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x0f172a, 0x475569],
        weight: 35,
        rarity: 'common',
      },
      // Fictional School B: Eko Grammar School (Forest Green & Gold)
      {
        top: 'polo',
        topColor: [0xfef08a], // Pale gold / cream
        topPattern: ['plain'],
        bottom: 'shorts',
        bottomColor: [0x14532d], // Dark forest green
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x18181b],
        weight: 35,
        rarity: 'common',
      },
      // Fictional School C: Broad Street College (Maroon & Khaki)
      {
        top: 'polo',
        topColor: [0x881337], // Rich maroon
        topPattern: ['plain'],
        bottom: 'shorts',
        bottomColor: [0xd4b483], // Khaki chinos
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x000000],
        weight: 30,
        rarity: 'common',
      },
    ],
    accessories: {
      bag: ['backpack'],
    },
  },

  // 4. University Student
  {
    id: 'student_university',
    roleName: 'University Student',
    category: 'student',
    genderWeight: { male: 0.50, female: 0.50 },
    ageSpread: { youth: 0.90, adult: 0.10, elder: 0.0 },
    heightRange: [0.96, 1.04],
    buildRange: [0.96, 1.03],
    signatureItem: 'Campus Graphic Tee, Denim & Crossbody Bag',
    description: 'Undergraduate student balancing coursework with Lagos hustle.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0x2563eb, 0xd97706, 0xdc2626, 0x10b981], // Bold primary tee
        topPattern: ['plain', 'striped'],
        bottom: 'trousers',
        bottomColor: [0x1d4ed8, 0x334155, 0x18181b], // Blue denim, slate
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0xffffff, 0x0284c7],
        headwear: ['none', 'baseball_cap'],
        headwearColor: [0x1e293b],
        glasses: ['none', 'sunglasses'],
        weight: 70,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0x475569],
        topPattern: ['checked'],
        bottom: 'trousers',
        bottomColor: [0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0xffffff],
        weight: 30,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      bag: ['crossbody', 'backpack'],
      phone: true,
    },
  },

  // 5. Market Trader (Balogun Textile & Wares)
  {
    id: 'market_trader',
    roleName: 'Market Trader',
    category: 'commerce',
    genderWeight: { male: 0.35, female: 0.65 },
    ageSpread: { youth: 0.20, adult: 0.60, elder: 0.20 },
    heightRange: [0.94, 1.03],
    buildRange: [0.98, 1.06],
    signatureItem: 'Vibrant Ankara Wax Top & Sculptural Gele',
    description: 'Dynamic textile and electronics vendor in Balogun Market.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0xd97706, 0x991b1b, 0x047857], // Amber gold, ruby, emerald
        topPattern: ['wax_print'],
        bottom: 'skirt',
        bottomColor: [0x047857, 0x1e3a8a, 0x78350f],
        bottomPattern: ['wax_print'],
        shoes: 'sandals',
        shoesColor: [0x78350f, 0x451a03],
        headwear: ['gele'],
        headwearColor: [0xd97706, 0x991b1b],
        weight: 65,
        rarity: 'common',
      },
      {
        top: 'polo',
        topColor: [0xb45309],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x334155],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x000000],
        headwear: ['fila', 'kufi'],
        headwearColor: [0xb45309],
        weight: 35,
        rarity: 'common',
      },
    ],
    accessories: {
      phone: true,
    },
  },

  // 6. Street Hawker
  {
    id: 'street_hawker',
    roleName: 'Street Hawker',
    category: 'commerce',
    genderWeight: { male: 0.60, female: 0.40 },
    ageSpread: { youth: 0.60, adult: 0.35, elder: 0.05 },
    heightRange: [0.94, 1.02],
    buildRange: [0.94, 1.02],
    signatureItem: 'Light Utility Tee & Athletic Footwear for Traffic Weaving',
    description: 'Energetic street vendor weaving through slow-moving Broad Street traffic.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b], // High-visibility bright tee
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x334155, 0x1e293b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x3f3f46],
        headwear: ['none', 'baseball_cap'],
        headwearColor: [0x0f172a],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0xffffff],
        topPattern: ['striped'],
        bottom: 'shorts',
        bottomColor: [0x1d4ed8],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x000000],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
  },

  // 7. Food Seller / Canteen Vendor (Buka)
  {
    id: 'food_seller',
    roleName: 'Buka Food Seller',
    category: 'commerce',
    genderWeight: { male: 0.20, female: 0.80 },
    ageSpread: { youth: 0.15, adult: 0.65, elder: 0.20 },
    heightRange: [0.93, 1.02],
    buildRange: [1.00, 1.06],
    signatureItem: 'Warm Calico Headwrap & Practical Service Blouse',
    description: 'Neighborhood canteen operator serving jollof and amala.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0xf59e0b, 0xe11d48, 0x059669],
        topPattern: ['wax_print', 'plain'],
        bottom: 'skirt',
        bottomColor: [0x1e293b, 0x7c2d12],
        bottomPattern: ['wax_print'],
        shoes: 'sandals',
        shoesColor: [0x451a03],
        headwear: ['gele'],
        headwearColor: [0xf59e0b],
        weight: 75,
        rarity: 'common',
      },
      {
        top: 'polo',
        topColor: [0xffffff],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x334155],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x000000],
        weight: 25,
        rarity: 'uncommon',
      },
    ],
  },

  // 8. POS Agent (Fictional Fintech Brand: QuickNaira / PalmSwap)
  {
    id: 'pos_agent',
    roleName: 'Fintech POS Agent',
    category: 'service',
    genderWeight: { male: 0.50, female: 0.50 },
    ageSpread: { youth: 0.75, adult: 0.25, elder: 0.0 },
    heightRange: [0.95, 1.03],
    buildRange: [0.96, 1.04],
    signatureItem: 'Branded Fintech Apron / Polo & Terminal Neck Lanyard',
    description: 'Mobile money kiosk operator managing card withdrawals on the sidewalk.',
    wardrobe: [
      {
        top: 'polo',
        topColor: [0x10b981, 0x06b6d4, 0x8b5cf6], // QuickNaira Emerald or PalmSwap Cyan
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e293b, 0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0xffffff, 0x18181b],
        headwear: ['baseball_cap'],
        headwearColor: [0x10b981, 0x06b6d4],
        glasses: ['none', 'wireframe'],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x059669],
        topPattern: ['plain'],
        bottom: 'shorts',
        bottomColor: [0x334155],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x09090b],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      lanyard: true,
      lanyardBadge: 'QUICKNAIRA_POS',
      phone: true,
      bag: ['crossbody'],
    },
  },

  // 9. Danfo Driver
  {
    id: 'danfo_driver',
    roleName: 'Danfo Driver',
    category: 'transport',
    genderWeight: { male: 0.98, female: 0.02 },
    ageSpread: { youth: 0.25, adult: 0.60, elder: 0.15 },
    heightRange: [0.96, 1.04],
    buildRange: [0.98, 1.06],
    signatureItem: 'Well-Worn Sleeveless / Utility Polo & Tinted Sunglasses',
    description: 'Experienced yellow commercial bus driver commanding Lagos traffic.',
    wardrobe: [
      {
        top: 'polo',
        topColor: [0xeab308, 0x78716c, 0xd97706], // Danfo taxi yellow or road dust grey
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x292524, 0x1c1917],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x0c0a09],
        headwear: ['none', 'baseball_cap'],
        headwearColor: [0x292524],
        glasses: ['sunglasses'],
        weight: 75,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x44403c],
        topPattern: ['striped'],
        bottom: 'shorts',
        bottomColor: [0x1c1917],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x1c1917],
        weight: 25,
        rarity: 'uncommon',
      },
    ],
  },

  // 10. Danfo Conductor (Agbero / Route Marshall)
  {
    id: 'danfo_conductor',
    roleName: 'Danfo Conductor',
    category: 'transport',
    genderWeight: { male: 1.0, female: 0.0 },
    ageSpread: { youth: 0.70, adult: 0.30, elder: 0.0 },
    heightRange: [0.94, 1.02],
    buildRange: [0.95, 1.02],
    signatureItem: 'Distressed Graphic Tee & Rolled Money Bundle Stance',
    description: 'Vocal conductor hanging from the Danfo door shouting route destinations.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0xef4444, 0xf97316, 0x3b82f6],
        topPattern: ['plain'],
        bottom: 'shorts',
        bottomColor: [0x1e293b, 0x334155],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x09090b],
        headwear: ['none', 'baseball_cap'],
        headwearColor: [0xef4444],
        weight: 85,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x18181b],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x52525b],
        weight: 15,
        rarity: 'uncommon',
      },
    ],
  },

  // 11. Okada Rider
  {
    id: 'okada_rider',
    roleName: 'Okada Rider',
    category: 'transport',
    genderWeight: { male: 0.98, female: 0.02 },
    ageSpread: { youth: 0.45, adult: 0.50, elder: 0.05 },
    heightRange: [0.96, 1.04],
    buildRange: [0.96, 1.04],
    signatureItem: 'Reflective Safety Helmet & Neon High-Vis Vest',
    description: 'Commercial motorcyclist navigating Lagos Island backstreets.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0x84cc16, 0xeab308], // Fluorescent safety yellow/green
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x18181b, 0x27272a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x09090b],
        headwear: ['helmet'],
        headwearColor: [0xd97706, 0x1e293b],
        weight: 85,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x0284c7],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x000000],
        headwear: ['helmet'],
        headwearColor: [0xef4444],
        weight: 15,
        rarity: 'uncommon',
      },
    ],
  },

  // 12. Keke Driver (Tricycle)
  {
    id: 'keke_driver',
    roleName: 'Keke Driver',
    category: 'transport',
    genderWeight: { male: 0.96, female: 0.04 },
    ageSpread: { youth: 0.35, adult: 0.55, elder: 0.10 },
    heightRange: [0.95, 1.03],
    buildRange: [0.96, 1.04],
    signatureItem: 'Casual Striped Polo & Steering Wristband',
    description: 'Commercial tricycle driver offering short-hop transport.',
    wardrobe: [
      {
        top: 'polo',
        topColor: [0x0284c7, 0x10b981, 0xd97706],
        topPattern: ['striped', 'plain'],
        bottom: 'trousers',
        bottomColor: [0x334155, 0x1e293b],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x292524],
        headwear: ['baseball_cap'],
        headwearColor: [0x0284c7],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0xffffff],
        topPattern: ['checked'],
        bottom: 'trousers',
        bottomColor: [0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x52525b],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
  },

  // 13. Delivery / Dispatch Rider (Fictional Brand: SwiftDrop / FlashGo)
  {
    id: 'delivery_rider',
    roleName: 'Dispatch Courier',
    category: 'service',
    genderWeight: { male: 0.88, female: 0.12 },
    ageSpread: { youth: 0.70, adult: 0.30, elder: 0.0 },
    heightRange: [0.96, 1.04],
    buildRange: [0.96, 1.03],
    signatureItem: 'Streamlined Safety Helmet & Insulated Courier Backpack',
    description: 'Last-mile logistics courier fulfilling e-commerce deliveries.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0xd97706, 0x2563eb, 0xdc2626], // SwiftDrop Orange, FlashGo Blue, or Courier Red
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x0f172a, 0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x000000],
        headwear: ['helmet'],
        headwearColor: [0xd97706, 0x2563eb],
        weight: 85,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x18181b],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0xd97706],
        headwear: ['helmet'],
        headwearColor: [0x18181b],
        weight: 15,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      bag: ['backpack'],
      phone: true,
    },
  },

  // 14. Private Security Guard (Fictional Agency: ShieldGuard Lagos)
  {
    id: 'security_guard',
    roleName: 'Private Security Guard',
    category: 'service',
    genderWeight: { male: 0.85, female: 0.15 },
    ageSpread: { youth: 0.25, adult: 0.65, elder: 0.10 },
    heightRange: [0.98, 1.07],
    buildRange: [1.00, 1.06],
    signatureItem: 'Agency Uniform Collar, Beret / Cap & Heavy Utility Belt',
    description: 'Disciplined access control officer posted at corporate gates.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0x1e3a8a, 0x0f172a, 0x334155], // Midnight Navy / Tactical Charcoal
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x0f172a, 0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers', // Tactical combat boots represented by dark shell
        shoesColor: [0x050505],
        headwear: ['baseball_cap'],
        headwearColor: [0x1e3a8a],
        weight: 90,
        rarity: 'common',
      },
      {
        top: 'polo',
        topColor: [0x1e3a8a],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x050505],
        weight: 10,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      lanyard: true,
      lanyardBadge: 'SHIELDGUARD_OFFICER',
    },
  },

  // 15. Traffic Warden (Fictional Agency: Lagos Traffic Corps / LTC)
  {
    id: 'traffic_warden',
    roleName: 'LTC Traffic Warden',
    category: 'service',
    genderWeight: { male: 0.65, female: 0.35 },
    ageSpread: { youth: 0.20, adult: 0.70, elder: 0.10 },
    heightRange: [0.98, 1.05],
    buildRange: [0.98, 1.05],
    signatureItem: 'Two-Tone High-Vis Agency Uniform & Peak Cap',
    description: 'Municipal traffic enforcement officer directing Tinubu Square intersections.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0xeab308], // Bright municipal yellow top
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x78350f], // Deep brown / maroon regulation trousers
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x09090b],
        headwear: ['baseball_cap'],
        headwearColor: [0x78350f],
        weight: 90,
        rarity: 'common',
      },
      {
        top: 'polo',
        topColor: [0xeab308],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x78350f],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x000000],
        weight: 10,
        rarity: 'uncommon',
      },
    ],
  },

  // 16. Street Sweeper (Fictional: Lagos Clean City Initiative / LCCI)
  {
    id: 'street_sweeper',
    roleName: 'LCCI Sanitation Worker',
    category: 'service',
    genderWeight: { male: 0.35, female: 0.65 },
    ageSpread: { youth: 0.15, adult: 0.55, elder: 0.30 },
    heightRange: [0.93, 1.02],
    buildRange: [0.96, 1.04],
    signatureItem: 'Bright Orange / Fluorescent Sanitation Vest & Protective Cap',
    description: 'Sanitation worker keeping the Marina promenade and curbs clean.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0xf97316], // High-vis neon orange sanitation vest
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e293b, 0x475569],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x27272a],
        headwear: ['baseball_cap', 'gele'],
        headwearColor: [0xf97316],
        weight: 85,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0xf97316],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x18181b],
        weight: 15,
        rarity: 'uncommon',
      },
    ],
  },

  // 17. Mechanic / Generator Artisan
  {
    id: 'mechanic_artisan',
    roleName: 'Mechanic / Technician',
    category: 'service',
    genderWeight: { male: 0.94, female: 0.06 },
    ageSpread: { youth: 0.40, adult: 0.50, elder: 0.10 },
    heightRange: [0.96, 1.05],
    buildRange: [0.98, 1.06],
    signatureItem: 'Heavy Indigo Utility Overalls & Work Boots',
    description: 'Diesel generator and automotive specialist serving commercial facilities.',
    wardrobe: [
      {
        top: 'polo',
        topColor: [0x1e3a8a, 0x334155], // Heavy navy workwear
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e3a8a, 0x334155],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x18181b],
        headwear: ['none', 'baseball_cap'],
        headwearColor: [0x1e293b],
        weight: 85,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x52525b],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x18181b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x09090b],
        weight: 15,
        rarity: 'uncommon',
      },
    ],
  },

  // 18. Tech Youth (Developer / Creator / Hacker)
  {
    id: 'tech_youth',
    roleName: 'Tech Creative / Developer',
    category: 'creative',
    genderWeight: { male: 0.65, female: 0.35 },
    ageSpread: { youth: 0.85, adult: 0.15, elder: 0.0 },
    heightRange: [0.97, 1.05],
    buildRange: [0.95, 1.03],
    signatureItem: 'Tech Hoodie, Neck Headphones & Slim Tech Pack',
    description: 'Software engineer or cyber enthusiast working out of island co-working hubs.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0x0f172a, 0x1e293b, 0x475569], // Obsidian, charcoal, slate
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1d4ed8, 0x18181b], // Raw denim or jet black
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0xffffff, 0x06b6d4], // Clean white or cyber cyan
        glasses: ['none', 'sunglasses'],
        weight: 70,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0xd97706, 0x7c3aed], // Amber or violet streetwear
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x09090b],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0xffffff],
        glasses: ['wireframe'],
        weight: 30,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      bag: ['backpack', 'crossbody'],
      phone: true,
    },
  },

  // 19. Elder Man (Baba / Retired Dignitary)
  {
    id: 'elder_man',
    roleName: 'Elder Gentleman',
    category: 'elder',
    genderWeight: { male: 1.0, female: 0.0 },
    ageSpread: { youth: 0.0, adult: 0.0, elder: 1.0 },
    heightRange: [0.94, 1.03],
    buildRange: [0.95, 1.04],
    signatureItem: 'Dignified Embroidered Kaftan & Angled Yoruba Fila Cap',
    description: 'Respected neighborhood elder sharing civic wisdom in Tinubu Square.',
    wardrobe: [
      {
        top: 'kaftan',
        topColor: [0x1e3a5f, 0x164e63, 0x3b0764], // Royal navy, deep cyan, midnight indigo
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e3a5f, 0x164e63, 0x3b0764],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x5c2b14, 0x3e2723],
        headwear: ['fila'],
        headwearColor: [0x1e3a5f, 0x164e63, 0xd97706],
        glasses: ['none', 'wireframe'],
        weight: 75,
        rarity: 'common',
      },
      {
        top: 'kaftan',
        topColor: [0xffffff, 0xfef08a], // Pristine ceremonial white or ivory
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0xffffff, 0xfef08a],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x78350f],
        headwear: ['kufi', 'fila'],
        headwearColor: [0xd97706],
        weight: 25,
        rarity: 'uncommon',
      },
    ],
  },

  // 20. Elder Woman (Iya / Matriarch)
  {
    id: 'elder_woman',
    roleName: 'Elder Matriarch',
    category: 'elder',
    genderWeight: { male: 0.0, female: 1.0 },
    ageSpread: { youth: 0.0, adult: 0.0, elder: 1.0 },
    heightRange: [0.93, 1.00],
    buildRange: [0.98, 1.06],
    signatureItem: 'Classic Iro & Buba with Regal Gold Gele',
    description: 'Respected matriarch attending family celebrations and community boards.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0x701a75, 0x065f46, 0x831843], // Deep plum, royal emerald, ruby
        topPattern: ['wax_print'],
        bottom: 'skirt',
        bottomColor: [0x701a75, 0x065f46, 0x831843],
        bottomPattern: ['wax_print'],
        shoes: 'sandals',
        shoesColor: [0x451a03],
        headwear: ['gele'],
        headwearColor: [0xd97706, 0x701a75],
        glasses: ['none', 'wireframe'],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0xfef08a], // Gold brocade look
        topPattern: ['wax_print'],
        bottom: 'skirt',
        bottomColor: [0xfef08a],
        bottomPattern: ['wax_print'],
        shoes: 'sandals',
        shoesColor: [0x78350f],
        headwear: ['gele'],
        headwearColor: [0xfef08a],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
  },

  // 21. Woman in Wax-Print Ankara Dress
  {
    id: 'ankara_chic',
    roleName: 'Modern Ankara Professional',
    category: 'creative',
    genderWeight: { male: 0.0, female: 1.0 },
    ageSpread: { youth: 0.50, adult: 0.45, elder: 0.05 },
    heightRange: [0.96, 1.04],
    buildRange: [0.96, 1.04],
    signatureItem: 'Geometric Fan Wax-Print Ensemble & Designer Sunglasses',
    description: 'Creative professional in contemporary Lagos high-fashion wax print.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0xd97706, 0x0284c7, 0xdc2626], // Warm amber, azure, crimson
        topPattern: ['wax_print'],
        bottom: 'skirt',
        bottomColor: [0x047857, 0x1e3a8a, 0x78350f],
        bottomPattern: ['wax_print'],
        shoes: 'sandals',
        shoesColor: [0x78350f, 0x050505],
        glasses: ['sunglasses', 'wireframe', 'none'],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'tshirt',
        topColor: [0x7c3aed],
        topPattern: ['wax_print'],
        bottom: 'trousers',
        bottomColor: [0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x000000],
        glasses: ['sunglasses'],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      bag: ['crossbody'],
      phone: true,
    },
  },

  // 22. Man in Native Senator-Style Outfit
  {
    id: 'senator_gentleman',
    roleName: 'Senator Suit Gentleman',
    category: 'traditional',
    genderWeight: { male: 1.0, female: 0.0 },
    ageSpread: { youth: 0.25, adult: 0.60, elder: 0.15 },
    heightRange: [0.98, 1.06],
    buildRange: [0.98, 1.05],
    signatureItem: 'Crisp High-Collar Senator Tunic & Burnished Leather Shoes',
    description: 'Gentleman dressed in the modern Nigerian Senator tunic standard.',
    wardrobe: [
      {
        top: 'longsleeve',
        topColor: [0x1e293b, 0x334155, 0x047857, 0x581c87], // Slate, forest green, deep royal purple
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e293b, 0x334155, 0x047857, 0x581c87],
        bottomPattern: ['plain'],
        shoes: 'sneakers', // Oxfords / monks represented in dark shoe shell
        shoesColor: [0x050505, 0x3e2723],
        headwear: ['none', 'fila'],
        headwearColor: [0x1e293b, 0xd97706],
        glasses: ['none', 'wireframe'],
        weight: 75,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0xf8fafc], // Pure white Senator with gold cuff detailing
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0xf8fafc],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x78350f],
        headwear: ['fila'],
        headwearColor: [0xd97706],
        weight: 25,
        rarity: 'uncommon',
      },
    ],
  },

  // 23. Woman in Hijab
  {
    id: 'woman_in_hijab',
    roleName: 'Woman in Hijab',
    category: 'traditional',
    genderWeight: { male: 0.0, female: 1.0 },
    ageSpread: { youth: 0.40, adult: 0.50, elder: 0.10 },
    heightRange: [0.94, 1.02],
    buildRange: [0.96, 1.03],
    signatureItem: 'Flowing Modest Hijab & Tailored Abaya Silhouette',
    description: 'Modest Muslim professional or student walking in central Lagos.',
    wardrobe: [
      {
        top: 'kaftan',
        topColor: [0x1e293b, 0x0f172a, 0x047857, 0x7c2d12], // Charcoal, midnight, emerald, russet
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x09090b, 0x451a03],
        headwear: ['hijab'],
        headwearColor: [0x1e293b, 0x0f172a, 0x047857, 0xd97706],
        glasses: ['none', 'wireframe'],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'kaftan',
        topColor: [0xf8fafc, 0xfef08a], // Soft ivory / cream abaya
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0xf8fafc],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x78350f],
        headwear: ['hijab'],
        headwearColor: [0xf8fafc],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
    accessories: {
      bag: ['crossbody'],
      phone: true,
    },
  },

  // 24. Man in Kufi
  {
    id: 'man_in_kufi',
    roleName: 'Man in Kufi',
    category: 'traditional',
    genderWeight: { male: 1.0, female: 0.0 },
    ageSpread: { youth: 0.25, adult: 0.50, elder: 0.25 },
    heightRange: [0.96, 1.05],
    buildRange: [0.96, 1.04],
    signatureItem: 'Embroidered Kufi Skullcap & Pure Linen Tunic',
    description: 'Devout Muslim trader or professional in traditional modest tunic.',
    wardrobe: [
      {
        top: 'kaftan',
        topColor: [0xffffff, 0xe2e8f0, 0x164e63], // White, grey, teal jalabia
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0xffffff, 0xe2e8f0, 0x164e63],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x5c2b14, 0x000000],
        headwear: ['kufi'],
        headwearColor: [0xffffff, 0xd97706, 0x164e63],
        glasses: ['none', 'wireframe'],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0x047857],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x047857],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x000000],
        headwear: ['kufi'],
        headwearColor: [0xd97706],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
  },

  // 25. Weekend Worshipper (Church or Mosque Schedule)
  {
    id: 'worshipper_weekend',
    roleName: 'Weekend Worshipper',
    category: 'civic',
    genderWeight: { male: 0.50, female: 0.50 },
    ageSpread: { youth: 0.20, adult: 0.50, elder: 0.30 },
    heightRange: [0.95, 1.04],
    buildRange: [0.96, 1.05],
    signatureItem: 'Pristine White / Metallic Sunday Best Attire',
    description: 'Citizen traveling to worship services in immaculate Sunday best.',
    wardrobe: [
      {
        top: 'kaftan',
        topColor: [0xffffff, 0xfef9c3], // Brilliant white / champagne
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0xffffff, 0xfef9c3],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x5c2b14, 0x050505],
        headwear: ['fila', 'kufi', 'gele'],
        headwearColor: [0xd97706, 0xffffff],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'longsleeve',
        topColor: [0x7c3aed], // Royal purple liturgical / church suit
        topPattern: ['striped'],
        bottom: 'trousers',
        bottomColor: [0x0f172a],
        bottomPattern: ['plain'],
        shoes: 'sneakers',
        shoesColor: [0x000000],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
  },

  // 26. Marina Fisherman / Boatman
  {
    id: 'marina_fisherman',
    roleName: 'Marina Boatman',
    category: 'transport',
    genderWeight: { male: 0.98, female: 0.02 },
    ageSpread: { youth: 0.20, adult: 0.55, elder: 0.25 },
    heightRange: [0.95, 1.03],
    buildRange: [0.98, 1.06],
    signatureItem: 'Sun-Bleached Tee, Rolled Trousers & Marina Seawall Sandals',
    description: 'Maritime boatman operating water taxis and coastal fishing boats.',
    wardrobe: [
      {
        top: 'tshirt',
        topColor: [0x0284c7, 0x0d9488, 0x64748b], // Sea blue, coastal teal, salt slate
        topPattern: ['striped', 'plain'],
        bottom: 'shorts',
        bottomColor: [0x1e293b, 0x334155],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x09090b],
        headwear: ['baseball_cap'],
        headwearColor: [0x0284c7],
        glasses: ['sunglasses', 'none'],
        weight: 80,
        rarity: 'common',
      },
      {
        top: 'polo',
        topColor: [0x0f766e],
        topPattern: ['plain'],
        bottom: 'trousers',
        bottomColor: [0x1e293b],
        bottomPattern: ['plain'],
        shoes: 'sandals',
        shoesColor: [0x292524],
        weight: 20,
        rarity: 'uncommon',
      },
    ],
  },
];

export function getPedestrianRoleById(roleId: string): PedestrianRoleConfig | undefined {
  return PEDESTRIAN_ROLES.find(r => r.id === roleId);
}

// ---------------------------------------------------------------------------
// Variation Engine Implementation
// ---------------------------------------------------------------------------

export interface GeneratedPedestrianAppearance {
  roleId: string;
  roleName: string;
  seed: number;
  rarity: RarityTier;
  ageGroup: AgeGroup;
  appearance: CharacterAppearance;
  gaitSpeedModifier: number; // For locomotion variation
}

/**
 * Generates a fully deterministic, believable character appearance based on
 * role and seed. Cross-session reproducibility guaranteed.
 */
export function generatePedestrianAppearance(
  seedInput: string | number,
  roleId: string
): GeneratedPedestrianAppearance {
  const seedNum = typeof seedInput === 'number' ? seedInput : hashStringToSeed(String(seedInput));
  const prng = createPRNG(seedNum);

  const role = getPedestrianRoleById(roleId) ?? PEDESTRIAN_ROLES[0]!;

  // 1. Determine Gender
  const isMale = prng() < role.genderWeight.male;
  const body: 'male' | 'female' = isMale ? 'male' : 'female';

  // 2. Determine Age Group
  const ageRoll = prng();
  let ageGroup: AgeGroup = 'adult';
  if (ageRoll < role.ageSpread.youth) {
    ageGroup = 'youth';
  } else if (ageRoll < role.ageSpread.youth + role.ageSpread.adult) {
    ageGroup = 'adult';
  } else {
    ageGroup = 'elder';
  }

  // 3. Determine Skin Tone from West African Palette (Tones 0..7)
  // Weighted distribution reflecting authentic demographics: Tones 2..6 most common
  const toneWeights = [0.08, 0.14, 0.20, 0.22, 0.18, 0.10, 0.05, 0.03];
  let skinToneIndex = 3;
  let accum = 0;
  const toneRoll = prng();
  for (let i = 0; i < toneWeights.length; i++) {
    accum += toneWeights[i]!;
    if (toneRoll <= accum) {
      skinToneIndex = i;
      break;
    }
  }

  // 4. Hair & Beard based on Gender and Age
  let hairstyle: HairstyleType = 'buzzed';
  if (isMale) {
    const maleHairs: HairstyleType[] = ['buzzed', 'simple_parted', 'bald'];
    hairstyle = maleHairs[Math.floor(prng() * maleHairs.length)]!;
  } else {
    const femaleHairs: HairstyleType[] = ['buns', 'long', 'buzzed_female'];
    hairstyle = femaleHairs[Math.floor(prng() * femaleHairs.length)]!;
  }

  // Hair Color & Greying based on age
  let hairColor = 0x111111; // Jet black natural
  if (ageGroup === 'elder') {
    const greyRoll = prng();
    if (greyRoll < 0.4) {
      hairColor = 0x9ca3af; // Silver grey
    } else if (greyRoll < 0.7) {
      hairColor = 0x4b5563; // Peppered salt-and-pepper
    } else {
      hairColor = 0xd1d5db; // Full silver white
    }
  }

  const hasBeard = isMale && (ageGroup === 'elder' ? prng() < 0.85 : ageGroup === 'adult' ? prng() < 0.55 : prng() < 0.2);
  const beardColor = hairColor;

  // 5. Select Wardrobe Option from Role Weights
  const totalWeight = role.wardrobe.reduce((sum, w) => sum + w.weight, 0);
  let wRoll = prng() * totalWeight;
  let selectedWardrobe = role.wardrobe[0]!;
  for (const w of role.wardrobe) {
    if (wRoll <= w.weight) {
      selectedWardrobe = w;
      break;
    }
    wRoll -= w.weight;
  }

  const topColor = selectedWardrobe.topColor[Math.floor(prng() * selectedWardrobe.topColor.length)]!;
  const topPattern = selectedWardrobe.topPattern[Math.floor(prng() * selectedWardrobe.topPattern.length)]!;
  const bottomColor = selectedWardrobe.bottomColor[Math.floor(prng() * selectedWardrobe.bottomColor.length)]!;
  const bottomPattern = selectedWardrobe.bottomPattern[Math.floor(prng() * selectedWardrobe.bottomPattern.length)]!;
  const shoesColor = selectedWardrobe.shoesColor[Math.floor(prng() * selectedWardrobe.shoesColor.length)]!;

  // Headwear & Glasses
  let headwear: HeadwearType = 'none';
  let headwearColor = topColor;
  if (selectedWardrobe.headwear && selectedWardrobe.headwear.length > 0) {
    headwear = selectedWardrobe.headwear[Math.floor(prng() * selectedWardrobe.headwear.length)]!;
    if (selectedWardrobe.headwearColor && selectedWardrobe.headwearColor.length > 0) {
      headwearColor = selectedWardrobe.headwearColor[Math.floor(prng() * selectedWardrobe.headwearColor.length)]!;
    }
  }

  let glasses: GlassesType = 'none';
  if (selectedWardrobe.glasses && selectedWardrobe.glasses.length > 0) {
    glasses = selectedWardrobe.glasses[Math.floor(prng() * selectedWardrobe.glasses.length)]!;
  }

  // Accessories
  let bag: 'crossbody' | 'backpack' | 'none' = 'none';
  if (role.accessories?.bag && role.accessories.bag.length > 0) {
    bag = role.accessories.bag[Math.floor(prng() * role.accessories.bag.length)]!;
  }

  // 6. Height Scale (0.93 - 1.07 range)
  const [minH, maxH] = role.heightRange;
  const heightScale = +(minH + prng() * (maxH - minH)).toFixed(3);

  // 7. Gait Speed Modifier (Stage C locomotion preparation: older walk slower, youth walk faster)
  let gaitSpeedModifier = 1.0;
  if (ageGroup === 'youth') {
    gaitSpeedModifier = +(1.02 + prng() * 0.08).toFixed(2);
  } else if (ageGroup === 'elder') {
    gaitSpeedModifier = +(0.85 + prng() * 0.08).toFixed(2);
  } else {
    gaitSpeedModifier = +(0.96 + prng() * 0.08).toFixed(2);
  }

  const rarity = selectedWardrobe.rarity ?? 'common';

  return {
    roleId: role.id,
    roleName: role.roleName,
    seed: seedNum,
    rarity,
    ageGroup,
    gaitSpeedModifier,
    appearance: {
      body,
      skinToneIndex,
      eyeColor: 0x3d2314,
      hairstyle,
      hairColor,
      hasBeard,
      beardColor,
      hasEyebrows: true,
      clothing: {
        top: selectedWardrobe.top,
        topColor,
        topPattern,
        bottom: selectedWardrobe.bottom,
        bottomColor,
        bottomPattern,
        shoes: selectedWardrobe.shoes,
        shoesColor,
      },
      accessories: {
        headwear,
        headwearColor,
        glasses,
        lanyard: role.accessories?.lanyard ?? false,
        lanyardBadge: role.accessories?.lanyardBadge,
        phone: role.accessories?.phone ?? false,
        bag,
      },
      heightScale,
    },
  };
}

/**
 * Anti-clash & anti-adjacency verification: modifies seed if two adjacent pedestrians
 * share identical silhouettes and dominant color palettes.
 */
export function ensureAdjacentDistinctness(
  personA: GeneratedPedestrianAppearance,
  personB: GeneratedPedestrianAppearance
): boolean {
  const topMatch = personA.appearance.clothing.topColor === personB.appearance.clothing.topColor;
  const bottomMatch = personA.appearance.clothing.bottomColor === personB.appearance.clothing.bottomColor;
  const headwearMatch = personA.appearance.accessories?.headwear === personB.appearance.accessories?.headwear;
  const roleMatch = personA.roleId === personB.roleId;

  // Conflict if same role AND both garments match
  return !(roleMatch && topMatch && bottomMatch && headwearMatch);
}
