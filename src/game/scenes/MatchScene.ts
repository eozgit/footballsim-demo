import { MatchDetails, Team } from 'footballsim';
import { Scene } from 'phaser';
import { toCanvasCoordinates } from '../../core/physics';
import { Ball } from '../entities/Ball';
import { Player } from '../entities/Player';
import { EventBus } from '../EventBus';
import { MatchManager } from '../MatchManager';
import { TeamProvider } from '../services/TeamProvider';

export class MatchScene extends Scene {
  private manager!: MatchManager;
  private ballEntity!: Ball;
  private teamProvider!: TeamProvider; // New
  private playerSprites: Map<number, Player> = new Map();

  private readonly SIM_STEP_MS = 100;

  constructor() {
    super('MatchScene');
  }

  preload(): void {
    this.load.json('colors', 'assets/colors.json');
    this.load.json('GS2025', 'assets/teams/GS1905.json');
    this.load.json('GS2000', 'assets/teams/GS_LEGEND_2000.json');
  }

  create(): void {
    this.add.image(525, 340, 'pitch').setDisplaySize(1050, 680);

    this.teamProvider = new TeamProvider(this.cache.json.get('colors') as Record<string, string>);

    this.ballEntity = new Ball(this);

    // Initialize manager and start worker
    this.manager = new MatchManager((state): void => this.syncVisuals(state));

    // CLEANUP LIGIC FOR HMR:
    // This listener ensures that when Vite swaps this code, the worker is killed.
    this.events.once('shutdown', (): void => {
      this.manager.terminate();
    });

    const teamA = this.cache.json.get('GS2025') as Team;
    const teamB = this.cache.json.get('GS2000') as Team;
    this.manager.initMatch(teamA, teamB);

    EventBus.emit('current-scene-ready', this);
  }

  private initPlayers(state: MatchDetails): void {
    const styles = this.teamProvider.getStyles(state);

    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      const style = styles.get(team.teamID)!;

      team.players.forEach((p): void => {
        const player = new Player(
          this,
          -100,
          -100,
          p.shirtNumber.toString(),
          style,
          p.position === 'GK'
        );
        this.playerSprites.set(p.playerID, player);
      });
    });
  }

  private syncVisuals(state: MatchDetails): void {
    if (this.playerSprites.size === 0) this.initPlayers(state);

    // Ball sync...
    if (state.ball?.position) {
      const [engX, engY, engZ] = state.ball.position;
      this.ballEntity.updatePosition(engX, engY, engZ ?? 0, this.SIM_STEP_MS);
    }

    // Player sync...
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      team.players.forEach((p): void => {
        const sprite = this.playerSprites.get(p.playerID);
        if (sprite && p.currentPOS[0] !== 'NP') {
          const { x, y } = toCanvasCoordinates(p.currentPOS[0], p.currentPOS[1]);
          sprite.updatePosition(x, y, this.SIM_STEP_MS);
        }
      });
    });
  }
}
