import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * 8 Realistic West African Skin Tones (melanin-rich to golden bronze)
 */
export interface SkinToneDefinition {
  id: string;
  name: string;
  hex: number;
  textureMale: string;
  textureFemale: string;
}

export const WEST_AFRICAN_SKIN_TONES: SkinToneDefinition[] = [
  {
    id: 'tone_1_midnight_ebony',
    name: 'Deep Midnight Ebony',
    hex: 0x301a0e,
    textureMale: '/assets/characters/textures/skin/male_tone_1_midnight_ebony.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_1_midnight_ebony.png',
  },
  {
    id: 'tone_2_espresso',
    name: 'Deep Espresso',
    hex: 0x3c2112,
    textureMale: '/assets/characters/textures/skin/male_tone_2_espresso.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_2_espresso.png',
  },
  {
    id: 'tone_3_dark_chocolate',
    name: 'Rich Dark Chocolate',
    hex: 0x4a2a17,
    textureMale: '/assets/characters/textures/skin/male_tone_3_dark_chocolate.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_3_dark_chocolate.png',
  },
  {
    id: 'tone_4_warm_umber',
    name: 'Deep Warm Umber',
    hex: 0x58331d,
    textureMale: '/assets/characters/textures/skin/male_tone_4_warm_umber.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_4_warm_umber.png',
  },
  {
    id: 'tone_5_warm_mahogany',
    name: 'Warm Mahogany',
    hex: 0x683e26,
    textureMale: '/assets/characters/textures/skin/male_tone_5_warm_mahogany.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_5_warm_mahogany.png',
  },
  {
    id: 'tone_6_deep_bronze',
    name: 'Deep Bronze',
    hex: 0x784b30,
    textureMale: '/assets/characters/textures/skin/male_tone_6_deep_bronze.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_6_deep_bronze.png',
  },
  {
    id: 'tone_7_golden_bronze',
    name: 'Golden Bronze',
    hex: 0x8a593a,
    textureMale: '/assets/characters/textures/skin/male_tone_7_golden_bronze.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_7_golden_bronze.png',
  },
  {
    id: 'tone_8_amber_caramel',
    name: 'Warm Amber Caramel',
    hex: 0x9c6846,
    textureMale: '/assets/characters/textures/skin/male_tone_8_amber_caramel.png',
    textureFemale: '/assets/characters/textures/skin/female_tone_8_amber_caramel.png',
  },
];

export type GarmentPattern = 'plain' | 'striped' | 'checked' | 'wax_print';
export type GarmentTop = 'tshirt' | 'polo' | 'longsleeve' | 'kaftan' | 'none';
export type GarmentBottom = 'trousers' | 'shorts' | 'skirt' | 'none';
export type GarmentShoes = 'sneakers' | 'sandals' | 'none';
export type HairstyleType = 'buzzed' | 'buzzed_female' | 'simple_parted' | 'buns' | 'long' | 'bald';
export type HeadwearType = 'fila' | 'kufi' | 'gele' | 'hijab' | 'baseball_cap' | 'helmet' | 'none';
export type GlassesType = 'wireframe' | 'sunglasses' | 'none';

export interface CharacterAppearance {
  body: 'male' | 'female';
  skinToneIndex: number; // 0..7
  eyeColor: number;
  hairstyle: HairstyleType;
  hairColor: number;
  hasBeard: boolean;
  beardColor?: number;
  hasEyebrows: boolean;
  clothing: {
    top: GarmentTop;
    topColor: number;
    topPattern: GarmentPattern;
    bottom: GarmentBottom;
    bottomColor: number;
    bottomPattern: GarmentPattern;
    shoes: GarmentShoes;
    shoesColor: number;
  };
  accessories?: {
    headwear?: HeadwearType;
    headwearColor?: number;
    headwearPattern?: GarmentPattern;
    glasses?: GlassesType;
    lanyard?: boolean;
    lanyardBadge?: string;
    phone?: boolean;
    bag?: 'crossbody' | 'backpack' | 'none';
  };
  heightScale?: number;
}

/**
 * Procedural texture cache to avoid re-generating canvas textures
 */
const textureCache = new Map<string, THREE.CanvasTexture>();

export function getFabricTexture(colorHex: number, pattern: GarmentPattern): THREE.CanvasTexture {
  const key = `${colorHex.toString(16)}_${pattern}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const baseCol = '#' + colorHex.toString(16).padStart(6, '0');
  ctx.fillStyle = baseCol;
  ctx.fillRect(0, 0, 256, 256);

  if (pattern === 'striped') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let x = 0; x < 256; x += 32) {
      ctx.fillRect(x, 0, 16, 256);
    }
  } else if (pattern === 'checked') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    for (let x = 0; x < 256; x += 32) {
      ctx.fillRect(x, 0, 16, 256);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < 256; y += 32) {
      ctx.fillRect(0, y, 256, 16);
    }
  } else if (pattern === 'wax_print') {
    // Original West African Ankara-inspired geometric fan and diamond tessellation
    ctx.fillStyle = 'rgba(251, 191, 36, 0.35)'; // Warm gold motif
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)'; // Obsidian contour
    ctx.lineWidth = 2.5;

    for (let y = 0; y < 256; y += 64) {
      for (let x = 0; x < 256; x += 64) {
        // Radiating diamond
        ctx.beginPath();
        ctx.moveTo(x + 32, y + 8);
        ctx.lineTo(x + 56, y + 32);
        ctx.lineTo(x + 32, y + 56);
        ctx.lineTo(x + 8, y + 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner eye / fan curves
        ctx.beginPath();
        ctx.arc(x + 32, y + 32, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // Crimson accent
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      }
    }
  } else {
    // Plain fabric micro-weave noise
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 256, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Builds a clothing shell SkinnedMesh by selecting body vertices,
 * offsetting them along normals, preserving skin weights, and closing borders.
 */
export function generateClothingShell(
  sourceSkinnedMesh: THREE.SkinnedMesh,
  garmentType: GarmentTop | GarmentBottom | GarmentShoes,
  colorHex: number,
  pattern: GarmentPattern
): THREE.SkinnedMesh | null {
  if (garmentType === 'none') return null;

  const srcGeo = sourceSkinnedMesh.geometry;
  const posAttr = srcGeo.getAttribute('position');
  const normAttr = srcGeo.getAttribute('normal');
  const uvAttr = srcGeo.getAttribute('uv');
  const jointAttr = srcGeo.getAttribute('skinIndex');
  const weightAttr = srcGeo.getAttribute('skinWeight');
  const indexAttr = srcGeo.getIndex();

  if (!posAttr || !normAttr || !indexAttr) return null;

  const normalOffset = garmentType === 'kaftan' ? 0.022 : garmentType === 'sneakers' ? 0.016 : 0.013;

  // Filter triangles based on garment criteria
  const vertexUsage = new Map<number, number>(); // srcIdx -> newIdx
  const newPositions: number[] = [];
  const newNormals: number[] = [];
  const newUVs: number[] = [];
  const newSkinIndices: number[] = [];
  const newSkinWeights: number[] = [];

  const getOrAddVertex = (srcIdx: number): number => {
    if (vertexUsage.has(srcIdx)) return vertexUsage.get(srcIdx)!;

    const newIdx = vertexUsage.size;
    vertexUsage.set(srcIdx, newIdx);

    const px = posAttr.getX(srcIdx);
    const py = posAttr.getY(srcIdx);
    const pz = posAttr.getZ(srcIdx);

    const nx = normAttr.getX(srcIdx);
    const ny = normAttr.getY(srcIdx);
    const nz = normAttr.getZ(srcIdx);

    newPositions.push(px + nx * normalOffset, py + ny * normalOffset, pz + nz * normalOffset);
    newNormals.push(nx, ny, nz);

    if (uvAttr) {
      newUVs.push(uvAttr.getX(srcIdx), uvAttr.getY(srcIdx));
    } else {
      newUVs.push(0, 0);
    }

    if (jointAttr) {
      newSkinIndices.push(
        jointAttr.getX(srcIdx),
        jointAttr.getY(srcIdx),
        jointAttr.getZ(srcIdx),
        jointAttr.getW(srcIdx)
      );
    }
    if (weightAttr) {
      newSkinWeights.push(
        weightAttr.getX(srcIdx),
        weightAttr.getY(srcIdx),
        weightAttr.getZ(srcIdx),
        weightAttr.getW(srcIdx)
      );
    }

    return newIdx;
  };

  const isTriangleSelected = (i0: number, i1: number, i2: number): boolean => {
    const y0 = posAttr.getY(i0), y1 = posAttr.getY(i1), y2 = posAttr.getY(i2);
    const yAvg = (y0 + y1 + y2) / 3;
    const xAvg = (Math.abs(posAttr.getX(i0)) + Math.abs(posAttr.getX(i1)) + Math.abs(posAttr.getX(i2))) / 3;

    switch (garmentType) {
      case 'tshirt':
        // Torso and short sleeves down to mid-bicep
        return yAvg >= 0.94 && yAvg <= 1.51 && xAvg <= 0.38;

      case 'polo':
        // Torso, short sleeves, and collar ring
        return yAvg >= 0.94 && yAvg <= 1.54 && xAvg <= 0.38;

      case 'longsleeve':
        // Torso and full sleeves down to wrist
        return yAvg >= 0.94 && yAvg <= 1.51 && (xAvg <= 0.38 || yAvg >= 1.05);

      case 'kaftan':
        // Long tunic shape down past knees
        return yAvg >= 0.36 && yAvg <= 1.52 && (xAvg <= 0.38 || yAvg >= 1.05);

      case 'trousers':
        // Waist down to ankles
        return yAvg >= 0.12 && yAvg <= 0.97 && xAvg >= 0.04;

      case 'shorts':
        // Waist down to just above knees
        return yAvg >= 0.55 && yAvg <= 0.97 && xAvg >= 0.04;

      case 'skirt':
        // Waist down past knees with slight flare
        return yAvg >= 0.46 && yAvg <= 0.97;

      case 'sneakers':
        // Foot region
        return yAvg <= 0.12;

      case 'sandals':
        // Low foot sole and strap region
        return yAvg <= 0.08;

      default:
        return false;
    }
  };

  const edgeCount = new Map<string, [number, number]>(); // "i0_i1" -> [i0, i1]
  const recordEdge = (a: number, b: number) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (edgeCount.has(key)) {
      edgeCount.delete(key); // Shared between 2 triangles -> internal edge
    } else {
      edgeCount.set(key, [a, b]); // First time -> boundary candidate
    }
  };

  const newIndices: number[] = [];
  for (let i = 0; i < indexAttr.count; i += 3) {
    const i0 = indexAttr.getX(i);
    const i1 = indexAttr.getX(i + 1);
    const i2 = indexAttr.getX(i + 2);

    if (isTriangleSelected(i0, i1, i2)) {
      const v0 = getOrAddVertex(i0);
      const v1 = getOrAddVertex(i1);
      const v2 = getOrAddVertex(i2);
      newIndices.push(v0, v1, v2);

      recordEdge(i0, i1);
      recordEdge(i1, i2);
      recordEdge(i2, i0);
    }
  }

  if (newIndices.length === 0) return null;

  // Add hem closure along boundary edges to prevent single-sided paper look
  // For each boundary edge, create an inner lip vertex
  for (const [srcA, srcB] of edgeCount.values()) {
    const vOuterA = vertexUsage.get(srcA)!;
    const vOuterB = vertexUsage.get(srcB)!;

    // Create inner lip vertex (halfway between body and shell)
    const addLipVertex = (srcIdx: number): number => {
      const newIdx = newPositions.length / 3;
      const px = posAttr.getX(srcIdx);
      const py = posAttr.getY(srcIdx);
      const pz = posAttr.getZ(srcIdx);
      const nx = normAttr.getX(srcIdx);
      const ny = normAttr.getY(srcIdx);
      const nz = normAttr.getZ(srcIdx);

      newPositions.push(px + nx * 0.003, py + ny * 0.003, pz + nz * 0.003);
      newNormals.push(-nx, -ny, -nz);
      newUVs.push(uvAttr ? uvAttr.getX(srcIdx) : 0, uvAttr ? uvAttr.getY(srcIdx) : 0);

      if (jointAttr) {
        newSkinIndices.push(
          jointAttr.getX(srcIdx),
          jointAttr.getY(srcIdx),
          jointAttr.getZ(srcIdx),
          jointAttr.getW(srcIdx)
        );
      }
      if (weightAttr) {
        newSkinWeights.push(
          weightAttr.getX(srcIdx),
          weightAttr.getY(srcIdx),
          weightAttr.getZ(srcIdx),
          weightAttr.getW(srcIdx)
        );
      }
      return newIdx;
    };

    const vInnerA = addLipVertex(srcA);
    const vInnerB = addLipVertex(srcB);

    // Quad closing the border
    newIndices.push(vOuterA, vOuterB, vInnerB);
    newIndices.push(vOuterA, vInnerB, vInnerA);
  }

  const garmentGeo = new THREE.BufferGeometry();
  garmentGeo.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  garmentGeo.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
  garmentGeo.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));
  if (newSkinIndices.length > 0) {
    garmentGeo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(newSkinIndices, 4));
    garmentGeo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(newSkinWeights, 4));
  }
  garmentGeo.setIndex(newIndices);

  const fabricTex = getFabricTexture(colorHex, pattern);
  const garmentMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: fabricTex,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const shellMesh = new THREE.SkinnedMesh(garmentGeo, garmentMat);
  shellMesh.name = `Garment_${garmentType}`;
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;

  // Bind to skeleton
  shellMesh.bind(sourceSkinnedMesh.skeleton, sourceSkinnedMesh.bindMatrix);

  return shellMesh;
}

/**
 * Procedural headwear and accessory builder skinned/parented to Head bone
 */
export function buildProceduralAccessory(
  type: HeadwearType | GlassesType,
  colorHex = 0x0f172a
): THREE.Object3D | null {
  if (type === 'none') return null;

  const group = new THREE.Group();
  group.name = `Accessory_${type}`;

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.75,
    metalness: 0.1,
  });

  switch (type) {
    case 'fila': {
      // Traditional Yoruba Fila / Aso Oke cap (slanted crown)
      const capGeo = new THREE.CylinderGeometry(0.118, 0.126, 0.11, 24);
      capGeo.scale(0.96, 1.0, 1.12);
      const capMesh = new THREE.Mesh(capGeo, mat);
      capMesh.position.set(0.015, 0.12, -0.01);
      capMesh.rotation.z = -0.15; // Signature sideways fold
      group.add(capMesh);

      // Folded tip
      const tipGeo = new THREE.BoxGeometry(0.08, 0.04, 0.14);
      const tipMesh = new THREE.Mesh(tipGeo, mat);
      tipMesh.position.set(-0.065, 0.15, -0.01);
      tipMesh.rotation.z = -0.35;
      group.add(tipMesh);
      break;
    }

    case 'kufi': {
      // Rounded West African skullcap
      const kufiGeo = new THREE.SphereGeometry(0.128, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
      kufiGeo.scale(0.97, 0.85, 1.08);
      const kufiMesh = new THREE.Mesh(kufiGeo, mat);
      kufiMesh.position.set(0, 0.08, -0.005);
      group.add(kufiMesh);

      // Embroidered base brim
      const brimGeo = new THREE.TorusGeometry(0.122, 0.012, 12, 28);
      brimGeo.scale(0.96, 1.08, 1.0);
      const brimMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Gold embroidery
        roughness: 0.6,
      });
      const brimMesh = new THREE.Mesh(brimGeo, brimMat);
      brimMesh.rotation.x = Math.PI / 2;
      brimMesh.position.set(0, 0.075, -0.005);
      group.add(brimMesh);
      break;
    }

    case 'gele': {
      // Sculptural layered female headwrap with fan pleats
      const baseGeo = new THREE.CylinderGeometry(0.132, 0.128, 0.10, 24);
      baseGeo.scale(0.98, 1.0, 1.1);
      const baseMesh = new THREE.Mesh(baseGeo, mat);
      baseMesh.position.set(0, 0.10, 0);
      group.add(baseMesh);

      // High sculptural fan crowns
      for (let i = 0; i < 3; i++) {
        const fanGeo = new THREE.BoxGeometry(0.24 + i * 0.04, 0.03, 0.18 + i * 0.03);
        const fanMesh = new THREE.Mesh(fanGeo, mat);
        fanMesh.position.set(0, 0.15 + i * 0.035, -0.01);
        fanMesh.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.18;
        fanMesh.rotation.y = i * 0.2;
        group.add(fanMesh);
      }
      break;
    }

    case 'hijab': {
      // Flowing head and neck drape
      const hoodGeo = new THREE.SphereGeometry(0.134, 20, 16);
      hoodGeo.scale(0.98, 1.15, 1.12);
      const hoodMesh = new THREE.Mesh(hoodGeo, mat);
      hoodMesh.position.set(0, 0.06, -0.02);
      group.add(hoodMesh);

      // Neck cowl
      const cowlGeo = new THREE.CylinderGeometry(0.135, 0.22, 0.22, 20);
      const cowlMesh = new THREE.Mesh(cowlGeo, mat);
      cowlMesh.position.set(0, -0.08, -0.01);
      group.add(cowlMesh);
      break;
    }

    case 'baseball_cap': {
      // Modern streetwear cap
      const domeGeo = new THREE.SphereGeometry(0.126, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      domeGeo.scale(0.97, 0.9, 1.08);
      const domeMesh = new THREE.Mesh(domeGeo, mat);
      domeMesh.position.set(0, 0.075, -0.01);
      group.add(domeMesh);

      // Visor / bill
      const visorGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.01, 16, 1, false, 0, Math.PI * 0.6);
      const visorMesh = new THREE.Mesh(visorGeo, mat);
      visorMesh.position.set(0, 0.07, 0.07);
      visorMesh.rotation.x = 0.25;
      visorMesh.rotation.y = -Math.PI * 0.3;
      group.add(visorMesh);
      break;
    }

    case 'helmet': {
      // Okada / dispatch rider safety helmet
      const shellGeo = new THREE.SphereGeometry(0.142, 24, 20);
      shellGeo.scale(0.98, 1.05, 1.12);
      const helmetMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.2,
        metalness: 0.4,
      });
      const shellMesh = new THREE.Mesh(shellGeo, helmetMat);
      shellMesh.position.set(0, 0.07, -0.01);
      group.add(shellMesh);

      // Dark tinted visor
      const visorGeo = new THREE.SphereGeometry(0.143, 20, 16, 0, Math.PI, Math.PI * 0.25, Math.PI * 0.4);
      visorGeo.scale(0.99, 1.04, 1.13);
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.1,
        metalness: 0.9,
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0.065, -0.01);
      group.add(visorMesh);
      break;
    }

    case 'wireframe': {
      // Acetate / wireframe reading glasses
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.8,
      });
      const leftRim = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.003, 8, 20), frameMat);
      leftRim.position.set(0.038, 0.05, 0.115);
      const rightRim = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.003, 8, 20), frameMat);
      rightRim.position.set(-0.038, 0.05, 0.115);
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.003, 0.003), frameMat);
      bridge.position.set(0, 0.05, 0.115);

      group.add(leftRim, rightRim, bridge);
      break;
    }

    case 'sunglasses': {
      // Dark Lagos shades
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.1,
        metalness: 0.8,
      });
      const shadeGeo = new THREE.BoxGeometry(0.11, 0.035, 0.01);
      const shadeMesh = new THREE.Mesh(shadeGeo, glassMat);
      shadeMesh.position.set(0, 0.05, 0.118);
      group.add(shadeMesh);
      break;
    }
  }

  group.traverse(c => {
    if (c instanceof THREE.Mesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  return group;
}

/**
 * Assembles a complete Quaternius modular character from data-driven configuration
 */
export class QuaterniusModularCharacter {
  public group: THREE.Group;
  public appearance: CharacterAppearance;
  public mixer: THREE.AnimationMixer | null = null;
  public actions = new Map<string, THREE.AnimationAction>();
  public currentAction: THREE.AnimationAction | null = null;

  private headBone: THREE.Bone | null = null;
  private bodyMesh: THREE.SkinnedMesh | null = null;
  private loaded = false;

  constructor(appearance: CharacterAppearance) {
    this.appearance = appearance;
    this.group = new THREE.Group();
    this.group.name = `ModularCharacter_${appearance.body}`;
  }

  public isReady(): boolean {
    return this.loaded;
  }

  public async load(loader: GLTFLoader): Promise<void> {
    const isMale = this.appearance.body === 'male';
    const baseModelUrl = isMale
      ? '/assets/characters/quaternius_male.glb'
      : '/assets/characters/quaternius_female.glb';
    const animsUrl = '/assets/characters/animations_q.glb';

    // 1. Load base body and retargeted animations in parallel
    const [baseGltf, animGltf] = await Promise.all([
      new Promise<GLTF>((res, rej) => loader.load(baseModelUrl, res, undefined, rej)),
      new Promise<GLTF>((res, rej) => loader.load(animsUrl, res, undefined, rej)),
    ]);

    const characterScene: THREE.Group = baseGltf.scene;
    this.group.add(characterScene);

    // Apply height scale if configured
    if (this.appearance.heightScale) {
      const s = this.appearance.heightScale;
      characterScene.scale.set(s, s, s);
    }

    // 2. Identify bones and body SkinnedMesh
    characterScene.traverse(child => {
      if (child instanceof THREE.Bone) {
        if (child.name === 'Head') {
          this.headBone = child;
        }
      }
      if (child instanceof THREE.SkinnedMesh) {
        const name = child.name.toLowerCase();
        if (name.includes('superhero') || name.includes('sphere') || name.includes('body')) {
          this.bodyMesh = child;
        }
      }
    });

    // 3. Apply Authentic West African Skin Tone Texture
    const skinDef = WEST_AFRICAN_SKIN_TONES[this.appearance.skinToneIndex] ?? WEST_AFRICAN_SKIN_TONES[4]!;
    const skinTexUrl = isMale ? skinDef.textureMale : skinDef.textureFemale;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(skinTexUrl, skinTex => {
      skinTex.colorSpace = THREE.SRGBColorSpace;
      skinTex.flipY = false;
      if (this.bodyMesh && this.bodyMesh.material instanceof THREE.MeshStandardMaterial) {
        this.bodyMesh.material.map = skinTex;
        this.bodyMesh.material.roughness = 0.85;
        this.bodyMesh.material.metalness = 0.05;
        this.bodyMesh.material.needsUpdate = true;
      }
    });

    // 4. Generate Clothing Shells
    if (this.bodyMesh) {
      const topShell = generateClothingShell(
        this.bodyMesh,
        this.appearance.clothing.top,
        this.appearance.clothing.topColor,
        this.appearance.clothing.topPattern
      );
      if (topShell) characterScene.add(topShell);

      const bottomShell = generateClothingShell(
        this.bodyMesh,
        this.appearance.clothing.bottom,
        this.appearance.clothing.bottomColor,
        this.appearance.clothing.bottomPattern
      );
      if (bottomShell) characterScene.add(bottomShell);

      const shoesShell = generateClothingShell(
        this.bodyMesh,
        this.appearance.clothing.shoes,
        this.appearance.clothing.shoesColor,
        'plain'
      );
      if (shoesShell) characterScene.add(shoesShell);
    }

    // 5. Load and attach modular hair
    if (this.appearance.hairstyle !== 'bald') {
      const hairMap: Record<HairstyleType, string | null> = {
        buzzed: '/assets/characters/modular/hair_buzzed.glb',
        buzzed_female: '/assets/characters/modular/hair_buzzedfemale.glb',
        simple_parted: '/assets/characters/modular/hair_simpleparted.glb',
        buns: '/assets/characters/modular/hair_buns.glb',
        long: '/assets/characters/modular/hair_long.glb',
        bald: null,
      };

      const hairUrl = hairMap[this.appearance.hairstyle];
      if (hairUrl) {
        loader.load(hairUrl, hairGltf => {
          const hairScene = hairGltf.scene;
          hairScene.traverse(c => {
            if (c instanceof THREE.Mesh) {
              c.castShadow = true;
              c.receiveShadow = true;
              if (c.material instanceof THREE.MeshStandardMaterial) {
                c.material.color.setHex(this.appearance.hairColor);
                c.material.roughness = 0.9;
                c.material.metalness = 0.05;
              }
            }
          });
          characterScene.add(hairScene);
        });
      }
    }

    // Beard
    if (this.appearance.hasBeard) {
      loader.load('/assets/characters/modular/hair_beard.glb', beardGltf => {
        beardGltf.scene.traverse(c => {
          if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
            c.material.color.setHex(this.appearance.beardColor ?? this.appearance.hairColor);
            c.material.roughness = 0.9;
          }
        });
        characterScene.add(beardGltf.scene);
      });
    }

    // 6. Attach procedural accessories to Head bone
    if (this.headBone && this.appearance.accessories) {
      if (this.appearance.accessories.headwear && this.appearance.accessories.headwear !== 'none') {
        const headwear = buildProceduralAccessory(
          this.appearance.accessories.headwear,
          this.appearance.accessories.headwearColor ?? 0x0f172a
        );
        if (headwear) this.headBone.add(headwear);
      }

      if (this.appearance.accessories.glasses && this.appearance.accessories.glasses !== 'none') {
        const glasses = buildProceduralAccessory(this.appearance.accessories.glasses);
        if (glasses) this.headBone.add(glasses);
      }
    }

    // 7. Setup Animation Mixer with retargeted clips
    this.mixer = new THREE.AnimationMixer(characterScene);
    for (const clip of animGltf.animations) {
      const action = this.mixer.clipAction(clip);
      if (clip.name === 'StandToSit' || clip.name === 'SitToStand') {
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
      } else {
        action.loop = THREE.LoopRepeat;
      }
      this.actions.set(clip.name, action);
    }

    // Play default Idle animation
    const idleAction = this.actions.get('Idle');
    if (idleAction) {
      idleAction.play();
      this.currentAction = idleAction;
    }

    this.loaded = true;
  }

  public playAnimation(name: string): void {
    const nextAction = this.actions.get(name);
    if (!nextAction || nextAction === this.currentAction) return;

    if (this.currentAction) {
      this.currentAction.fadeOut(0.25);
    }
    nextAction.reset().fadeIn(0.25).play();
    this.currentAction = nextAction;
  }

  public update(delta: number): void {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
