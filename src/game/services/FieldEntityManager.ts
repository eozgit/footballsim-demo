import { MatchDetails } from 'footballsim';
import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import { TeamProvider } from './TeamProvider';
import { toCanvasCoordinates } from '../../core/physics';

export class FieldEntityManager {
  private scene: Scene;
  private teamProvider: TeamProvider;
  private players: Map<number, Player> = new Map();
  private ball: Ball;

  constructor(scene: Scene, teamProvider: TeamProvider) {
    this.scene = scene;
    this.teamProvider = teamProvider;
    this.ball = new Ball(scene);
  }

  public sync(state: MatchDetails, stepMs: number): void {
    // 1. Initialize players if they don't exist
    if (this.players.size === 0) {
      this.initPlayers(state);
    }

    // 2. Sync Ball
    if (state.ball?.position) {
      const [engX, engY, engZ] = state.ball.position;
      this.ball.updatePosition(engX, engY, engZ ?? 0, stepMs);
    }

    // 3. Sync Players
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      team.players.forEach((p): void => {
        const sprite = this.players.get(p.playerID);
        if (sprite && p.currentPOS[0] !== 'NP') {
          const { x, y } = toCanvasCoordinates(p.currentPOS[0], p.currentPOS[1]);
          sprite.updatePosition(x, y, stepMs);
        }
      });
    });
  }

  private initPlayers(state: MatchDetails): void {
    const styles = this.teamProvider.getStyles(state);

    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      const style = styles.get(team.teamID)!;
      team.players.forEach((p): void => {
        const player = new Player(
          this.scene,
          -100,
          -100,
          p.shirtNumber.toString(),
          style,
          p.position === 'GK'
        );
        this.players.set(p.playerID, player);
      });
    });
  }
}
