import * as THREE from 'three';

export type CharacterOutfitStyle =
  | 'ELITE_SUIT'
  | 'SMART_CASUAL'
  | 'VIBRANT_ANKARA'
  | 'STREETWEAR'
  | 'CYBER_PROTAGONIST';

export interface CharacterPalette {
  name?: string;
  skin: number;
  jacket?: number; // shirt / blazer / top
  jacketTrim?: number;
  pants?: number; // trousers / slacks / jeans
  shoes?: number; // dress shoes / sneakers / heels / boots
  hair?: number;
  accent?: number;
  style?: CharacterOutfitStyle;
  isExpat?: boolean;
}

/**
 * European and international expat fair skin tones:
 * Preserves diversity without flat-darkening all characters to black.
 */
export const EXPAT_FAIR_SKIN_TONES = [
  0xf5d0b5, // Fair peach / light ivory
  0xedd0be, // Light European / expat complexion
  0xdfbe9f, // Sun-warmed fair
] as const;

/**
 * Bespoke protagonist appearance for the player character:
 * Sleek obsidian cyber-tactical jacket with neon cyan piping, fitted charcoal tactical slacks,
 * and custom cyber-cyan high-top tech runners with white soles.
 */
export const PLAYER_PROTAGONIST_PALETTE: CharacterPalette = {
  name: 'Cyberlife Operative Protagonist',
  skin: 0x643c28, // Warm Mahogany medium-brown skin tone
  jacket: 0x0f172a, // High-tech Obsidian Cyber Operative Jacket
  jacketTrim: 0x00f0ff, // Cyber Cyan edge piping
  pants: 0x1e293b, // Fitted Charcoal Tactical Slacks
  shoes: 0x06b6d4, // Cyber Cyan Tech Runners with White Soles
  hair: 0x111111, // Short dark hair
  accent: 0x00f0ff, // Cyber Cyan biometric comm-link
  style: 'CYBER_PROTAGONIST',
};

/**
 * Authentic Nigerian skin tone spectrum:
 * Reflects the natural diversity of melanin rich in West Africa / Nigeria,
 * ranging from deep rich ebony and dark chocolate to warm mahogany, golden bronze, and light honey caramel.
 */
export const NIGERIAN_SKIN_TONES = [
  // Deep Rich Melanin
  0x321a0e, // Deep Midnight Ebony
  0x3a2012, // Deep Dark Ebony
  0x422416, // Dark Roast Cocoa
  0x482818, // Deep Espresso
  0x4d2d1d, // Rich Dark Chocolate
  0x523220, // Deep Warm Umber

  // Warm Cocoa & Mahogany
  0x583624, // Rich Cocoa
  0x5c3826, // Warm Cocoa
  0x643c28, // Warm Mahogany
  0x6c442c, // Warm Chestnut
  0x734a32, // Deep Bronze

  // Golden Bronze & Caramel
  0x7b5036, // Radiant Bronze
  0x84563a, // Golden Bronze
  0x8d5c3f, // Warm Caramel
  0x966344, // Amber Caramel
  0x9f6a4a, // Rich Amber Honey

  // Light Melanin & Warm Honey
  0xa87250, // Golden Honey
  0xb17a56, // Warm Pecan
  0xb9825d, // Golden Sand
  0xc18b64, // Light Caramel
  0xc9936c, // Light Honey
] as const;

/**
 * Elite executive business suits for corporate leaders, bankers, and high-level attorneys in Marina and Broad Street.
 */
export const ELITE_SUIT_PALETTES = [
  {
    name: 'Presidential Midnight Navy',
    fabric: 0x0b1329,
    pants: 0x0b1329,
    shoes: 0x050505, // High-gloss polished black leather oxfords
  },
  {
    name: 'Italian Tailored Charcoal',
    fabric: 0x1a1e24,
    pants: 0x1a1e24,
    shoes: 0x451a03, // Polished dark mahogany leather
  },
  {
    name: 'Executive Obsidian Black',
    fabric: 0x0a0a0c,
    pants: 0x0a0a0c,
    shoes: 0x050505, // Black patent leather
  },
  {
    name: 'Marina Corporate Emerald Suit',
    fabric: 0x064e3b,
    pants: 0x064e3b,
    shoes: 0x451a03, // Cognac leather dress shoes
  },
  {
    name: 'Imperial Royal Burgundy Suit',
    fabric: 0x4c0519,
    pants: 0x4c0519,
    shoes: 0x3b0713, // Cordovan burgundy leather
  },
  {
    name: 'Deep Executive Graphite',
    fabric: 0x23272f,
    pants: 0x23272f,
    shoes: 0x050505, // Polished black leather
  },
  {
    name: 'Bespoke Champagne Camel Suit',
    fabric: 0xb49a78,
    pants: 0xb49a78,
    shoes: 0x451a03, // Chocolate leather shoes / heels
  },
  {
    name: 'Silk Ivory / Cream Executive Suit',
    fabric: 0xf1ece1,
    pants: 0xf1ece1,
    shoes: 0x5c2b14, // Burnished chestnut monk-straps
  },
  {
    name: 'Sapphire Banker Navy Suit',
    fabric: 0x172554,
    pants: 0x172554,
    shoes: 0x3b0713, // Cordovan dress loafers
  },
] as const;

/**
 * Modern Nigerian & Lagos urban clothing palettes:
 * Vibrant Ankara prints, Lagos corporate blues, emerald greens, and street styles.
 */
export const LAGOS_SHIRT_PALETTES = [
  0x0284c7, // Cedarline Corporate Cyan / Royal Blue
  0x0369a1, // Deep Lagoon Navy
  0x065f46, // Marina Corporate Emerald
  0x15803d, // Lagos Green
  0x10b981, // Mint Emerald
  0x4338ca, // Vibrant Ankara Indigo
  0x6d28d9, // Royal Violet
  0x7c3aed, // Regal Purple
  0xd97706, // Warm Terracotta / Amber
  0xb45309, // Ochre Gold
  0xfacc15, // Danfo Yellow
  0xf59e0b, // Saffron Gold
  0x991b1b, // Deep Crimson
  0xbe123c, // Ruby Wine
  0xe11d48, // Coral Rose
  0x0f766e, // Deep Ocean Teal
  0xf8fafc, // Crisp White
  0xf1f5f9, // Light Ecru
  0x334155, // Slate Charcoal
  0x1e293b, // Obsidian Slate
  0xf43f5e, // Electric Lagos Coral
  0xf97316, // Vibrant Sunset Tangerine
  0x06b6d4, // Tropical Turquoise
  0x166534, // Forest Green
  0xa855f7, // Lavender Violet
  0xc2410c, // Terracotta Rust
  0xfef3c7, // Warm Champagne Cream
  0x38bdf8, // Sky Cyan
  0xe11d48, // Hot Coral
  0x84cc16, // Lime Leaf
  0xec4899, // Fuchsia Blossom
  0x14b8a6, // Bright Aquamarine
  0xeab308, // Marigold Gold
  0x78716c, // Warm Pebble
] as const;

/**
 * Diverse trousers, slacks, chinos, and jeans.
 */
export const LAGOS_PANTS_PALETTES = [
  0x1e293b, // Dark Denim Indigo
  0x0b1329, // Executive Midnight Navy
  0x1a1e24, // Charcoal Wool Slacks
  0x0a0a0c, // Obsidian Black Trousers
  0x334155, // Slate Grey Chinos
  0x475569, // Light Slate Chinos
  0x78716c, // Khaki Chinos
  0xa8a29e, // Sand Beige Slacks
  0x365314, // Deep Olive Chinos
  0x57534e, // Stone Grey Trousers
  0x1e1b4b, // Deep Midnight Navy Jeans
  0x5c3826, // Tobacco Brown Trousers
  0xf1f5f9, // Crisp Off-White Chinos
  0xfef3c7, // Cream Wool Slacks
  0x4c0519, // Deep Burgundy Trousers
  0x064e3b, // Forest Emerald Trousers
  0x292524, // Warm Charcoal Slacks
  0x44403c, // Dark Taupe Trousers
] as const;

/**
 * Extended footwear: High-gloss dress shoes, polished heels, monk-straps, sneakers, and boots.
 */
export const LAGOS_SHOES_PALETTES = [
  0x050505, // High-Gloss Polished Black Patent Leather (Oxfords / Heels)
  0x3b0713, // Italian Cordovan Burgundy Leather
  0x451a03, // Rich Mahogany / Cognac Dress Loafers
  0x5c2b14, // Burnished Chestnut Monk-Straps
  0xa16207, // Tan Suede Chelsea Boots
  0x27150a, // Dark Walnut Leather Shoes / Brogues
  0xffffff, // Pristine Crisp White Street Sneakers
  0xf8fafc, // Modern White Tech Runners
  0x18181b, // Obsidian Black High-Top Sneakers
  0x7f1d1d, // Designer Crimson Sole Heels
  0xd4af37, // Metallic Gold Accent Heels
  0x581c87, // Royal Violet Patent Heels
  0x172554, // Suede Navy Loafers
  0xca8a04, // Sand Suede Loafers
  0x78350f, // Tan Brown Loafers
  0x92400e, // Suede Desert Boots
  0x064e3b, // Emerald Green Leather Loafers
  0x581825, // Oxblood Derby Shoes
  0x334155, // Charcoal Suede Dress Shoes
  0xf1ece1, // Off-White Cream Casual Canvas Shoes
  0x0c1e3d, // Midnight Blue Patent Leather Heels
  0xb76e79, // Rose Gold Metallic Party Heels
] as const;

/**
 * Re-indexes Ch12_1 (male pedestrian body) into 4 distinct geometry groups:
 * 0: Skin (Head, neck, hands)
 * 1: Shirt (Torso, sleeves)
 * 2: Pants (Legs, waist)
 * 3: Shoes (Footwear)
 */
export function reindexCh12Mesh(mesh: THREE.Mesh): void {
  const geo = mesh.geometry;
  if (!geo || !geo.index) return;
  if (geo.userData.__reindexedCh12) return;

  const pos = geo.attributes.position;
  const index = geo.index;
  if (!pos) return;

  const triCount = index.count / 3;

  // Build vertex to triangle adjacency
  const v2tris: number[][] = Array.from({ length: pos.count }, () => []);
  for (let t = 0; t < triCount; t++) {
    v2tris[index.getX(t * 3)]?.push(t);
    v2tris[index.getY(t * 3)]?.push(t);
    v2tris[index.getZ(t * 3)]?.push(t);
  }

  const visitedTris = new Uint8Array(triCount);
  const partTris: Record<'skin' | 'shirt' | 'pants' | 'shoes', number[]> = {
    skin: [],
    shirt: [],
    pants: [],
    shoes: [],
  };

  for (let t = 0; t < triCount; t++) {
    if (visitedTris[t]) continue;
    const comp: number[] = [];
    const queue = [t];
    visitedTris[t] = 1;

    while (queue.length > 0) {
      const cur = queue.pop()!;
      comp.push(cur);
      for (let vi = 0; vi < 3; vi++) {
        const v = index.getX(cur * 3 + vi);
        const neighbors = v2tris[v];
        if (neighbors) {
          for (let ni = 0; ni < neighbors.length; ni++) {
            const neighborTri = neighbors[ni]!;
            if (!visitedTris[neighborTri]) {
              visitedTris[neighborTri] = 1;
              queue.push(neighborTri);
            }
          }
        }
      }
    }

    let minY = Infinity;
    let maxY = -Infinity;
    for (let ci = 0; ci < comp.length; ci++) {
      const tr = comp[ci]!;
      for (let vi = 0; vi < 3; vi++) {
        const y = pos.getY(index.getX(tr * 3 + vi));
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    let part: 'skin' | 'shirt' | 'pants' | 'shoes' = 'skin';
    if (minY < -0.85 && maxY < -0.7) {
      part = 'shoes';
    } else if (minY < 0.0 && maxY <= 0.25) {
      part = 'pants';
    } else if (minY >= 0.50 && maxY <= 0.65) {
      part = 'skin'; // hands
    } else if (minY >= 0.65 && maxY >= 0.85) {
      part = 'skin'; // head / neck
    } else if (minY >= 0.10 && maxY <= 0.75) {
      part = 'shirt';
    }

    partTris[part].push(...comp);
  }

  // Build partitioned index buffer
  const newIndices = new Uint32Array(triCount * 3);
  let offset = 0;
  const groups: { start: number; count: number; materialIndex: number }[] = [];
  const order: ('skin' | 'shirt' | 'pants' | 'shoes')[] = ['skin', 'shirt', 'pants', 'shoes'];

  order.forEach((p, matIdx) => {
    const start = offset;
    const tris = partTris[p];
    for (let ti = 0; ti < tris.length; ti++) {
      const tr = tris[ti]!;
      newIndices[offset++] = index.getX(tr * 3);
      newIndices[offset++] = index.getY(tr * 3);
      newIndices[offset++] = index.getZ(tr * 3);
    }
    groups.push({ start, count: tris.length * 3, materialIndex: matIdx });
  });

  geo.setIndex(new THREE.BufferAttribute(newIndices, 1));
  geo.groups = groups;
  geo.userData.__reindexedCh12 = true;
}

/**
 * Melanin shader hook for photorealistic 3D scanned character textures:
 * Selectively identifies skin pixels by warm chrominance delta (r > g > b, delta warm),
 * and enhances melanin depth while fully preserving clothing fabrics, suit weaves,
 * ties, watches, eyes, hair, and specular highlights.
 * Fair / expat characters (isExpat = true) retain their natural photorealistic complexion.
 */
export function applyMelaninToTextureMaterial(
  mat: THREE.MeshStandardMaterial,
  melaninHex: number,
  isExpat?: boolean
): void {
  if (isExpat) {
    return;
  }

  const melaninColor = new THREE.Color(melaninHex);

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uMelaninColor = { value: melaninColor };
    shader.uniforms.uMelaninStrength = { value: 0.85 };

    shader.fragmentShader = `
      uniform vec3 uMelaninColor;
      uniform float uMelaninStrength;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      // Selective melanin enhancement for Nigerian multi-ethnic diversity:
      // Preserves clothing, hair, eyes, and micro-normals
      vec3 col = diffuseColor.rgb;
      bool isSkin = (col.r > col.g) && (col.g > col.b) && ((col.r - col.g) > 0.035) && ((col.g - col.b) > 0.015) && (col.r > 0.18);
      if (isSkin) {
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        vec3 targetMelanin = uMelaninColor * (lum * 1.35);
        diffuseColor.rgb = mix(col, targetMelanin, uMelaninStrength);
      }
      `
    );
  };
  mat.needsUpdate = true;
}

/**
 * Applies a custom Nigerian skin tone, tailored suit or casual clothing, and footwear finish
 * to a rigged character model instance without affecting other instances.
 */
export function applyCharacterCustomization(
  modelRoot: THREE.Object3D,
  palette: CharacterPalette
): void {
  const isEliteSuit = palette.style === 'ELITE_SUIT';
  const isProtagonist = palette.style === 'CYBER_PROTAGONIST';
  const shirtColor =
    palette.jacket ?? (isEliteSuit ? 0x0b1329 : isProtagonist ? 0x0f172a : 0x0284c7);
  const pantsColor =
    palette.pants ?? (isEliteSuit ? shirtColor : isProtagonist ? 0x1e293b : 0x1e293b);
  const shoesColor =
    palette.shoes ?? (isEliteSuit ? 0x050505 : isProtagonist ? 0x06b6d4 : 0xffffff);
  const skinColor = palette.skin;
  const hairColor = palette.hair ?? 0x111111;

  // Material surface properties based on style
  const clothingRoughness = isEliteSuit ? 0.62 : isProtagonist ? 0.55 : 0.88; // Tailored wool/silk suit vs tech cybercoat vs casual cotton
  const clothingMetalness = isEliteSuit ? 0.02 : isProtagonist ? 0.15 : 0.0;
  const shoesRoughness = isEliteSuit ? 0.28 : isProtagonist ? 0.45 : 0.75; // Polished high-gloss dress shoes / heels vs cyber tech runners vs sneakers
  const shoesMetalness = isEliteSuit ? 0.12 : isProtagonist ? 0.2 : 0.0;

  modelRoot.traverse(child => {
    if (child instanceof THREE.Mesh) {
      // 1. Ch12_1: Multi-material grouped male pedestrian mesh
      if (child.name === 'Ch12_1') {
        reindexCh12Mesh(child);
        const base = Array.isArray(child.material) ? child.material[0] : child.material;
        if (base instanceof THREE.MeshStandardMaterial) {
          const skinMat = base.clone();
          skinMat.color.setHex(skinColor);
          skinMat.roughness = 0.65;
          skinMat.metalness = 0.05;

          const shirtMat = base.clone();
          shirtMat.color.setHex(shirtColor);
          shirtMat.roughness = clothingRoughness;
          shirtMat.metalness = clothingMetalness;

          const pantsMat = base.clone();
          pantsMat.color.setHex(pantsColor);
          pantsMat.roughness = clothingRoughness;
          pantsMat.metalness = clothingMetalness;

          const shoesMat = base.clone();
          shoesMat.color.setHex(shoesColor);
          shoesMat.roughness = shoesRoughness;
          shoesMat.metalness = shoesMetalness;

          child.material = [skinMat, shirtMat, pantsMat, shoesMat];
        }
        return;
      }

      // 2. Photorealistic scanned characters with photographic diffuse map
      const currentMat = Array.isArray(child.material) ? child.material[0] : child.material;
      if (!(currentMat instanceof THREE.MeshStandardMaterial)) return;

      if (currentMat.map) {
        const mat = currentMat.clone();
        applyMelaninToTextureMaterial(mat, skinColor, palette.isExpat);
        child.material = mat;
        return;
      }

      // 3. Models with discrete sub-meshes (player_male, player_female, ped_female_2)
      const meshName = (child.name || '').toLowerCase();
      const mat = currentMat.clone();

      if (meshName.includes('body')) {
        // Skin tone
        mat.color.setHex(skinColor);
        mat.roughness = 0.65;
        mat.metalness = 0.05;
      } else if (meshName.includes('shirt') || meshName.includes('cloth')) {
        // Shirt / blazer / blouse
        mat.color.setHex(shirtColor);
        mat.roughness = clothingRoughness;
        mat.metalness = clothingMetalness;
      } else if (meshName.includes('pants')) {
        // Trousers / slacks / suit pants
        mat.color.setHex(pantsColor);
        mat.roughness = clothingRoughness;
        mat.metalness = clothingMetalness;
      } else if (
        meshName.includes('sneaker') ||
        meshName.includes('heel') ||
        meshName.includes('sock') ||
        meshName.includes('shoe') ||
        meshName.includes('boot')
      ) {
        // Footwear (Dress shoes / high heels / sneakers)
        mat.color.setHex(shoesColor);
        mat.roughness = shoesRoughness;
        mat.metalness = shoesMetalness;
      } else if (meshName.includes('hair') || meshName.includes('eyelash')) {
        // Hair
        mat.color.setHex(hairColor);
        mat.roughness = 0.95;
        mat.metalness = 0.0;
      }

      child.material = mat;
    }
  });
}
