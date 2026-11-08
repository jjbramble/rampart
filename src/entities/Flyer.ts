import Phaser from 'phaser';
import { ENEMIES, WALL } from '../config';
import { Enemy, WALL_REACH_X } from './Enemy';

const DIVE_START = 90; // px before the wall where the flyer starts diving at the battlement

/** A kite-rider that bobs across the sky, then dives onto the battlement. */
export class Flyer extends Enemy {
  private readonly cruiseY: number;
  private t = Math.random() * Math.PI * 2;

  constructor(scene: Phaser.Scene, x: number, private readonly speed: number) {
    const y = Phaser.Math.Between(ENEMIES.flyer.minY, ENEMIES.flyer.maxY);
    super(scene, x, y, { w: 12, h: 6, color: 0x8e44ad, ...ENEMIES.flyer });
    this.cruiseY = y;
  }

  protected move(dt: number): void {
    this.t += dt * 3;
    this.x -= this.speed * dt;
    const bobY = this.cruiseY + Math.sin(this.t) * ENEMIES.flyer.bob;
    const dive = Phaser.Math.Clamp(1 - (this.x - WALL_REACH_X) / DIVE_START, 0, 1);
    this.y = Phaser.Math.Linear(bobY, WALL.top - 4, dive * dive);
    if (this.x - this.width / 2 <= WALL_REACH_X) this.reachWall();
  }
}
