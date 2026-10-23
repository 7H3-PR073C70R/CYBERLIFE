import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ModelNormalizer } from './assets/ModelNormalizer';

export class AssetLoader {
  private static instance: AssetLoader;
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private gltfCache = new Map<string, Promise<THREE.Group>>();
  private textureCache = new Map<string, Promise<THREE.Texture>>();

  private constructor() {
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
    this.textureLoader = new THREE.TextureLoader();
  }

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  private gltfFullCache = new Map<string, Promise<GLTF>>();

  /**
   * Loads a GLB/GLTF asset with caching. Clones the scene on return
   * so separate instances do not mutate shared transforms or hierarchies.
   */
  public async loadGLTF(url: string): Promise<THREE.Group> {
    if (!this.gltfCache.has(url)) {
      const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
        this.gltfLoader.load(
          url,
          (gltf: GLTF) => {
            resolve(gltf.scene);
          },
          undefined,
          (err: unknown) => reject(err)
        );
      });
      this.gltfCache.set(url, loadPromise);
    }

    const baseScene = await this.gltfCache.get(url)!;
    return SkeletonUtils.clone(baseScene) as THREE.Group;
  }

  /**
   * Loads a GLB/GLTF model and automatically normalizes its scale, pivot, and orientation
   * using ModelNormalizer specifications.
   */
  public async loadNormalizedGLTF(url: string): Promise<THREE.Group> {
    const rawGroup = await this.loadGLTF(url);
    const wrapper = new THREE.Group();
    wrapper.name = `Normalized_${url.split('/').pop()}`;
    wrapper.add(rawGroup);
    ModelNormalizer.normalize(url, rawGroup);
    return wrapper;
  }

  /**
   * Loads a GLB/GLTF asset including both scene and animation clips with caching.
   * Clones the scene with SkeletonUtils.clone so separate instances do not mutate shared hierarchies.
   */
  public async loadGLTFWithAnimations(
    url: string
  ): Promise<{ scene: THREE.Group; animations: THREE.AnimationClip[] }> {
    if (!this.gltfFullCache.has(url)) {
      const loadPromise = new Promise<GLTF>((resolve, reject) => {
        this.gltfLoader.load(
          url,
          (gltf: GLTF) => resolve(gltf),
          undefined,
          (err: unknown) => reject(err)
        );
      });
      this.gltfFullCache.set(url, loadPromise);
    }

    const gltf = await this.gltfFullCache.get(url)!;
    const cloned = SkeletonUtils.clone(gltf.scene) as THREE.Group;
    ModelNormalizer.normalize(url, cloned);
    return {
      scene: cloned,
      animations: gltf.animations ? [...gltf.animations] : [],
    };
  }

  /**
   * Loads a texture with caching and applies SRGBColorSpace by default.
   */
  public async loadTexture(url: string): Promise<THREE.Texture> {
    if (!this.textureCache.has(url)) {
      const loadPromise = new Promise<THREE.Texture>((resolve, reject) => {
        this.textureLoader.load(
          url,
          (tex: THREE.Texture) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            resolve(tex);
          },
          undefined,
          (err: unknown) => reject(err)
        );
      });
      this.textureCache.set(url, loadPromise);
    }
    return this.textureCache.get(url)!;
  }

  /**
   * Clears internal model and texture caches on location change or disposal.
   */
  public clearCache(): void {
    this.gltfCache.clear();
    this.gltfFullCache.clear();
    this.textureCache.clear();
  }
}
