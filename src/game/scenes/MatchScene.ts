import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
// This import creates the 'SimWorker' constructor locally for this file
import SimWorker from '../simulation.worker?worker';
import { MatchDetails, Team } from '../../../../fse1/dist/lib/types';

export class MatchScene extends Scene {
  // Define properties to resolve "Property does not exist" errors
  private worker!: Worker;
  private pitch!: GameObjects.Image;
  private ball!: GameObjects.Arc;

  constructor() {
    super('MatchScene');
  }

  preload(): void {
    this.load.json('GS2025', 'assets/teams/GS1905.json');
    this.load.json('GS2000', 'assets/teams/GS_LEGEND_2000.json');
  }

  create(): void {
    this.pitch = this.add.image(525, 340, 'pitch');
    this.pitch.setDisplaySize(1050, 680);

    this.ball = this.add.circle(-100, -100, 8, 0xff0000);
    this.add.existing(this.ball);

    this.worker = new SimWorker();

    const teamA = this.cache.json.get('GS2025') as Team;
    const teamB = this.cache.json.get('GS2000') as Team;

    this.worker.postMessage({
      type: 'INIT_MATCH',
      data: { teamA, teamB },
    });

    // Explicitly type 'e' to avoid "implicitly has an 'any' type" error
    this.worker.onmessage = (e: MessageEvent): void => {
      const { type, state } = e.data as { type: string; state: MatchDetails };
      if (type === 'STATE_UPDATED') {
        this.syncVisuals(state);
      }
    };

    // This must be inside create() to avoid syntax errors
    EventBus.emit('current-scene-ready', this);
  }

  private syncVisuals(state: MatchDetails): void {
    if (state.ball && state.ball.position) {
      // Engine coords (Portrait): [x: 0-680, y: 0-1050]
      const [engX, engY] = state.ball.position;

      // Phaser coords (Landscape): [x: 0-1050, y: 0-680]
      // Rotate 90 degrees:
      // The engine's Y (0 to 1050) maps to Phaser's X
      // The engine's X (0 to 680) maps to Phaser's Y

      const canvasX = engY;
      const canvasY = engX;

      // If the ball should move from left-to-right instead of right-to-left,
      // use: const canvasX = 1050 - engY;

      this.ball.setPosition(canvasX, canvasY);
    }
  }

  override update(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'PLAY_TICK' });
    }
  }
}
