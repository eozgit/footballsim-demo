import { AUTO, Game } from 'phaser';

import { Boot } from './scenes/Boot';
import { MatchScene } from './scenes/MatchScene';
import { Preloader } from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1050,
  height: 680,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scene: [Boot, Preloader, MatchScene],
};

const StartGame = (parent: string): Game => {
  return new Game({ ...config, parent });
};

export default StartGame;
