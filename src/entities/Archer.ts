import Phaser from 'phaser';
import { ARCHER } from '../config';

/** The player on the battlement. Placeholder shapes until the art pass. */
export class Archer extends Phaser.GameObjects.Container {
  private readonly bow: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene) {
    super(scene, ARCHER.x, ARCHER.y);
    const body = scene.add.rectangle(0, 0, 8, 16, 0x2e86c1);
    const head = scene.add.circle(0, -11, 4, 0xf0c39a);
    this.bow = scene.add.arc(0, -2, 9, -70, 70, false);
    this.bow.setStrokeStyle(2, 0x8e5b2e);
    this.bow.isFilled = false;
    this.add([body, head, this.bow]);
    scene.add.existing(this);
  }

  /** Where arrows leave the bow. */
  get nock(): { x: number; y: number } {
    return { x: this.x, y: this.y - 2 };
  }

  aim(angle: number, power: number): void {
    this.bow.rotation = angle;
    this.bow.setScale(1 - power * 0.25, 1);
  }
}
