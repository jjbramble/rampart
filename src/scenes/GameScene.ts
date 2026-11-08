import Phaser from 'phaser';
import { BOW, CASTLE, ENEMIES, GAME_H, GAME_W, GROUND_Y, WALL, WAVES } from '../config';
import { Archer } from '../entities/Archer';
import { Arrow } from '../entities/Arrow';
import { BatteringRam } from '../entities/BatteringRam';
import { Enemy } from '../entities/Enemy';
import { Flyer } from '../entities/Flyer';
import { GroundTroop } from '../entities/GroundTroop';
import { Shieldbearer } from '../entities/Shieldbearer';
import { drawPower, launchVelocity, positionAt } from '../systems/ballistics';
import { Score } from '../systems/Score';
import { EnemyKind, planWave, speedMultiplier } from '../systems/waves';

const WAVE_INTRO: Partial<Record<number, string>> = {
  2: 'kite-riders swoop in from above',
  3: 'shields stop flat shots: lob arrows onto them',
  4: 'a battering ram! keep shooting',
};

/** Draw/release bow, arcing arrows, waves of mixed siegers, score, castle HP. */
export class GameScene extends Phaser.Scene {
  private archer!: Archer;
  private arrows!: Phaser.GameObjects.Group;
  private enemies!: Phaser.GameObjects.Group;
  private preview!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private score!: Score;

  private drawingSince: number | null = null;
  private quiver: number = BOW.quiverSize;
  private reloadTimer = 0;
  private castleHp: number = CASTLE.maxHp;
  private wave = 0;
  private pendingSpawns = 0;     // enemies of this wave not yet on the field
  private waveActive = false;
  private gateHitThisWave = false;
  private over = false;

  constructor() {
    super('game');
  }

  create(): void {
    this.score = new Score();
    this.quiver = BOW.quiverSize;
    this.castleHp = CASTLE.maxHp;
    this.wave = 0;
    this.pendingSpawns = 0;
    this.waveActive = false;
    this.drawingSince = null;
    this.over = false;

    this.drawBackdrop();
    this.archer = new Archer(this);
    this.arrows = this.add.group();
    this.enemies = this.add.group();
    this.preview = this.add.graphics();
    this.hud = this.add.text(WALL.width + 8, 6, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f4f1de' });

    this.physics.add.overlap(this.arrows, this.enemies, (a, e) => this.onHit(a as Arrow, e as Enemy));

    this.input.on('pointerdown', () => {
      if (this.over) return this.scene.restart();
      if (this.quiver > 0) this.drawingSince = this.time.now;
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.release(p));
    this.input.on('gameout', () => (this.drawingSince = null));

    this.time.delayedCall(WAVES.firstDelayMs, () => this.startWave());
    this.updateHud();
  }

  update(_time: number, delta: number): void {
    if (this.over) return;
    this.reload(delta);
    this.drawPreview();
    if (this.waveActive && this.pendingSpawns === 0 && this.enemies.getChildren().every((e) => (e as Enemy).dead)) {
      this.endWave();
    }
  }

  // --- bow -------------------------------------------------------------------------------

  private release(p: Phaser.Input.Pointer): void {
    if (this.drawingSince === null || this.over) return;
    const power = drawPower(this.time.now - this.drawingSince);
    this.drawingSince = null;
    this.preview.clear();
    if (this.quiver <= 0) return;

    const from = this.archer.nock;
    const v = launchVelocity(from, { x: p.worldX, y: p.worldY }, power);
    const arrow = new Arrow(this, from.x, from.y, v);
    arrow.once('landed', () => !arrow.hitSomething && this.onMiss());
    this.arrows.add(arrow);
    this.quiver -= 1;
    this.updateHud();
  }

  private reload(delta: number): void {
    if (this.quiver >= BOW.quiverSize) {
      this.reloadTimer = 0;
      return;
    }
    this.reloadTimer += delta;
    if (this.reloadTimer >= BOW.reloadMs) {
      this.reloadTimer -= BOW.reloadMs;
      this.quiver += 1;
      this.updateHud();
    }
  }

  private drawPreview(): void {
    this.preview.clear();
    const p = this.input.activePointer;
    const from = this.archer.nock;
    const angle = Math.atan2(p.worldY - from.y, p.worldX - from.x);
    if (this.drawingSince === null) return this.archer.aim(angle, 0);

    const power = drawPower(this.time.now - this.drawingSince);
    this.archer.aim(angle, power);
    const v = launchVelocity(from, { x: p.worldX, y: p.worldY }, power);
    for (let i = 1; i <= BOW.previewSteps; i++) {
      const pt = positionAt(from, v, i * BOW.previewStepS);
      if (pt.y > GROUND_Y) break;
      this.preview.fillStyle(0xffffff, 0.75 - i * 0.045).fillRect(pt.x - 1, pt.y - 1, 2, 2);
    }
    // power meter above the archer
    this.preview.fillStyle(0x000000, 0.5).fillRect(from.x - 10, from.y - 24, 20, 3);
    this.preview.fillStyle(power >= 1 ? 0xf1c40f : 0xffffff).fillRect(from.x - 10, from.y - 24, 20 * power, 3);
  }

  // --- enemies & scoring -----------------------------------------------------------------

  private startWave(): void {
    if (this.over) return;
    this.wave += 1;
    this.gateHitThisWave = false;
    const plan = planWave(this.wave);
    this.pendingSpawns = plan.length;
    this.waveActive = true;
    this.banner(`WAVE ${this.wave}`, WAVE_INTRO[this.wave]);
    const mul = speedMultiplier(this.wave);
    for (const { kind, at } of plan) {
      this.time.delayedCall(WAVES.bannerMs + at, () => {
        if (this.over) return;
        this.spawn(kind, mul);
        this.pendingSpawns -= 1;
      });
    }
    this.updateHud();
  }

  private endWave(): void {
    this.waveActive = false;
    const clear = WAVES.clearBonus * this.wave;
    const flawless = this.gateHitThisWave ? 0 : WAVES.flawlessBonus;
    this.score.bonus(clear + flawless);
    this.quiver = BOW.quiverSize;
    this.banner('WAVE CLEARED', `+${clear}${flawless ? `   flawless +${flawless}` : ''}`);
    this.updateHud();
    this.time.delayedCall(WAVES.breakMs, () => this.startWave());
  }

  private spawn(kind: EnemyKind, speedMul: number): void {
    const [lo, hi] = ENEMIES[kind].speed;
    const speed = Phaser.Math.FloatBetween(lo, hi) * speedMul;
    const x = GAME_W + 16;
    const enemy =
      kind === 'flyer' ? new Flyer(this, x, speed)
      : kind === 'shield' ? new Shieldbearer(this, x, speed)
      : kind === 'ram' ? new BatteringRam(this, x, speed)
      : new GroundTroop(this, x, speed);
    enemy.once('breach', () => this.damageCastle(enemy.gateDamage));
    this.enemies.add(enemy);
  }

  private onHit(arrow: Arrow, enemy: Enemy): void {
    if (arrow.hitSomething || arrow.landed || enemy.dead) return;
    arrow.hitSomething = true;
    const v = { x: arrow.body.velocity.x, y: arrow.body.velocity.y };
    arrow.destroy();
    if (enemy.blocks(v)) {
      enemy.flash(0xf7dc6f);
      this.floatText(enemy.x, enemy.y - 12, 'blocked', '#d5dbdb');
      return this.onMiss();
    }
    if (enemy.damage(1)) {
      const pts = this.score.kill(enemy.bonus);
      this.floatText(enemy.x, enemy.y - 12, `+${pts}`);
    }
    this.updateHud();
  }

  private onMiss(): void {
    if (this.score.combo > 0) this.floatText(this.archer.x + 20, this.archer.y - 30, 'combo lost', '#e07a5f');
    this.score.miss();
    this.updateHud();
  }

  private damageCastle(amount: number): void {
    if (this.over) return;
    this.castleHp = Math.max(0, this.castleHp - amount);
    this.gateHitThisWave = true;
    this.cameras.main.shake(120, 0.006);
    this.updateHud();
    if (this.castleHp === 0) this.gameOver();
  }

  private gameOver(): void {
    this.over = true;
    this.waveActive = false;
    this.drawingSince = null;
    this.preview.clear();
    this.enemies.getChildren().forEach((e) => ((e as Enemy).body.enable = false));
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.55);
    this.add
      .text(GAME_W / 2, GAME_H / 2, `THE GATE HAS FALLEN\n\nWave ${this.wave}   Score ${this.score.points}   Best combo ${this.score.best}\n\nclick or tap to try again`, {
        fontFamily: 'monospace', fontSize: '12px', color: '#f4f1de', align: 'center',
      })
      .setOrigin(0.5);
  }

  // --- presentation ----------------------------------------------------------------------

  private drawBackdrop(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x6fa8dc, 0x6fa8dc, 0xcfe2f3, 0xcfe2f3).fillRect(0, 0, GAME_W, GROUND_Y);
    g.fillStyle(0x5d8a3a).fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
    // castle wall with crenellations
    g.fillStyle(0x8d8d8d).fillRect(WALL.x, WALL.top, WALL.width, GROUND_Y - WALL.top);
    g.fillStyle(0x7a7a7a);
    for (let x = WALL.x; x < WALL.width; x += 12) g.fillRect(x, WALL.top - 6, 7, 6);
    g.fillStyle(0x4a3424).fillRect(WALL.width - 22, GROUND_Y - 30, 18, 30); // gate
  }

  private banner(title: string, subtitle?: string): void {
    const t = this.add
      .text(GAME_W / 2 + WALL.width / 2, 70, subtitle ? `${title}\n${subtitle}` : title, {
        fontFamily: 'monospace', fontSize: '12px', color: '#f4f1de', align: 'center',
        stroke: '#1b1f2a', strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.chain({
      targets: t,
      tweens: [
        { alpha: 1, duration: 200 },
        { alpha: 0, delay: WAVES.bannerMs, duration: 400 },
      ],
      onComplete: () => t.destroy(),
    });
  }

  private floatText(x: number, y: number, msg: string, color = '#f9e79f'): void {
    const t = this.add.text(x, y, msg, { fontFamily: 'monospace', fontSize: '9px', color }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 14, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  private updateHud(): void {
    const arrows = '|'.repeat(this.quiver).padEnd(BOW.quiverSize, '.');
    this.hud.setText(
      `WAVE ${Math.max(1, this.wave)}  SCORE ${this.score.points}  x${this.score.multiplier}  COMBO ${this.score.combo}  ARROWS ${arrows}  GATE ${this.castleHp}/${CASTLE.maxHp}`,
    );
  }
}
