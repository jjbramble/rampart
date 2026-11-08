import Phaser from 'phaser';

/**
 * Base for every sieger: HP, hit flash, death, and the points it is worth.
 * Subclasses only decide how the enemy moves (override `move`).
 */
export abstract class Enemy extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;
  hp: number;
  readonly bonus: number;
  dead = false;
  private readonly baseColor: number;

  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: number, hp: number, bonus = 0) {
    super(scene, x, y, w, h, color);
    this.baseColor = color;
    this.hp = hp;
    this.bonus = bonus;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
  }

  /** Returns true if this hit killed it. */
  damage(amount = 1): boolean {
    if (this.dead) return false;
    this.hp -= amount;
    this.setFillStyle(0xffffff);
    this.scene.time.delayedCall(60, () => this.active && this.setFillStyle(this.baseColor));
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  protected die(): void {
    this.dead = true;
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this, angle: -90, alpha: 0, y: this.y + 4, duration: 350,
      onComplete: () => this.destroy(),
    });
  }

  preUpdate(_time: number, delta: number): void {
    if (!this.dead) this.move(delta / 1000);
  }

  protected abstract move(dt: number): void;
}
