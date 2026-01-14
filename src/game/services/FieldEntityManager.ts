import { MatchDetails } from 'footballsim';
import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import { TeamProvider } from './TeamProvider';
import { toCanvasCoordinates } from '../../core/physics';
import { useSimulationStore } from '../../bridge/useSimulationStore';

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
    // 1. Initialize players and Store Kits if they don't exist
    if (this.players.size === 0) {
      this.initPlayers(state);
    }

    // 2. Sync Ball
    if (state.ball?.position) {
      const [engX, engY, engZ] = state.ball.position;
      this.ball.updatePosition(engX, engY, engZ ?? 0, stepMs);
    }

    const store = useSimulationStore.getState();
    const isSnow = store.pitchTexture.toLowerCase().includes('snow');
    this.ball.setSnowMode(isSnow);

    // 3. Sync Players & Their Appearance
    const { kitStyles } = store;

    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      // Determine which style to use from the store
      const style = team.teamID === state.kickOffTeam.teamID ? kitStyles.home : kitStyles.away;

      team.players.forEach((p): void => {
        const sprite = this.players.get(p.playerID);
        if (sprite) {
          // Update appearance (reactive to store changes)
          if (style) {
            sprite.updateStyle(style, p.position === 'GK');
          }

          // Update position
          if (p.currentPOS[0] !== 'NP') {
            const { x, y } = toCanvasCoordinates(p.currentPOS[0], p.currentPOS[1]);
            sprite.updatePosition(x, y, stepMs);
          }
        }
      });
    });
  }

  private initPlayers(state: MatchDetails): void {
    // Generate initial randomized kits and save to store
    const kits = this.teamProvider.generateKitPair(state);
    useSimulationStore.getState().setKitStyles(kits.home, kits.away);

    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      const style = team.teamID === state.kickOffTeam.teamID ? kits.home : kits.away;

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
