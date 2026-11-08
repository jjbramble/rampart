import Phaser from 'phaser';
import { GAME_H, GAME_W, GROUND_Y, WALL } from '../config';
import { Records } from '../systems/records';

/** Title card: name, best run, how to play. Any click or key starts the siege. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x2c3e66, 0x2c3e66, 0xe59866, 0xe59866).fillRect(0, 0, GAME_W, GROUND_Y);
    g.fillStyle(0x3e5f2a).fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
    g.fillStyle(0x6d6d6d).fillRect(WALL.x, WALL.top, WALL.width, GROUND_Y - WALL.top);
    for (let x = WALL.x; x < WALL.width; x += 12) g.fillRect(x, WALL.top - 6, 7, 6);
    g.fillStyle(0x4a3424).fillRect(WALL.width - 22, GROUND_Y - 30, 18, 30);

    const cx = GAME_W / 2 + WALL.width / 2;
    const text = (y: number, msg: string, size: number, color = '#f4f1de') =>
      this.add.text(cx, y, msg, { fontFamily: 'monospace', fontSize: `${size}px`, color, align: 'center', stroke: '#1b1f2a', strokeThickness: 3 }).setOrigin(0.5);

    text(58, 'RAMPART', 32, '#f9e79f');
    text(92, 'hold the gate against the siege', 10);
    const best = new Records().best;
    if (best.score > 0) text(120, `best ${best.score}   furthest wave ${best.wave}`, 10, '#f5cba7');
    text(160, 'hold to draw  ·  release to fire\nlob arrows over shields', 9, '#d5dbdb');
    const go = text(205, 'click or tap to defend', 12);
    this.tweens.add({ targets: go, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    const start = () => this.scene.start('game');
    this.input.once('pointerup', start);
    this.input.keyboard?.once('keydown', start);
  }
}
