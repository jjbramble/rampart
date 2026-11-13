import Phaser from 'phaser';
import { BOW, GROUND_Y } from '../config';
import type { Vec } from '../systems/ballistics';
import type { Enemy } from './Enemy';

/** One release of the bow. A volley shares a Shot, so it only counts as a miss if every arrow misses. */
export interface Shot {
  pending: number; // arrows not yet resolved
  hit: boolean;
}

/**
 * An arrow in flight. Points along its velocity; sticks in the ground when it lands.
 * Emits 'resolved' exactly once: when it lands, or when it is destroyed without landing.
 */
export class Arrow extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;
  landed = false;
  readonly hits = new Set<Enemy>(); // enemies already struck (overlap fires every frame)
  private resolved = false;

  constructor(scene: Phaser.Scene, x: number, y: number, v: Vec, readonly shot: Shot, public pierceLeft = 0) {
    super(scene, x, y, 12, 2, 0xe8d8a8);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setGravityY(BOW.gravity);
    this.body.setVelocity(v.x, v.y);
    this.body.setSize(4, 4); // small hit box at the tip area is forgiving enough at this scale
    this.rotation = Math.atan2(v.y, v.x);
    this.once(Phaser.GameObjects.Events.DESTROY, () => this.resolve());
  }

  preUpdate(): void {
    if (this.landed) return;
    const { x: vx, y: vy } = this.body.velocity;
    this.rotation = Math.atan2(vy, vx);
    if (this.y >= GROUND_Y) this.land();
    else if (this.x > this.scene.scale.gameSize.width + 40 || this.x < -40) this.destroy();
  }

  land(): void {
    this.landed = true;
    this.y = GROUND_Y;
    this.body.stop();
    this.body.setAllowGravity(false);
    this.body.enable = false;
    this.resolve();
    this.scene.tweens.add({ targets: this, alpha: 0, delay: 900, duration: 400, onComplete: () => this.destroy() });
  }

  private resolve(): void {
    if (this.resolved) return;
    this.resolved = true;
    this.emit('resolved', this);
  }
}
