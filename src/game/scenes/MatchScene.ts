import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { toCanvasCoordinates, getBallVisualY, getBallScale } from '../../core/physics';
import { MatchManager } from '../MatchManager';
import { Team, MatchDetails } from 'footballsim';

export class MatchScene extends Scene {
  private manager!: MatchManager;
  private ball!: GameObjects.Arc;
  private playerSprites: Map<number, GameObjects.Container> = new Map();
  private ballShadow!: GameObjects.Ellipse;
  private teamStyle: Map<number, { body: number; detail: number }> = new Map();

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
    this.ballShadow = this.add.ellipse(-100, -100, 16, 8, 0x000000, 0.3).setDepth(1);
    this.ball = this.add.circle(-100, -100, 8, 0xffffff).setDepth(3).setStrokeStyle(2, 0x000000);

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

  private getHexColor(name: string): number {
    const hex = (this.cache.json.get('colors') as Record<string, string>)[name];
    return hex ? parseInt(hex, 16) : 0xffffff;
  }

  private setTeamStyles(state: MatchDetails): void {
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      const pool = [
        { name: team.primaryColour, weight: 5 },
        { name: team.secondaryColour, weight: 4 },
      ].filter((c): boolean => !!c.name);

      this.teamStyle.set(team.teamID, {
        body: this.getHexColor(pool[0]?.name || 'White'),
        detail: this.getHexColor(pool[1]?.name || 'Black'),
      });
    });
  }

  private initPlayers(state: MatchDetails): void {
    this.setTeamStyles(state);
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      const style = this.teamStyle.get(team.teamID)!;
      team.players.forEach((player): void => {
        const bodyColor = player.position === 'GK' ? 0x00ff00 : style.body;
        const circle = this.add.circle(0, 0, 15, bodyColor).setStrokeStyle(3, style.detail);
        const text = this.add
          .text(0, 0, player.shirtNumber.toString(), {
            fontSize: '14px',
            color: '#000',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        const container = this.add.container(-100, -100, [circle, text]).setDepth(2);
        this.playerSprites.set(player.playerID, container);
      });
    });
  }

  private syncVisuals(state: MatchDetails): void {
    if (this.playerSprites.size === 0) this.initPlayers(state);

    // Ball & Shadow
    if (state.ball?.position) {
      const [engX, engY, engZ] = state.ball.position;
      const { x, y } = toCanvasCoordinates(engX, engY);
      const visualY = getBallVisualY(y, engZ ?? 0);
      const scale = getBallScale(engZ ?? 0);

      this.tweens.add({
        targets: this.ball,
        x,
        y: visualY,
        scale,
        duration: this.SIM_STEP_MS,
        overwrite: true,
      });
      this.tweens.add({
        targets: this.ballShadow,
        x,
        y,
        alpha: 0.3,
        scale: scale * 0.8,
        duration: this.SIM_STEP_MS,
        overwrite: true,
      });
    }

    // Players
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      team.players.forEach((p): void => {
        const container = this.playerSprites.get(p.playerID);
        if (container && p.currentPOS[0] !== 'NP') {
          const { x, y } = toCanvasCoordinates(p.currentPOS[0], p.currentPOS[1]);
          this.tweens.add({
            targets: container,
            x,
            y,
            duration: this.SIM_STEP_MS,
            overwrite: true,
          });
        }
      });
    });
  }
}
