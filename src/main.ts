import Phaser from 'phaser';
import { GAME_H, GAME_W } from './config';
import { GameScene } from './scenes/GameScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#1b1f2a',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { activePointers: 2 },
  scene: [GameScene],
});

// Handy for poking at the game from the console / automated checks during development.
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
