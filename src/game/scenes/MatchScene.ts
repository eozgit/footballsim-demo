import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import SimWorker from '../simulation.worker?worker';
import { MatchDetails, Team } from '../../../../fse1/dist/lib/types';
import { useSimulationStore } from '../../bridge/useSimulationStore';

export class MatchScene extends Scene {
  private worker!: Worker;
  private pitch!: GameObjects.Image;
  private ball!: GameObjects.Arc;
  private playerSprites: Map<number, GameObjects.Container> = new Map();
  private ballShadow!: GameObjects.Ellipse;
  private colorMap: Record<string, string> = {};
  private teamStyle: Map<number, { body: number; detail: number }> = new Map();

  private readonly SIM_STEP_MS = 100;

  constructor() {
    super('MatchScene');
  }

  preload(): void {
    this.load.json('colors', 'assets/colors.json'); // Load the map
    this.load.json('GS2025', 'assets/teams/GS1905.json');
    this.load.json('GS2000', 'assets/teams/GS_LEGEND_2000.json');
  }

  create(): void {
    this.pitch = this.add.image(525, 340, 'pitch');
    this.pitch.setDisplaySize(1050, 680);

    // Ball: Initialized as White with Black stroke
    this.ballShadow = this.add.ellipse(-100, -100, 16, 8, 0x000000, 0.3).setDepth(1);
    this.ball = this.add.circle(-100, -100, 8, 0xffffff).setDepth(3);
    this.ball.setStrokeStyle(2, 0x000000);
    this.add.existing(this.ball);

    // Shadow: Initialized once
    this.ballShadow = this.add.ellipse(-100, -100, 16, 8, 0x000000, 0.3);

    this.worker = new SimWorker();
    const teamA = this.cache.json.get('GS2025') as Team;
    const teamB = this.cache.json.get('GS2000') as Team;

    this.worker.postMessage({ type: 'INIT_MATCH', data: { teamA, teamB } });

    this.worker.onmessage = (e: MessageEvent): void => {
      const { type, state } = e.data as { type: string; state: MatchDetails };
      if (type === 'STATE_UPDATED') {
        this.syncVisuals(state);

        // Push the new logs to the React store
        if (state.iterationLog && state.iterationLog.length > 0) {
          useSimulationStore.getState().appendLogs(state.iterationLog);
        }
      }
    };

    EventBus.emit('current-scene-ready', this);
  }

  private getHexColor(name: string): number {
    const hex = this.colorMap[name];

    if (!hex) {
      throw new Error(
        `CRITICAL ERROR: Color "${name}" is not defined in public/assets/colors.json! Please add it.`
      );
    }

    return parseInt(hex, 16);
  }

  private setTeamStyles(state: MatchDetails): void {
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      // 1. Create the initial weighted pool
      const pool = [
        { name: team.primaryColour, weight: 5 },
        { name: team.secondaryColour, weight: 4 },
        { name: team.awayColour, weight: 1 },
      ].filter((c): boolean => !!c.name);

      // Helper function for weighted random selection
      const pickFromPool = (currentPool: typeof pool): { name: string; weight: number } => {
        const totalWeight = currentPool.reduce((sum, item): number => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of currentPool) {
          if (random < item.weight) return item;
          random -= item.weight;
        }
        return currentPool[0];
      };

      // 2. Pick Color 1 (Body)
      const first = pickFromPool(pool);

      // 3. Remove Color 1 from the pool to pick Color 2 (Detail)
      const remainingPool = pool.filter((c): boolean => c.name !== first.name);

      let second;
      if (remainingPool.length > 0) {
        second = pickFromPool(remainingPool);
      } else {
        // Fallback if team only provided one color in JSON
        const isWhite = first.name.toLowerCase() === 'white';
        second = { name: isWhite ? 'Black' : 'White', weight: 0 };
      }

      this.teamStyle.set(team.teamID, {
        body: this.getHexColor(first.name),
        detail: this.getHexColor(second.name),
      });

      console.log(`Kit selection for ${team.name}: Body=${first.name}, Detail=${second.name}`);
    });
  }

  private initPlayers(state: MatchDetails): void {
    this.colorMap = this.cache.json.get('colors') as Record<string, string>;
    this.setTeamStyles(state); // Set team-wide colors first

    const teams = [state.kickOffTeam, state.secondTeam];
    const gkColors = ['LimeGreen', 'DeepSkyBlue', 'Gold', 'HotPink'];

    teams.forEach((team): void => {
      const style = this.teamStyle.get(team.teamID)!;

      team.players.forEach((player): void => {
        const isGK = player.position === 'GK';
        const bodyColor = isGK
          ? this.getHexColor(gkColors[Math.floor(Math.random() * gkColors.length)])
          : style.body;
        const detailColor = isGK ? 0x000000 : style.detail;

        const circle = this.add.circle(0, 0, 15, bodyColor);
        circle.setStrokeStyle(3, detailColor);

        const text = this.add
          .text(0, 0, player.shirtNumber.toString(), {
            fontSize: '14px',
            color: `#${detailColor.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        const container = this.add.container(-100, -100, [circle, text]);
        container.setDepth(2); // Ensure players are above the pitch
        this.playerSprites.set(player.playerID, container);
      });
    });
  }

  private syncVisuals(state: MatchDetails): void {
    if (this.playerSprites.size === 0) this.initPlayers(state);

    // Ball & Shadow Logic with Z-Height
    if (state.ball?.position) {
      const [engX, engY, engZ] = state.ball.position;
      const ballZ = engZ ?? 0;
      const canvasX = engY;
      const canvasY = engX;

      const heightScale = 1 + ballZ / 100;

      // Ball Tweens (Lift and Scale)
      this.tweens.add({
        targets: this.ball,
        x: canvasX,
        y: canvasY - ballZ,
        scale: heightScale,
        duration: this.SIM_STEP_MS,
        ease: 'Linear',
        overwrite: true,
      });

      // Shadow Tweens (Stays on ground, fades with height)
      this.tweens.add({
        targets: this.ballShadow,
        x: canvasX,
        y: canvasY,
        alpha: Math.max(0, 0.4 - ballZ / 200),
        scale: heightScale * 0.8,
        duration: this.SIM_STEP_MS,
        ease: 'Linear',
        overwrite: true,
      });
    }

    // Players positioning (using containers)
    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      team.players.forEach((p): void => {
        const container = this.playerSprites.get(p.playerID);
        if (container) {
          this.tweens.add({
            targets: container,
            x: p.currentPOS[1],
            y: p.currentPOS[0],
            duration: this.SIM_STEP_MS,
            ease: 'Linear',
            overwrite: true,
          });
        }
      });
    });
  }
}
