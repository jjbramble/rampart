import Phaser from 'phaser';
import { ENEMIES } from '../config';
import { GroundTroop } from './GroundTroop';

/** A slow, armoured ram. Takes many arrows and smashes the gate hard if it arrives. */
export class BatteringRam extends GroundTroop {
  constructor(scene: Phaser.Scene, x: number, speed: number) {
    super(scene, x, speed, { w: 26, h: 12, color: 0x6e4b2a, ...ENEMIES.ram });
  }
}
