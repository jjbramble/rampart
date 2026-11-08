import Phaser from 'phaser';
import { ENEMIES, GROUND_Y } from '../config';
import { Enemy, EnemyStats, WALL_REACH_X } from './Enemy';

const STATS: EnemyStats = { w: 8, h: 14, color: 0xc0392b, ...ENEMIES.troop };

/** Infantry that marches at the wall and damages the gate on arrival. */
export class GroundTroop extends Enemy {
  constructor(scene: Phaser.Scene, x: number, protected readonly speed: number, stats: EnemyStats = STATS) {
    super(scene, x, GROUND_Y - stats.h / 2, stats);
  }

  protected move(dt: number): void {
    this.x -= this.speed * dt;
    if (this.x - this.width / 2 <= WALL_REACH_X) this.reachWall();
  }
}
