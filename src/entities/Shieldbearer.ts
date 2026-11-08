import Phaser from 'phaser';
import { ENEMIES, SHIELD_PLUNGE_DEG } from '../config';
import { isPlunging } from '../systems/ballistics';
import { GroundTroop } from './GroundTroop';

/** Slow infantry behind a tower shield: flat shots glance off, so lob arrows down onto them. */
export class Shieldbearer extends GroundTroop {
  private readonly shield: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, speed: number) {
    super(scene, x, speed, { w: 10, h: 15, color: 0x5d6d7e, ...ENEMIES.shield });
    this.shield = scene.add.rectangle(x - 6, this.y, 3, 13, 0xb7950b); // held out toward the wall
    this.once(Phaser.GameObjects.Events.DESTROY, () => this.shield.destroy());
  }

  blocks(v: { x: number; y: number }): boolean {
    return !isPlunging(v, SHIELD_PLUNGE_DEG);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.active) this.shield.setPosition(this.x - 6, this.y).setAlpha(this.alpha).setAngle(this.angle);
  }
}
