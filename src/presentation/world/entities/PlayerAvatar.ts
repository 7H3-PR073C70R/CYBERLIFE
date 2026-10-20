import * as THREE from 'three';
import { HumanoidCharacter } from './HumanoidCharacter';
import { RiggedHumanoidCharacter } from './RiggedHumanoidCharacter';
import { PlayerCharacterGender, PLAYER_CHARACTER } from '../worldConfig';

/**
 * PlayerAvatar: Represents the player's 3D human character in Cyberlife.
 * Wraps a realistic rigged Mixamo character (male or female) driven by an AnimationMixer
 * and skeletal animations, with the procedural HumanoidCharacter as an automatic fallback.
 */
export class PlayerAvatar {
  private group: THREE.Group;
  private fallbackCharacter: HumanoidCharacter | null = null;
  private riggedCharacter: RiggedHumanoidCharacter | null = null;
  private activeCharacter: HumanoidCharacter | RiggedHumanoidCharacter;
  private isFallback = false;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  // Track state so when rigged loads (or fallback switches), state is preserved
  private currentPosition = new THREE.Vector3(0, 0, 0);
  private currentYaw = 0;
  private isVisibleState = true;
  private isFirstPersonState = false;
  private isSittingState = false;

  constructor(gender: PlayerCharacterGender = PLAYER_CHARACTER) {
    this.group = new THREE.Group();
    this.group.name = 'PlayerAvatar';

    // Start with RiggedHumanoidCharacter as the primary character
    const rigged = new RiggedHumanoidCharacter(gender);
    this.riggedCharacter = rigged;
    this.activeCharacter = rigged;
    this.group.add(rigged.getMesh());

    // Asynchronously load the GLB assets
    this.loadPromise = this.initModel(rigged);
  }

  private async initModel(rigged: RiggedHumanoidCharacter): Promise<void> {
    try {
      await rigged.load();
      this.isLoaded = true;
      // Sync any state that was set before loading finished
      rigged.setPosition(this.currentPosition.x, this.currentPosition.y, this.currentPosition.z);
      rigged.setRotation(this.currentYaw);
      rigged.setVisible(this.isVisibleState);
      rigged.setFirstPerson(this.isFirstPersonState);
      rigged.setSitting(this.isSittingState);
    } catch (err) {
      console.warn(
        'PlayerAvatar: Failed to load rigged player character model, falling back to procedural box character.',
        err
      );
      this.switchToFallback();
    }
  }

  private switchToFallback(): void {
    if (this.isFallback) return;
    this.isFallback = true;

    if (this.riggedCharacter) {
      this.group.remove(this.riggedCharacter.getMesh());
      this.riggedCharacter.dispose();
      this.riggedCharacter = null;
    }

    this.fallbackCharacter = new HumanoidCharacter();
    this.activeCharacter = this.fallbackCharacter;
    this.group.add(this.fallbackCharacter.getMesh());

    this.fallbackCharacter.setPosition(
      this.currentPosition.x,
      this.currentPosition.y,
      this.currentPosition.z
    );
    this.fallbackCharacter.setRotation(this.currentYaw);
    this.fallbackCharacter.setVisible(this.isVisibleState);
    this.fallbackCharacter.setFirstPerson(this.isFirstPersonState);
    this.fallbackCharacter.setSitting(this.isSittingState);
  }

  public async waitForReady(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  public isUsingFallback(): boolean {
    return this.isFallback;
  }

  public isReady(): boolean {
    return this.isLoaded || this.isFallback;
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.currentPosition.set(x, y, z);
    this.activeCharacter.setPosition(x, y, z);
  }

  public setRotation(yaw: number): void {
    this.currentYaw = yaw;
    this.activeCharacter.setRotation(yaw);
  }

  public setVisible(visible: boolean): void {
    this.isVisibleState = visible;
    this.activeCharacter.setVisible(visible);
  }

  public isVisible(): boolean {
    return this.activeCharacter.isVisible();
  }

  public setFirstPerson(isFP: boolean): void {
    this.isFirstPersonState = isFP;
    this.activeCharacter.setFirstPerson(isFP);
  }

  public getIsFirstPerson(): boolean {
    return this.isFirstPersonState;
  }

  public setSitting(isSitting: boolean): void {
    this.isSittingState = isSitting;
    this.activeCharacter.setSitting(isSitting);
  }

  public isSitting(): boolean {
    return this.activeCharacter.isSitting();
  }

  public triggerTyping(): void {
    this.activeCharacter.triggerTyping();
  }

  public triggerMouseUse(): void {
    this.activeCharacter.triggerMouseUse();
  }

  public update(deltaTime: number, isMoving: boolean, speed = 1.0): void {
    this.activeCharacter.update(deltaTime, isMoving, speed);
  }

  public dispose(): void {
    if (this.riggedCharacter) {
      this.riggedCharacter.dispose();
      this.riggedCharacter = null;
    }
    if (this.fallbackCharacter) {
      this.fallbackCharacter.dispose();
      this.fallbackCharacter = null;
    }
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
