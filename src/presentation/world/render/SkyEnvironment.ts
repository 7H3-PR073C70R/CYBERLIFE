import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface SkyEnvironmentOptions {
  sunElevation?: number; // degrees above horizon
  sunAzimuth?: number; // degrees
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
}

/**
 * SkyEnvironment: High-fidelity procedural atmospheric lighting and PBR environment.
 * Replaces flat backgrounds and harsh ambient lighting with:
 * 1. Three.js procedural Sky shader with warm sun positioning.
 * 2. Pre-filtered Radiance Environment Maps (PMREM) generated from the procedural sky (outdoor)
 *    and RoomEnvironment (interiors) for physically based image-based lighting (IBL).
 * 3. Directional sun light matching the procedural sky angle, with PCF soft shadows,
 *    shadow acne bias/normalBias tuning, and a dynamic shadow box that follows the player.
 * 4. Atmospheric horizon haze fog harmonized with the procedural sky.
 */
export class SkyEnvironment {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private sky: Sky | null = null;
  private sunLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;

  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private outdoorEnvMap: THREE.Texture | null = null;
  private interiorEnvMap: THREE.Texture | null = null;

  private sunDirection: THREE.Vector3 = new THREE.Vector3();
  private isInterior = false;

  // Horizon haze color for outdoor fog
  private horizonColor = new THREE.Color(0xd4e2ed);

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    options: SkyEnvironmentOptions = {}
  ) {
    this.scene = scene;
    this.renderer = renderer;

    const elevation = options.sunElevation ?? 32;
    const azimuth = options.sunAzimuth ?? 155; // Warm morning/afternoon Lagos sun

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    this.sunDirection.setFromSphericalCoords(1, phi, theta).normalize();

    this.setupSky(options);
    this.setupLights();
    this.generateEnvironmentMaps();
    this.applyOutdoorMode();
  }

  private setupSky(options: SkyEnvironmentOptions): void {
    try {
      this.sky = new Sky();
      this.sky.scale.setScalar(450000);

      const uniforms = this.sky.material.uniforms;
      if (uniforms['turbidity']) uniforms['turbidity'].value = options.turbidity ?? 6.0;
      if (uniforms['rayleigh']) uniforms['rayleigh'].value = options.rayleigh ?? 1.4;
      if (uniforms['mieCoefficient'])
        uniforms['mieCoefficient'].value = options.mieCoefficient ?? 0.005;
      if (uniforms['mieDirectionalG'])
        uniforms['mieDirectionalG'].value = options.mieDirectionalG ?? 0.82;
      if (uniforms['sunPosition'])
        (uniforms['sunPosition'].value as THREE.Vector3).copy(this.sunDirection);

      this.scene.add(this.sky);
    } catch {
      // In test/mock environments where WebGL is unavailable, fallback gracefully
      this.sky = null;
    }
  }

  private setupLights(): void {
    // 1. Directional Sun Light matching the sky angle
    // Warm sun tint (2800K-3500K equivalent warm sunlight)
    const sunColor = 0xfff4e0;
    this.sunLight = new THREE.DirectionalLight(sunColor, 2.2);
    this.sunLight.castShadow = true;

    // Shadow map tuning: 2048x2048 with soft PCF filtering
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 1.0;
    this.sunLight.shadow.camera.far = 130;

    // Focused shadow box around player (56x56 box offers 4x resolution vs static world box)
    const d = 28;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    // Fix shadow acne and self-shadowing artifacts
    this.sunLight.shadow.bias = -0.00025;
    this.sunLight.shadow.normalBias = 0.025;

    // Initial position based on sun direction
    const sunDist = 65;
    this.sunLight.position.copy(this.sunDirection).multiplyScalar(sunDist);
    this.sunLight.target.position.set(0, 0, 0);

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 2. Subtle Hemisphere Fill (coastal sky to ground bounce)
    // Kept low because PMREM IBL provides natural diffuse and specular ambient
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x78716c, 0.35);
    this.scene.add(this.hemiLight);
  }

  private generateEnvironmentMaps(): void {
    try {
      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.pmremGenerator.compileEquirectangularShader();

      // Generate outdoor IBL from the procedural sky
      if (this.sky) {
        const skyScene = new THREE.Scene();
        const skyClone = this.sky.clone();
        skyScene.add(skyClone);
        const renderTarget = this.pmremGenerator.fromScene(skyScene, 0.04);
        this.outdoorEnvMap = renderTarget.texture;
        skyClone.geometry.dispose();
      }

      // Generate interior IBL from RoomEnvironment
      const roomScene = new RoomEnvironment();
      const roomTarget = this.pmremGenerator.fromScene(roomScene, 0.04);
      this.interiorEnvMap = roomTarget.texture;
      roomScene.dispose();
    } catch {
      // Graceful fallback for mock environments
      this.outdoorEnvMap = null;
      this.interiorEnvMap = null;
    }
  }

  public setLocationMode(isInterior: boolean): void {
    this.isInterior = isInterior;
    if (isInterior) {
      this.applyInteriorMode();
    } else {
      this.applyOutdoorMode();
    }
  }

  private applyOutdoorMode(): void {
    if (this.sky) {
      this.sky.visible = true;
    }
    // Atmospheric soft haze fog in horizon color
    this.scene.fog = new THREE.FogExp2(this.horizonColor.getHex(), 0.0045);
    this.scene.background = null;

    if (this.outdoorEnvMap) {
      this.scene.environment = this.outdoorEnvMap;
    }

    if (this.sunLight) {
      this.sunLight.visible = true;
    }
    if (this.hemiLight) {
      this.hemiLight.intensity = 0.35;
    }
  }

  private applyInteriorMode(): void {
    if (this.sky) {
      this.sky.visible = false;
    }
    // Deep neutral architectural background; no outdoor fog washing out interior walls
    this.scene.background = new THREE.Color(0x0a0f18);
    this.scene.fog = null;

    if (this.interiorEnvMap) {
      this.scene.environment = this.interiorEnvMap;
    }

    // Disable outdoor sun when inside dedicated interior rooms
    if (this.sunLight) {
      this.sunLight.visible = false;
    }
    if (this.hemiLight) {
      this.hemiLight.intensity = 0.1;
    }
  }

  /**
   * Called every frame to keep the sun shadow frustum centered tightly around the player.
   */
  public update(playerPos?: { x: number; y: number; z: number }): void {
    if (!this.isInterior && this.sunLight && playerPos) {
      const sunDist = 65;
      this.sunLight.position.set(
        playerPos.x + this.sunDirection.x * sunDist,
        playerPos.y + this.sunDirection.y * sunDist,
        playerPos.z + this.sunDirection.z * sunDist
      );
      this.sunLight.target.position.set(playerPos.x, playerPos.y, playerPos.z);
      this.sunLight.target.updateMatrixWorld();
    }
  }

  public getSunDirection(): THREE.Vector3 {
    return this.sunDirection.clone();
  }

  public getHorizonColor(): THREE.Color {
    return this.horizonColor.clone();
  }

  public dispose(): void {
    if (this.sky) {
      this.scene.remove(this.sky);
      this.sky.geometry.dispose();
      this.sky = null;
    }
    if (this.sunLight) {
      this.scene.remove(this.sunLight);
      this.scene.remove(this.sunLight.target);
      this.sunLight.dispose();
      this.sunLight = null;
    }
    if (this.hemiLight) {
      this.scene.remove(this.hemiLight);
      this.hemiLight.dispose();
      this.hemiLight = null;
    }
    if (this.outdoorEnvMap) {
      this.outdoorEnvMap.dispose();
      this.outdoorEnvMap = null;
    }
    if (this.interiorEnvMap) {
      this.interiorEnvMap.dispose();
      this.interiorEnvMap = null;
    }
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }
  }
}
