import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.setPath(import.meta.env.BASE_URL); // Add this
    this.load.image('pitch', 'assets/pitch/default.png');
  }

  create(): void {
    this.scene.start('Preloader');
  }
}
