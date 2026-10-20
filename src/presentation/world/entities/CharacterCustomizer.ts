import * as THREE from 'three';

export interface CharacterPalette {
  skin: number;
  jacket?: number; // shirt / top
  jacketTrim?: number;
  pants?: number;
  shoes?: number;
  hair?: number;
  accent?: number;
}

/**
 * Authentic Nigerian skin tone spectrum:
 * Reflects the natural diversity of melanin rich in West Africa / Nigeria,
 * ranging from deep rich ebony and dark chocolate to warm mahogany, golden bronze, and light honey caramel.
 */
export const NIGERIAN_SKIN_TONES = [
  // Deep Rich Melanin
  0x3a2012, // Deep Dark Ebony
  0x442616, // Dark Espresso
  0x4a2a1a, // Deep Umber
  0x4d2d1d, // Rich Dark Chocolate

  // Warm Cocoa & Mahogany
  0x543220, // Warm Mahogany
  0x5c3826, // Warm Cocoa
  0x663c28, // Warm Chestnut
  0x6e4732, // Deep Bronze

  // Golden Bronze & Caramel
  0x7a4d33, // Golden Bronze
  0x88563a, // Warm Caramel
  0x9c6140, // Rich Amber Honey

  // Light Melanin & Warm Honey
  0xaa704c, // Warm Pecan
  0xb87d58, // Golden Sand
  0xc48b66, // Light Honey Caramel
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
] as const;

export const LAGOS_PANTS_PALETTES = [
  0x1e293b, // Dark Denim Indigo
  0x0f172a, // Obsidian Black
  0x18181b, // Charcoal Black
  0x334155, // Slate Grey
  0x475569, // Light Slate
  0x78716c, // Khaki Chino
  0xa8a29e, // Sand Beige
  0x3f3f46, // Deep Olive Grey
  0x1e1b4b, // Deep Midnight Navy
] as const;

export const LAGOS_SHOES_PALETTES = [
  0xf8fafc, // White Sneakers
  0x451a03, // Dark Leather Oxfords
  0x78350f, // Tan Brown Loafers
  0x09090b, // Black Dress Shoes / Heels
  0x18181b, // Black Boots
  0x92400e, // Suede Desert Boots
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
 * Applies a custom Nigerian skin tone, shirt color, pants color, and footwear
 * to a rigged character model instance without affecting other instances.
 */
export function applyCharacterCustomization(
  modelRoot: THREE.Object3D,
  palette: CharacterPalette
): void {
  const shirtColor = palette.jacket ?? 0x0284c7;
  const pantsColor = palette.pants ?? 0x1e293b;
  const shoesColor = palette.shoes ?? 0xffffff;
  const skinColor = palette.skin;
  const hairColor = palette.hair ?? 0x111111;

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
          shirtMat.roughness = 0.88;
          shirtMat.metalness = 0.0;

          const pantsMat = base.clone();
          pantsMat.color.setHex(pantsColor);
          pantsMat.roughness = 0.90;
          pantsMat.metalness = 0.0;

          const shoesMat = base.clone();
          shoesMat.color.setHex(shoesColor);
          shoesMat.roughness = 0.75;
          shoesMat.metalness = 0.0;

          child.material = [skinMat, shirtMat, pantsMat, shoesMat];
        }
        return;
      }

      // 2. Models with discrete sub-meshes (player_male, player_female, ped_female_2)
      const meshName = (child.name || '').toLowerCase();
      const currentMat = Array.isArray(child.material) ? child.material[0] : child.material;
      if (!(currentMat instanceof THREE.MeshStandardMaterial)) return;

      const mat = currentMat.clone();

      if (meshName.includes('body')) {
        // Skin tone
        mat.color.setHex(skinColor);
        mat.roughness = 0.65;
        mat.metalness = 0.05;
      } else if (meshName.includes('shirt') || meshName.includes('cloth')) {
        // Shirt / blouse / top
        mat.color.setHex(shirtColor);
        mat.roughness = 0.88;
        mat.metalness = 0.0;
      } else if (meshName.includes('pants')) {
        // Trousers / jeans
        mat.color.setHex(pantsColor);
        mat.roughness = 0.90;
        mat.metalness = 0.0;
      } else if (
        meshName.includes('sneaker') ||
        meshName.includes('heel') ||
        meshName.includes('sock')
      ) {
        // Footwear
        mat.color.setHex(shoesColor);
        mat.roughness = 0.75;
        mat.metalness = 0.0;
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
