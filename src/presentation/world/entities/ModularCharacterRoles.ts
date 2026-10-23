import { CharacterAppearance } from './ModularCharacter';
import { PEDESTRIAN_ROLES, generatePedestrianAppearance } from './PedestrianVariationEngine';

export interface LagosRolePreset {
  id: string;
  roleName: string;
  category?: string;
  description: string;
  signatureItem?: string;
  appearance: CharacterAppearance;
}

// ---------------------------------------------------------------------------
// 1. All 15 Named NPC Presets (Consistent with docs/characters/roster.md)
// ---------------------------------------------------------------------------

export const NAMED_NPC_PRESETS: LagosRolePreset[] = [
  // 1. Blessing (Lead Security Analyst, Cedarline)
  {
    id: 'npc_amina',
    roleName: 'Blessing (Lead Security Analyst)',
    category: 'named_npc',
    signatureItem: 'Cyan Cedarline SOC RFID Lanyard & Pressed Slacks',
    description: 'Veteran incident responder defending West African financial infrastructure.',
    appearance: {
      body: 'female',
      skinToneIndex: 4, // Warm Mahogany
      eyeColor: 0x3d2314,
      hairstyle: 'buzzed_female',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'polo',
        topColor: 0x0284c7, // Cedarline Tech Cyan / Royal Blue
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x1e293b, // Charcoal tactical slacks
        bottomPattern: 'plain',
        shoes: 'sneakers', // Polished oxfords
        shoesColor: 0x0f172a,
      },
      accessories: {
        glasses: 'wireframe',
        lanyard: true,
        lanyardBadge: 'CEDARLINE_SOC_L4',
      },
      heightScale: 1.0,
    },
  },

  // 2. Barry (Junior Infrastructure Admin)
  {
    id: 'npc_marcus',
    roleName: 'Barry (Junior Infrastructure Admin)',
    category: 'named_npc',
    signatureItem: 'Rumpled Slate Windbreaker & Server Room Keycard Reel',
    description: 'Junior admin consumed by panic over the Aster wildcard role assignment.',
    appearance: {
      body: 'male',
      skinToneIndex: 2, // Rich Dark Chocolate
      eyeColor: 0x22150c,
      hairstyle: 'buzzed',
      hairColor: 0x111111,
      hasBeard: true,
      beardColor: 0x22150c,
      hasEyebrows: true,
      clothing: {
        top: 'tshirt',
        topColor: 0x475569, // Rumpled slate utility windbreaker
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x334155, // Wrinkled grey chinos
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0x1e293b,
      },
      accessories: {
        glasses: 'wireframe',
        phone: true,
      },
      heightScale: 0.98,
    },
  },

  // 3. Mercy (Lead AI Engineer & Architect)
  {
    id: 'npc_elena',
    roleName: 'Mercy (Lead AI Architect)',
    category: 'named_npc',
    signatureItem: 'Architectural Emerald Blazer & High Sculptural Bun',
    description: 'Lead applied machine learning specialist who designed Aster autonomous loops.',
    appearance: {
      body: 'female',
      skinToneIndex: 6, // Golden Bronze
      eyeColor: 0x3d2314,
      hairstyle: 'buns',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x064e3b, // Corporate Emerald tailored blazer
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x064e3b, // Matching emerald slacks
        bottomPattern: 'plain',
        shoes: 'sandals', // Polished heels
        shoesColor: 0x050505,
      },
      accessories: {
        glasses: 'wireframe',
      },
      heightScale: 1.04,
    },
  },

  // 4. Michael (VP of Technology & Operations)
  {
    id: 'npc_femi',
    roleName: 'Michael (VP of Technology)',
    category: 'named_npc',
    signatureItem: 'Three-Piece Midnight Navy Suit & Heavy Gold Chronograph',
    description: 'Seasoned executive managing corporate risk, liability, and international M&A.',
    appearance: {
      body: 'male',
      skinToneIndex: 0, // Deep Midnight Ebony
      eyeColor: 0x1a0f0a,
      hairstyle: 'simple_parted',
      hairColor: 0x4b5563, // Salt-and-pepper silver
      hasBeard: true,
      beardColor: 0x4b5563,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x0b1329, // Presidential Midnight Navy tailored jacket
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x0b1329,
        bottomPattern: 'plain',
        shoes: 'sneakers', // Oxfords
        shoesColor: 0x050505,
      },
      accessories: {
        glasses: 'wireframe',
      },
      heightScale: 1.05,
    },
  },

  // 5. Mama Esther (Balogun Market Trade Matriarch)
  {
    id: 'npc_nkechi',
    roleName: 'Mama Esther (Market Matriarch)',
    category: 'named_npc',
    signatureItem: 'Majestic Flared Crimson/Gold Gele & Royal Ankara Wrap',
    description: 'Matriarch of the Balogun Traders Electronics Union for over 25 years.',
    appearance: {
      body: 'female',
      skinToneIndex: 3, // Deep Warm Umber
      eyeColor: 0x3d2314,
      hairstyle: 'buns',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'tshirt',
        topColor: 0x9f1239, // Rich crimson Ankara
        topPattern: 'wax_print',
        bottom: 'skirt',
        bottomColor: 0x881337,
        bottomPattern: 'wax_print',
        shoes: 'sandals',
        shoesColor: 0x451a03,
      },
      accessories: {
        headwear: 'gele',
        headwearColor: 0x9f1239,
        phone: true,
      },
      heightScale: 0.95,
    },
  },

  // 6. Uncle Segun (Community Elder & Historian)
  {
    id: 'npc_segun',
    roleName: 'Uncle Segun (Community Elder)',
    category: 'named_npc',
    signatureItem: 'Angled Royal Navy Fila Cap, Kaftan & Silver Beard',
    description: 'Retired civil servant and moral compass of Tinubu Square.',
    appearance: {
      body: 'male',
      skinToneIndex: 1, // Deep Espresso
      eyeColor: 0x22150c,
      hairstyle: 'simple_parted',
      hairColor: 0xd1d5db, // Pure silver white
      hasBeard: true,
      beardColor: 0xd1d5db,
      hasEyebrows: true,
      clothing: {
        top: 'kaftan',
        topColor: 0x1e3a5f, // Royal navy Kaftan
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x1e293b,
        bottomPattern: 'plain',
        shoes: 'sandals',
        shoesColor: 0x5c2b14,
      },
      accessories: {
        headwear: 'fila',
        headwearColor: 0x1e3a5f,
        glasses: 'wireframe',
      },
      heightScale: 0.97,
    },
  },

  // 7. Goodness (Technology Talent Liaison)
  {
    id: 'npc_folake',
    roleName: 'Goodness (Talent Partner)',
    category: 'named_npc',
    signatureItem: 'Regal Violet Tailored Blazer & Designer Shoulder Tote',
    description: 'High-energy recruiter connecting elite engineering talent with pan-African firms.',
    appearance: {
      body: 'female',
      skinToneIndex: 4, // Warm Mahogany
      eyeColor: 0x3d2314,
      hairstyle: 'long',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x7c3aed, // Regal violet tailored blazer
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x1a1e24,
        bottomPattern: 'plain',
        shoes: 'sandals',
        shoesColor: 0x050505,
      },
      accessories: {
        glasses: 'wireframe',
        phone: true,
        bag: 'crossbody',
      },
      heightScale: 1.01,
    },
  },

  // 8. Tsharp (Independent Researcher & Bounty Hunter)
  {
    id: 'npc_tunde',
    roleName: 'Tsharp (0xLagos Bounty Hunter)',
    category: 'named_npc',
    signatureItem: 'Amber-Gold Tech Hoodie & Over-Ear Neck Headphones',
    description: 'Prodigious white-hat researcher hunting enterprise zero-days along the seawall.',
    appearance: {
      body: 'male',
      skinToneIndex: 2, // Dark Chocolate
      eyeColor: 0x22150c,
      hairstyle: 'buzzed',
      hairColor: 0x111111,
      hasBeard: true,
      beardColor: 0x111111,
      hasEyebrows: true,
      clothing: {
        top: 'tshirt',
        topColor: 0xd97706, // Amber hoodie
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x18181b, // Obsidian denim
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0xffffff, // Crisp white runners
      },
      accessories: {
        glasses: 'sunglasses',
        bag: 'backpack',
        phone: true,
      },
      heightScale: 1.02,
    },
  },

  // 9. Mary (Chief Investigative Editor)
  {
    id: 'npc_kemi',
    roleName: 'Mary (Investigative Editor)',
    category: 'named_npc',
    signatureItem: 'Olive Multi-Pocket Utility Safari Jacket & Press Messenger Bag',
    description: 'Chief editor of The Lagos Inquirer demanding cryptographic proof of corporate fraud.',
    appearance: {
      body: 'female',
      skinToneIndex: 5, // Deep Bronze
      eyeColor: 0x3d2314,
      hairstyle: 'buzzed_female',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x3f6212, // Utility olive safari jacket
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0xd4b483, // Khaki chinos
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0x3e2723,
      },
      accessories: {
        glasses: 'wireframe',
        bag: 'crossbody',
      },
      heightScale: 0.99,
    },
  },

  // 10. Daniel (Chief Compliance Inspector, NDSRC)
  {
    id: 'npc_babatunde',
    roleName: 'Daniel (NDSRC Chief Inspector)',
    category: 'named_npc',
    signatureItem: 'Formal High-Mandarin Senator Tunic & Federal Document Case',
    description: 'Public-sector regulator with legal subpoena authority over enterprise logs.',
    appearance: {
      body: 'male',
      skinToneIndex: 1, // Espresso
      eyeColor: 0x22150c,
      hairstyle: 'buzzed',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0xd4b483, // Formal light-tan Senator tunic
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0xd4b483,
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0x2d1b11,
      },
      accessories: {
        glasses: 'wireframe',
        lanyard: true,
        lanyardBadge: 'NDSRC_REGULATORY',
      },
      heightScale: 1.03,
    },
  },

  // 11. Choker (Incident Response Lead, Krest IR)
  {
    id: 'npc_chidi',
    roleName: 'Choker (MD Incident Response, Krest IR)',
    category: 'named_npc',
    signatureItem: 'Monolithic Ink-Black Matte Tailored Silhouette & Absolute Stillness',
    description: 'Corporate cleanup lead hired to sanitize evidence, buy silence, and frame scapegoats.',
    appearance: {
      body: 'male',
      skinToneIndex: 0, // Midnight Ebony
      eyeColor: 0x0a0a0a,
      hairstyle: 'buzzed',
      hairColor: 0x050505,
      hasBeard: true,
      beardColor: 0x050505,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x09090b, // Bespoke ink-black matte tailored jacket
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x09090b,
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0x000000,
      },
      accessories: {
        // Zero flashy accessories; absolute restraint
      },
      heightScale: 1.06,
    },
  },

  // 12. Cipher (Autonomous Encrypted Relay)
  {
    id: 'cipher',
    roleName: 'Cipher (Encrypted Onion Relay)',
    category: 'named_npc',
    signatureItem: 'Shadowed Cowl Hood & Glowing Blue Security Token LEDs',
    description: 'Autonomous encrypted contact relaying cryptographic payloads in Onion Chat.',
    appearance: {
      body: 'male',
      skinToneIndex: 1,
      eyeColor: 0x00f0ff,
      hairstyle: 'buzzed',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x18181b, // Matte-carbon weather-sealed tech pullover
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x1e293b,
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0x09090b,
      },
      accessories: {
        glasses: 'sunglasses',
        bag: 'backpack',
        lanyard: true,
        lanyardBadge: 'CRYPTO_TOKEN',
      },
      heightScale: 1.0,
    },
  },

  // 13. Mama Bukky (Residential Canteen Vendor)
  {
    id: 'canteen_bukky',
    roleName: 'Mama Bukky (Neighborhood Canteen)',
    category: 'named_npc',
    signatureItem: 'Sunflower-Yellow Calico Headwrap & Service Apron',
    description: 'Canteen operator feeding local developers and hardware repair artisans.',
    appearance: {
      body: 'female',
      skinToneIndex: 4, // Warm Mahogany
      eyeColor: 0x3d2314,
      hairstyle: 'buns',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'tshirt',
        topColor: 0xf59e0b, // Warm yellow smock
        topPattern: 'plain',
        bottom: 'skirt',
        bottomColor: 0x1e3a8a,
        bottomPattern: 'plain',
        shoes: 'sandals',
        shoesColor: 0x451a03,
      },
      accessories: {
        headwear: 'gele',
        headwearColor: 0xeab308,
      },
      heightScale: 0.94,
    },
  },

  // 14. Protector Default Look (Male)
  {
    id: 'player_default_male',
    roleName: 'Protector (Default Male)',
    category: 'named_npc',
    signatureItem: 'Slate Technical Bomber with Orange Lining & Laptop Sling',
    description: 'Independent threat analyst and digital forensics investigator.',
    appearance: {
      body: 'male',
      skinToneIndex: 3, // Warm Umber
      eyeColor: 0x22150c,
      hairstyle: 'buzzed',
      hairColor: 0x111111,
      hasBeard: true,
      beardColor: 0x111111,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x334155, // Slate bomber jacket
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x1e3a8a, // Indigo raw denim
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0xffffff,
      },
      accessories: {
        glasses: 'wireframe',
        bag: 'crossbody',
      },
      heightScale: 1.0,
    },
  },

  // 15. Protector Default Look (Female)
  {
    id: 'player_default_female',
    roleName: 'Protector (Default Female)',
    category: 'named_npc',
    signatureItem: 'Charcoal Technical Shell with Cyan Accents & Tech Pack',
    description: 'Independent threat analyst and digital forensics investigator.',
    appearance: {
      body: 'female',
      skinToneIndex: 4, // Warm Mahogany
      eyeColor: 0x3d2314,
      hairstyle: 'long',
      hairColor: 0x111111,
      hasBeard: false,
      hasEyebrows: true,
      clothing: {
        top: 'longsleeve',
        topColor: 0x1e293b, // Fitted charcoal shell jacket
        topPattern: 'plain',
        bottom: 'trousers',
        bottomColor: 0x0f172a, // Dark stretch cargo
        bottomPattern: 'plain',
        shoes: 'sneakers',
        shoesColor: 0x38bdf8,
      },
      accessories: {
        glasses: 'wireframe',
        bag: 'backpack',
      },
      heightScale: 0.98,
    },
  },
];

// ---------------------------------------------------------------------------
// 2. Pedestrian Role Presets (22+ Roles x 4 Variants Each = 88 Archetypes)
// ---------------------------------------------------------------------------

export const PEDESTRIAN_ROLE_PRESETS: LagosRolePreset[] = [];

for (const role of PEDESTRIAN_ROLES) {
  for (let variant = 1; variant <= 4; variant++) {
    const seed = `${role.id}_variant_${variant}`;
    const generated = generatePedestrianAppearance(seed, role.id);
    PEDESTRIAN_ROLE_PRESETS.push({
      id: `${role.id}_v${variant}`,
      roleName: `${role.roleName} (Var ${variant})`,
      category: role.category,
      signatureItem: role.signatureItem,
      description: `${role.description} [Variant ${variant} / ${generated.ageGroup} / ${generated.rarity}]`,
      appearance: generated.appearance,
    });
  }
}

// ---------------------------------------------------------------------------
// 3. 40-Person Living Crowd Preset (Deterministic Seeded Generation)
// ---------------------------------------------------------------------------

export const CROWD_40_PRESETS: LagosRolePreset[] = [];

// Deterministic pool of 40 varied citizens across Lagos Island locations
const crowdSeedRoles = [
  'office_worker', 'banker', 'student_secondary', 'student_university',
  'market_trader', 'street_hawker', 'food_seller', 'pos_agent',
  'danfo_driver', 'danfo_conductor', 'okada_rider', 'keke_driver',
  'delivery_rider', 'security_guard', 'traffic_warden', 'street_sweeper',
  'mechanic_artisan', 'tech_youth', 'elder_man', 'elder_woman',
  'ankara_chic', 'senator_gentleman', 'woman_in_hijab', 'man_in_kufi',
  'worshipper_weekend', 'marina_fisherman', 'office_worker', 'banker',
  'tech_youth', 'student_university', 'market_trader', 'pos_agent',
  'okada_rider', 'delivery_rider', 'security_guard', 'ankara_chic',
  'elder_man', 'woman_in_hijab', 'traffic_warden', 'street_hawker',
];

for (let i = 0; i < crowdSeedRoles.length; i++) {
  const roleId = crowdSeedRoles[i]!;
  const seed = `lagos_crowd_40_node_${i + 1}`;
  const generated = generatePedestrianAppearance(seed, roleId);
  CROWD_40_PRESETS.push({
    id: `crowd_person_${i + 1}`,
    roleName: `Crowd #${i + 1}: ${generated.roleName}`,
    category: 'crowd_40',
    signatureItem: `Locomotion Mod: ${generated.gaitSpeedModifier}x`,
    description: `Ambient pedestrian ${i + 1}/40 [Role: ${roleId}, Age: ${generated.ageGroup}, Tone: ${generated.appearance.skinToneIndex}]`,
    appearance: generated.appearance,
  });
}

// Backward-compatibility export
export const LAGOS_MODULAR_ROLES: LagosRolePreset[] = NAMED_NPC_PRESETS;
