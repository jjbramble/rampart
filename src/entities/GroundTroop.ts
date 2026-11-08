import Phaser from 'phaser';
import { GROUND_Y, WALL } from '../config';
import { Enemy } from './Enemy';

/** Infantry that marches at the wall and damages the gate on arrival. */
export class GroundTroop extends Enemy {
  private readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, speed: number) {
    super(scene, x, GROUND_Y - 7, 8, 14, 0xc0392b, 1);
    this.speed = speed;
  }

  protected move(dt: number): void {
    this.x -= this.speed * dt;
    if (this.x <= WALL.x + WALL.width + 4) {
      this.dead = true;
      this.emit('breach', this);
      this.destroy();
    }
  }
}
