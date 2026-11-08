import Phaser from 'phaser';
import { BOW, GROUND_Y } from '../config';
import type { Vec } from '../systems/ballistics';

/** An arrow in flight. Points along its velocity; sticks in the ground when it lands. */
export class Arrow extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;
  hitSomething = false;
  landed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, v: Vec) {
    super(scene, x, y, 12, 2, 0xe8d8a8);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setGravityY(BOW.gravity);
    this.body.setVelocity(v.x, v.y);
    this.body.setSize(4, 4); // small hit box at the tip area is forgiving enough at this scale
    this.rotation = Math.atan2(v.y, v.x);
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
    this.emit('landed', this);
    this.scene.tweens.add({ targets: this, alpha: 0, delay: 900, duration: 400, onComplete: () => this.destroy() });
  }
}
