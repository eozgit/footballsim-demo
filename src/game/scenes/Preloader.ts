import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init(): void {
    this.add.image(624, 416, 'pitch');
  }

  preload(): void {
    this.load.setPath('assets');
  }

  create(): void {
    this.scene.start('MatchScene');
  }
}
