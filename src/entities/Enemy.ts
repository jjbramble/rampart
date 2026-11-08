import Phaser from 'phaser';
import { WALL } from '../config';

export interface EnemyStats {
  w: number;
  h: number;
  color: number;
  hp: number;
  bonus: number;       // extra points on kill
  gateDamage: number;  // damage dealt when it reaches the wall
}

/** x at which an enemy has reached the wall. */
export const WALL_REACH_X = WALL.x + WALL.width + 4;

/**
 * Base for every sieger: HP (with a bar for tough ones), hit flash, death, reaching the wall,
 * and the points it is worth. Subclasses only decide how the enemy moves (override `move`).
 */
export abstract class Enemy extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;
  hp: number;
  readonly maxHp: number;
  readonly bonus: number;
  readonly gateDamage: number;
  dead = false;
  private readonly baseColor: number;
  private readonly hpBar?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, stats: EnemyStats) {
    super(scene, x, y, stats.w, stats.h, stats.color);
    this.baseColor = stats.color;
    this.hp = this.maxHp = stats.hp;
    this.bonus = stats.bonus;
    this.gateDamage = stats.gateDamage;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    if (this.maxHp > 1) {
      this.hpBar = scene.add.rectangle(0, 0, stats.w, 2, 0x2ecc71).setOrigin(0, 0.5);
      this.once(Phaser.GameObjects.Events.DESTROY, () => this.hpBar?.destroy());
    }
  }

  /** Arrows this enemy shrugs off. Shields override this. */
  blocks(_arrowVelocity: { x: number; y: number }): boolean {
    return false;
  }

  /** Returns true if this hit killed it. */
  damage(amount = 1): boolean {
    if (this.dead) return false;
    this.hp -= amount;
    this.flash(0xffffff);
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  flash(color: number): void {
    this.setFillStyle(color);
    this.scene.time.delayedCall(60, () => this.active && this.setFillStyle(this.baseColor));
  }

  protected die(): void {
    this.dead = true;
    this.body.enable = false;
    this.hpBar?.setVisible(false);
    this.scene.tweens.add({
      targets: this, angle: -90, alpha: 0, y: this.y + 4, duration: 350,
      onComplete: () => this.destroy(),
    });
  }

  /** Called by subclasses when they arrive at the wall: hurt the gate and leave. */
  protected reachWall(): void {
    this.dead = true;
    this.emit('breach', this);
    this.destroy();
  }

  preUpdate(_time: number, delta: number): void {
    if (this.dead) return;
    this.move(delta / 1000);
    if (this.active && this.hpBar) {
      this.hpBar.setPosition(this.x - this.width / 2, this.y - this.height / 2 - 4);
      this.hpBar.width = (this.width * Math.max(0, this.hp)) / this.maxHp;
    }
  }

  protected abstract move(dt: number): void;
}
