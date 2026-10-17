import * as THREE from 'three';

export interface WorldSceneOptions {
  clearColor?: number;
  antialias?: boolean;
}

export interface SceneStatistics {
  renderedFrames: number;
  isDisposed: boolean;
}

/**
 * WorldSceneManager encapsulates the Three.js rendering lifecycle:
 * Scene, Camera, Renderer, Animation loop, Viewport resizing, and Resource disposal.
 *
 * It fulfills Milestone 1 by establishing a clean, isolated boundary between
 * the React component tree and the WebGL rendering pipeline.
 */
export class WorldSceneManager {
  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Placeholder meshes for M1 visual verification
  private animatedMeshGroup: THREE.Group | null = null;

  private frameCount = 0;
  private isDisposed = false;

  /**
   * Checks whether the current browser environment supports WebGL.
   */
  public static isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Initializes the Three.js scene, camera, renderer, and begins the animation loop.
   * Throws an error if container is invalid or WebGL context cannot be created.
   */
  public initialize(container: HTMLElement, options: WorldSceneOptions = {}): void {
    if (!container) {
      throw new Error(
        'WorldSceneManager: Initialization failed. Container element is null or undefined.'
      );
    }

    if (!WorldSceneManager.isWebGLAvailable()) {
      throw new Error(
        'WorldSceneManager: WebGL is not available or hardware acceleration is disabled in this browser.'
      );
    }

    this.container = container;
    this.isDisposed = false;

    // 1. Scene Setup
    const clearColor = options.clearColor ?? 0x070a10;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(clearColor);
    this.scene.fog = new THREE.FogExp2(clearColor, 0.035);

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 3, 7);
    this.camera.lookAt(0, 1, 0);

    // 3. Renderer Setup
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: options.antialias ?? true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const canvas = this.renderer.domElement;
      canvas.className = 'world-viewport-canvas';
      canvas.setAttribute('role', 'region');
      canvas.setAttribute('aria-label', '3D World Viewport (Technical Placeholder Scene)');
      this.container.appendChild(canvas);
    } catch (err) {
      this.dispose();
      throw new Error(
        `WorldSceneManager: WebGLRenderer creation failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // 4. Construct Placeholder Scene Geometry (Floor Grid + Neutral Geometric Objects)
    this.buildPlaceholderScene();

    // 5. Setup Resize Handling via ResizeObserver
    this.setupResizeObserver();

    // 6. Begin Animation Loop
    this.startAnimationLoop();
  }

  /**
   * Builds placeholder technical geometry to prove lighting, shadows, and rendering work.
   * Explicitly avoids pretending character controllers or complete neighborhood exist.
   */
  private buildPlaceholderScene(): void {
    if (!this.scene) return;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);

    const accentLight = new THREE.PointLight(0x00ff9d, 0.8, 15);
    accentLight.position.set(-3, 2, 2);
    this.scene.add(accentLight);

    // Ground Grid & Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Animated Central Placeholder Mesh Group
    this.animatedMeshGroup = new THREE.Group();

    // Central geometric focal point (Tech Node Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 1.5;
    coreMesh.castShadow = true;
    this.animatedMeshGroup.add(coreMesh);

    // Orbiting wireframe rings
    const ringGeo = new THREE.TorusGeometry(2, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.position.y = 1.5;
    ringMesh1.rotation.x = Math.PI / 3;
    this.animatedMeshGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh2.position.y = 1.5;
    ringMesh2.rotation.y = Math.PI / 4;
    this.animatedMeshGroup.add(ringMesh2);

    this.scene.add(this.animatedMeshGroup);
  }

  /**
   * Resizes renderer and updates camera projection when container dimensions change.
   */
  public resize(): void {
    if (!this.container || !this.renderer || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setupResizeObserver(): void {
    if (!this.container || typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  /**
   * Single, managed animation loop using requestAnimationFrame.
   */
  private startAnimationLoop(): void {
    const animate = () => {
      if (this.isDisposed) return;

      this.frameCount++;

      // Subtle rotation for technical placeholder meshes
      if (this.animatedMeshGroup) {
        this.animatedMeshGroup.rotation.y += 0.008;
        this.animatedMeshGroup.rotation.x += 0.003;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Returns operational statistics for diagnostics and testing.
   */
  public getStatistics(): SceneStatistics {
    return {
      renderedFrames: this.frameCount,
      isDisposed: this.isDisposed,
    };
  }

  /**
   * Thoroughly disposes WebGL resources, listeners, observers, and animation frames.
   */
  public dispose(): void {
    this.isDisposed = true;

    // 1. Cancel Animation Loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 2. Disconnect Resize Observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // 3. Dispose Meshes, Geometries, Materials, and Textures in Scene
    if (this.scene) {
      this.scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      this.scene.clear();
      this.scene = null;
    }

    // 4. Dispose WebGL Renderer
    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    this.animatedMeshGroup = null;
    this.camera = null;
    this.container = null;
  }
}
