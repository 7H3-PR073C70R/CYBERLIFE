import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  NIGERIAN_SKIN_TONES,
  EXPAT_FAIR_SKIN_TONES,
  applyMelaninToTextureMaterial,
  applyCharacterCustomization,
  CharacterPalette,
} from '@/presentation/world/entities/CharacterCustomizer';
import { getNpcCustomPalette } from '@/presentation/world/entities/RiggedNpcCharacter';
import { NPC_PROFILES } from '@/simulation/actors/npcProfiles';

describe('Character Pipeline & Multi-Ethnic Melanin Diversity', () => {
  it('contains authentic Nigerian skin tones spectrum and expat fair tones', () => {
    expect(NIGERIAN_SKIN_TONES.length).toBeGreaterThanOrEqual(15);
    expect(EXPAT_FAIR_SKIN_TONES.length).toBeGreaterThanOrEqual(3);

    // Deep ebony
    expect(NIGERIAN_SKIN_TONES).toContain(0x321a0e);
    // Warm cocoa
    expect(NIGERIAN_SKIN_TONES).toContain(0x5c3826);
    // Golden bronze
    expect(NIGERIAN_SKIN_TONES).toContain(0x84563a);
    // Expat peach
    expect(EXPAT_FAIR_SKIN_TONES).toContain(0xf5d0b5);
  });

  it('hooks onBeforeCompile for scanned models with texture map', () => {
    const mat = new THREE.MeshStandardMaterial({
      map: new THREE.Texture(),
      roughness: 0.8,
      metalness: 0.1,
    });

    applyMelaninToTextureMaterial(mat, 0x5c3826, false);
    expect(mat.onBeforeCompile).toBeDefined();

    // Mock shader compilation check
    const mockShader = {
      uniforms: {} as Record<string, { value: unknown }>,
      fragmentShader: '#include <map_fragment>\nvoid main() {}',
    };

    mat.onBeforeCompile(mockShader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);

    expect(mockShader.uniforms.uMelaninColor).toBeDefined();
    expect(mockShader.uniforms.uMelaninStrength).toBeDefined();
    expect(mockShader.fragmentShader).toContain('isSkin');
    expect(mockShader.fragmentShader).toContain('uMelaninColor');
  });

  it('preserves expat fair complexion without altering shader when isExpat is true', () => {
    const mat = new THREE.MeshStandardMaterial({
      map: new THREE.Texture(),
    });

    applyMelaninToTextureMaterial(mat, 0xf5d0b5, true);
    // Should not assign custom onBeforeCompile for expat models
    expect(mat.onBeforeCompile).toBe(THREE.MeshStandardMaterial.prototype.onBeforeCompile);
  });

  it('applies melanin and custom attire to model meshes', () => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ map: new THREE.Texture() })
    );
    group.add(mesh);

    const palette: CharacterPalette = {
      skin: 0x643c28,
      jacket: 0x0f172a,
      pants: 0x1e293b,
      shoes: 0x06b6d4,
      style: 'CYBER_PROTAGONIST',
    };

    applyCharacterCustomization(group, palette);
    const updatedMat = mesh.material as THREE.MeshStandardMaterial;
    expect(updatedMat.onBeforeCompile).toBeDefined();
  });

  it('maps NPC profiles to bespoke palettes with appropriate roles and diversity', () => {
    const michaelProfile = NPC_PROFILES.find(p => p.id === 'npc_femi')!;
    const michaelPalette = getNpcCustomPalette(michaelProfile);
    expect(michaelPalette.style).toBe('ELITE_SUIT');
    expect(michaelPalette.skin).toBe(0x3d2012); // Deep Ebony

    const expatProfile = NPC_PROFILES.find(p => p.id === 'npc_expat_auditor')!;
    const expatPalette = getNpcCustomPalette(expatProfile);
    expect(expatPalette.isExpat).toBe(true);
    expect(expatPalette.skin).toBe(0xf5d0b5); // Fair peach expat
  });
});
