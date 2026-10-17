import * as THREE from 'three';
import { HumanoidCharacter } from './HumanoidCharacter';

/**
 * PlayerAvatar: Represents the player's 3D human character in Cyberlife.
 * Wraps an articulated HumanoidCharacter model featuring realistic proportions,
 * walking cycle animations, sitting transitions, and hands-on-keyboard workstation
 * interaction animations.
 */
export class PlayerAvatar {
  private character: HumanoidCharacter;

  constructor() {
    this.character = new HumanoidCharacter();
  }

  public getMesh(): THREE.Group {
    return this.character.getMesh();
  }

  public setPosition(x: number, y: number, z: number): void {
    this.character.setPosition(x, y, z);
  }

  public setRotation(yaw: number): void {
    this.character.setRotation(yaw);
  }

  public setVisible(visible: boolean): void {
    this.character.setVisible(visible);
  }

  public isVisible(): boolean {
    return this.character.isVisible();
  }

  public setFirstPerson(isFP: boolean): void {
    this.character.setFirstPerson(isFP);
  }

  public setSitting(isSitting: boolean): void {
    this.character.setSitting(isSitting);
  }

  public isSitting(): boolean {
    return this.character.isSitting();
  }

  public triggerTyping(): void {
    this.character.triggerTyping();
  }

  public triggerMouseUse(): void {
    this.character.triggerMouseUse();
  }

  public update(deltaTime: number, isMoving: boolean, speed = 1.0): void {
    this.character.update(deltaTime, isMoving, speed);
  }

  public dispose(): void {
    this.character.dispose();
  }
}
