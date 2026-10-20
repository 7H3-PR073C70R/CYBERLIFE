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

  // Horizon haze color for outdoor fog - slightly darker for richer street contrast and depth
  private horizonColor = new THREE.Color(0x768fa8);

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    options: SkyEnvironmentOptions = {}
  ) {
    this.scene = scene;
    this.renderer = renderer;

    const elevation = options.sunElevation ?? 28; // Warmer afternoon Lagos sun
    const azimuth = options.sunAzimuth ?? 155;

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
      // Increased turbidity for warm golden horizon and increased rayleigh for deep blue zenith
      if (uniforms['turbidity']) uniforms['turbidity'].value = options.turbidity ?? 8.5;
      if (uniforms['rayleigh']) uniforms['rayleigh'].value = options.rayleigh ?? 2.8;
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
    // Warm sun tint with reduced intensity (1.35) so white surfaces are not clipped
    const sunColor = 0xfff4e0;
    this.sunLight = new THREE.DirectionalLight(sunColor, 1.35);
    this.sunLight.castShadow = true;

    // Shadow map tuning: 2048x2048 with soft PCF filtering (Step 1 shadows preserved)
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
    this.hemiLight = new THREE.HemisphereLight(0xb0cce8, 0x5c5753, 0.22);
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
    // Atmospheric soft haze fog slightly darker to regain contrast and depth
    this.scene.fog = new THREE.FogExp2(this.horizonColor.getHex(), 0.0035);
    this.scene.background = null;

    if (this.outdoorEnvMap) {
      this.scene.environment = this.outdoorEnvMap;
    }
    // Reduced outdoor environment intensity so sky and vehicles do not wash out
    this.scene.environmentIntensity = 0.55;

    if (this.sunLight) {
      this.sunLight.visible = true;
    }
    if (this.hemiLight) {
      this.hemiLight.intensity = 0.22;
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
    // Lower environment intensity for interiors than for outdoors (0.18 vs 0.55)
    this.scene.environmentIntensity = 0.18;

    // Disable outdoor sun when inside dedicated interior rooms
    if (this.sunLight) {
      this.sunLight.visible = false;
    }
    if (this.hemiLight) {
      this.hemiLight.intensity = 0.05;
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

  /**
   * Dynamically adjusts sun position, sunlight intensity, sky uniforms, and horizon haze
   * based on the simulation time of day.
   */
  public updateTimeOfDay(hour: number, minute = 0): void {
    const timeFrac = hour + minute / 60; // 0.0 to 24.0

    let elevation = 0;
    let azimuth = 180;
    let sunIntensity = 1.35;
    let sunColor = 0xfff4e0;
    let turbidity = 8.5;
    let rayleigh = 2.8;
    let fogColor = 0x768fa8;
    let hemiSky = 0xb0cce8;
    let hemiGround = 0x5c5753;
    let hemiIntensity = 0.22;

    if (timeFrac >= 5.5 && timeFrac < 18.5) {
      // Daytime: 05:30 to 18:30
      const dayProgress = (timeFrac - 5.5) / 13.0; // 0 (dawn) to 1 (dusk)
      elevation = Math.sin(dayProgress * Math.PI) * 62 + 4;
      azimuth = 95 + dayProgress * 170;

      if (dayProgress < 0.2) {
        // Morning Golden Hour (05:30 - 08:00)
        const t = dayProgress / 0.2;
        sunColor = 0xffd29d;
        turbidity = 11.0 - t * 2.5;
        rayleigh = 3.8 - t * 1.0;
        fogColor = 0x967c76;
        sunIntensity = 0.8 + t * 0.55;
      } else if (dayProgress > 0.8) {
        // Evening Sunset / Dusk (16:00 - 18:30)
        const t = (dayProgress - 0.8) / 0.2;
        sunColor = 0xff8c42;
        turbidity = 8.5 + t * 3.5;
        rayleigh = 2.8 + t * 1.4;
        fogColor = 0x8a554a;
        sunIntensity = 1.35 - t * 0.7;
      } else {
        // Midday (08:00 - 16:00)
        sunColor = 0xfffaed;
        turbidity = 7.5;
        rayleigh = 2.6;
        fogColor = 0x768fa8;
        sunIntensity = 1.35;
      }
    } else {
      // Nighttime (18:30 - 05:30)
      elevation = -12;
      azimuth = 45;
      sunColor = 0x38bdf8;
      sunIntensity = 0.12;
      turbidity = 15.0;
      rayleigh = 0.5;
      fogColor = 0x060c18;
      hemiSky = 0x0f172a;
      hemiGround = 0x030712;
      hemiIntensity = 0.08;
    }

    const phi = THREE.MathUtils.degToRad(90 - Math.max(elevation, 1));
    const theta = THREE.MathUtils.degToRad(azimuth);
    this.sunDirection.setFromSphericalCoords(1, phi, theta).normalize();

    this.horizonColor.setHex(fogColor);

    if (this.sky && this.sky.material && 'uniforms' in this.sky.material) {
      const uniforms = (this.sky.material as THREE.ShaderMaterial).uniforms;
      if (uniforms['turbidity']) uniforms['turbidity'].value = turbidity;
      if (uniforms['rayleigh']) uniforms['rayleigh'].value = rayleigh;
      if (uniforms['sunPosition'])
        (uniforms['sunPosition'].value as THREE.Vector3).copy(this.sunDirection);
    }

    if (this.sunLight) {
      this.sunLight.color.setHex(sunColor);
      this.sunLight.intensity = this.isInterior ? 0 : sunIntensity;
    }

    if (this.hemiLight) {
      this.hemiLight.color.setHex(hemiSky);
      this.hemiLight.groundColor.setHex(hemiGround);
      this.hemiLight.intensity = this.isInterior ? 0.05 : hemiIntensity;
    }

    if (!this.isInterior && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(fogColor);
    }
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
