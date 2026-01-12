import { Team } from 'footballsim';
import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { MatchManager } from '../MatchManager';
import { FieldEntityManager } from '../services/FieldEntityManager';
import { TeamProvider } from '../services/TeamProvider';

export class MatchScene extends Scene {
  private manager!: MatchManager;
  private entities!: FieldEntityManager; // New delegated manager
  private teamProvider!: TeamProvider; // New

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

    this.entities = new FieldEntityManager(this, this.teamProvider);

    // Initialize manager and start worker
    this.manager = new MatchManager((state): void => {
      this.entities.sync(state, this.SIM_STEP_MS);
    });

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
}
