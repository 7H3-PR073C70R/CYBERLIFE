import * as THREE from 'three';

export interface ModelNormalizationSpec {
  readonly uniformScale?: number;
  readonly targetHeight?: number;
  readonly targetLength?: number;
  readonly targetWidth?: number;
  readonly rotationOffset?: [number, number, number]; // Radians [x, y, z]
  readonly centerXZ?: boolean;
  readonly alignGroundY?: boolean;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
}

export const MODEL_NORMALIZATION_SPECS: Record<string, ModelNormalizationSpec> = {
  // =========================================================================
  // 1. Vehicles
  // =========================================================================
  'danfo_realistic.glb': {
    uniformScale: 2.4, // Normalizes 2.0m unit box to 4.8m length, 2.14m height
    rotationOffset: [0, Math.PI / 2, 0], // Align vehicle forward axis with -Z
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'taxi_mondeo_realistic.glb': {
    uniformScale: 0.025, // Normalizes 193.7 units to 4.84m sedan length
    rotationOffset: [-Math.PI / 2, 0, Math.PI / 2], // Fix FBX/OBJ orientation
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'estate_hybrid_realistic.glb': {
    uniformScale: 0.01, // Normalizes 493.4 cm to 4.93m station wagon
    rotationOffset: [0, 0, 0],
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'mustang_coupe_realistic.glb': {
    uniformScale: 0.01, // Normalizes 477.7 cm to 4.78m coupe
    rotationOffset: [0, 0, 0],
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'motorcycle_okada.glb': {
    uniformScale: 2.2, // Authentic Lagos commercial motorcycle
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },

  // =========================================================================
  // 2. City Architecture & Headquarters Towers
  // =========================================================================
  'tower_cedarline_marina.glb': {
    uniformScale: 1.5, // High-rise commercial tower
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'tower_eko_bank.glb': {
    uniformScale: 0.65, // Commercial bank tower
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'blocks_krest_commercial.glb': {
    uniformScale: 0.8,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'blocks_ndsrc_civic.glb': {
    uniformScale: 0.85,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'blocks_inquirer_balogun.glb': {
    uniformScale: 0.75,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },

  // =========================================================================
  // 3. Generators & Urban Infrastructure
  // =========================================================================
  'generator_diesel_realistic.glb': {
    uniformScale: 0.03, // Normalizes to 2.48m length industrial generator
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'road_avenue_pbr.glb': {
    uniformScale: 1.0,
    centerXZ: true,
    alignGroundY: true,
    castShadow: false,
    receiveShadow: true,
  },
  'street_network_pbr.glb': {
    uniformScale: 1.0,
    centerXZ: true,
    alignGroundY: true,
    castShadow: false,
    receiveShadow: true,
  },

  // =========================================================================
  // 4. Five Distinct Corporate Office Interiors
  // =========================================================================
  'office_cedarline_soc.glb': {
    uniformScale: 1.0, // 20.6m x 19.5m x 3.5m - already in exact architectural meters
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'office_eko_bank_loft.glb': {
    uniformScale: 0.8,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'office_krest_war_room.glb': {
    uniformScale: 0.75,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'office_player_apartment.glb': {
    uniformScale: 0.65, // Cozy independent researcher apartment
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'office_inquirer_newsroom.glb': {
    uniformScale: 0.01, // Normalizes 1242 cm to 12.4m investigative newsroom
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },

  // =========================================================================
  // 5. Human Characters
  // =========================================================================
  'barry_tech_male.glb': {
    uniformScale: 1.78 / 16383, // 16-bit quantized scan scaled to 1.78m height
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'blessing_exec_female.glb': {
    uniformScale: 0.92, // Scaled from 1.90m to 1.75m corporate stature
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'amina_chic_female.glb': {
    uniformScale: 1.70 / 16383,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'conductor_trader_male.glb': {
    uniformScale: 1.76 / 16383,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'corporate_director_male.glb': {
    uniformScale: 1.82 / 16383,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'syndicate_hacker_male.glb': {
    uniformScale: 1.75 / 16383,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
  'expat_consultant_male.glb': {
    uniformScale: 1.80 / 16383,
    centerXZ: true,
    alignGroundY: true,
    castShadow: true,
    receiveShadow: true,
  },
};

export class ModelNormalizer {
  /**
   * Normalizes a 3D model root according to its registered specification or computed bounding box.
   * Centers the model on X/Z, aligns its lowest vertex to Y=0, applies orientation rotations,
   * scales to metric units, and enables proper PBR shadow casting.
   */
  public static normalize(modelKeyOrFilename: string, root: THREE.Object3D): THREE.Object3D {
    const filename = modelKeyOrFilename.split('/').pop() ?? modelKeyOrFilename;
    const spec = MODEL_NORMALIZATION_SPECS[filename];

    // Apply rotation offset if specified
    if (spec?.rotationOffset) {
      root.rotation.x += spec.rotationOffset[0];
      root.rotation.y += spec.rotationOffset[1];
      root.rotation.z += spec.rotationOffset[2];
      root.updateMatrixWorld(true);
    }

    // Apply uniform scale factor
    if (spec?.uniformScale) {
      root.scale.setScalar(spec.uniformScale);
      root.updateMatrixWorld(true);
    }

    // Compute bounding box after scale and rotation
    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);

    // Apply target dimension scaling if specified without uniformScale
    if (!spec?.uniformScale) {
      let scaleFactor = 1.0;
      if (spec?.targetHeight && size.y > 0.0001) {
        scaleFactor = spec.targetHeight / size.y;
      } else if (spec?.targetLength && size.z > 0.0001) {
        scaleFactor = spec.targetLength / size.z;
      } else if (spec?.targetWidth && size.x > 0.0001) {
        scaleFactor = spec.targetWidth / size.x;
      }
      if (scaleFactor !== 1.0) {
        root.scale.setScalar(scaleFactor);
        root.updateMatrixWorld(true);
        bbox.setFromObject(root);
        bbox.getSize(size);
        bbox.getCenter(center);
      }
    }

    // Align ground level to Y = 0
    if (spec?.alignGroundY !== false) {
      root.position.y -= bbox.min.y;
    }

    // Center on X and Z
    if (spec?.centerXZ) {
      root.position.x -= center.x;
      root.position.z -= center.z;
    }

    // Configure shadow flags and ensure PBR materials are correctly configured
    const castShadow = spec?.castShadow ?? true;
    const receiveShadow = spec?.receiveShadow ?? true;

    root.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;

        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of materials) {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Ensure proper envMap intensity and roughness range
              mat.envMapIntensity = 1.0;
              if (mat.roughness === 0 && mat.metalness === 0) {
                mat.roughness = 0.5; // Avoid default plastic look
              }
            }
          }
        }
      }
    });

    root.userData.__modelNormalized = true;
    root.updateMatrixWorld(true);
    return root;
  }
}
