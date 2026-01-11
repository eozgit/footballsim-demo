import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MatchScene extends Scene {
  pitch!: GameObjects.Image;

  constructor() {
    super('MatchScene');
  }

  create(): void {
    this.pitch = this.add.image(525, 340, 'pitch');
    this.pitch.setDisplaySize(1050, 680);

    EventBus.emit('current-scene-ready', this);
  }
}
