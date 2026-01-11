import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import SimWorker from '../simulation.worker?worker';
import { MatchDetails, Team } from '../../../../fse1/dist/lib/types';

export class MatchScene extends Scene {
  private worker!: Worker;
  private pitch!: GameObjects.Image;
  private ball!: GameObjects.Arc;

  // Throttle constant should match the worker's throttle for perfect smoothing
  private readonly SIM_STEP_MS = 100;

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

    this.worker.onmessage = (e: MessageEvent): void => {
      // Added 'monitor' to destructuring to catch the perf data
      const { type, state, monitor } = e.data as {
        type: string;
        state: MatchDetails;
        monitor?: { logicDuration: string };
      };

      if (type === 'STATE_UPDATED') {
        this.syncVisuals(state);

        // Use this for debugging the "throttle" performance
        // console.log(`Worker math took: ${monitor?.logicDuration}ms`);
      }
    };

    EventBus.emit('current-scene-ready', this);
  }

  private syncVisuals(state: MatchDetails): void {
    if (state.ball && state.ball.position) {
      const [engX, engY] = state.ball.position;

      // Coordinate Transformation (Portrait -> Landscape)
      const canvasX = engY;
      const canvasY = engX;

      // DECOUPLING STEP: Use Tweens instead of setPosition
      // This slides the ball to the new position over SIM_STEP_MS
      // so it looks smooth even though the worker only updates every 100ms.
      this.tweens.add({
        targets: this.ball,
        x: canvasX,
        y: canvasY,
        duration: this.SIM_STEP_MS,
        ease: 'Linear',
        overwrite: true, // Ensure new updates cancel previous tweens
      });
    }

    // You can apply the same logic to players here later
  }

  override update(): void {
    // HEARTBEAT DECOUPLED:
    // We no longer post 'PLAY_TICK' here.
    // The worker is now running its own autonomous loop.
    // This loop is now free for UI/Camera logic only.
  }
}
