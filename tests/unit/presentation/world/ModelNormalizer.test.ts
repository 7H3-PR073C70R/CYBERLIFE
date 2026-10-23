import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ModelNormalizer, MODEL_NORMALIZATION_SPECS } from '@/presentation/world/assets/ModelNormalizer';

describe('ModelNormalizer Unit Tests', () => {
  it('contains valid specifications for all registered models', () => {
    expect(MODEL_NORMALIZATION_SPECS['danfo_realistic.glb']).toBeDefined();
    expect(MODEL_NORMALIZATION_SPECS['taxi_mondeo_realistic.glb']).toBeDefined();
    expect(MODEL_NORMALIZATION_SPECS['estate_hybrid_realistic.glb']).toBeDefined();
    expect(MODEL_NORMALIZATION_SPECS['mustang_coupe_realistic.glb']).toBeDefined();
    expect(MODEL_NORMALIZATION_SPECS['tower_cedarline_marina.glb']).toBeDefined();
    expect(MODEL_NORMALIZATION_SPECS['office_cedarline_soc.glb']).toBeDefined();
    expect(MODEL_NORMALIZATION_SPECS['barry_tech_male.glb']).toBeDefined();
  });

  it('correctly scales and grounds the Danfo minibus model', () => {
    const root = new THREE.Group();
    // Simulate raw 2.0 x 0.89 x 0.95 unit box from incoming GLB
    const geo = new THREE.BoxGeometry(2.0, 0.89, 0.95);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
    root.add(mesh);

    ModelNormalizer.normalize('danfo_realistic.glb', root);

    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Height should be ~2.1m to 2.3m, length should be ~4.8m
    expect(bbox.min.y).toBeCloseTo(0, 1);
    expect(size.y).toBeGreaterThan(2.0);
    expect(size.y).toBeLessThan(2.4);
    expect(mesh.castShadow).toBe(true);
    expect(mesh.receiveShadow).toBe(true);
  });

  it('correctly scales quantized 16-bit character scans to realistic 1.78m human height', () => {
    const root = new THREE.Group();
    // Simulate raw 16383 units tall mesh from incoming character scan
    const geo = new THREE.BoxGeometry(5000, 16383, 3000);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
    root.add(mesh);

    ModelNormalizer.normalize('barry_tech_male.glb', root);

    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    expect(bbox.min.y).toBeCloseTo(0, 1);
    expect(size.y).toBeCloseTo(1.78, 1);
  });

  it('centers models on X and Z while keeping lowest vertex at ground Y=0', () => {
    const root = new THREE.Group();
    const geo = new THREE.BoxGeometry(10, 10, 10);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
    mesh.position.set(25, 50, 75); // Off-center
    root.add(mesh);

    ModelNormalizer.normalize('danfo_realistic.glb', root);

    const bbox = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    expect(center.x).toBeCloseTo(0, 1);
    expect(center.z).toBeCloseTo(0, 1);
    expect(bbox.min.y).toBeCloseTo(0, 1);
  });
});
