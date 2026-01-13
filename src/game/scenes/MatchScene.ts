import { Team } from 'footballsim';
import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { MatchManager } from '../MatchManager';
import { FieldEntityManager } from '../services/FieldEntityManager';
import { TeamProvider } from '../services/TeamProvider';
import { useSimulationStore } from '../../bridge/useSimulationStore';

export class MatchScene extends Scene {
  private manager!: MatchManager;
  private entities!: FieldEntityManager; // New delegated manager
  private teamProvider!: TeamProvider; // New
  private pitchSprite!: Phaser.GameObjects.Image;
  private readonly SIM_STEP_MS = 100;

  constructor() {
    super('MatchScene');
  }

  preload(): void {
    this.load.json('colors', 'assets/colors.json');
    this.load.json('GS2025', 'assets/teams/GS1905.json');
    this.load.json('GS2000', 'assets/teams/GS_LEGEND_2000.json');
    const textures = ['default', 'checkered', 'crater', 'grass', 'snow', 'wear'];
    textures.forEach((t): void => {
      this.load.image(`pitch-${t}`, `assets/pitch/${t}.webp`);
    });
  }

  create(): void {
    const currentTexture = useSimulationStore.getState().pitchTexture;
    this.pitchSprite = this.add
      .image(525, 340, `pitch-${currentTexture}`)
      .setDisplaySize(1050, 680);

    this.teamProvider = new TeamProvider(this.cache.json.get('colors') as Record<string, string>);
    this.entities = new FieldEntityManager(this, this.teamProvider);

    // Standard instantiation (no useMemo)
    this.manager = new MatchManager((state): void => {
      this.entities.sync(state, this.SIM_STEP_MS);
    });

    this.events.once('shutdown', (): void => {
      this.manager.terminate();
    });

    const teamA = this.cache.json.get('GS2025') as Team;
    const teamB = this.cache.json.get('GS2000') as Team;
    this.manager.initMatch(teamA, teamB);

    EventBus.emit('current-scene-ready', this);
  }

  // Add this helper for external control
  public toggleActive(playing: boolean): void {
    if (playing) {
      this.manager.resume();
    } else {
      this.manager.pause();
    }
  }
  /**
   * External bridge for the React UI to control simulation flow
   */
  public updateSimulationStatus(isPlaying: boolean): void {
    if (!this.manager) return;

    if (isPlaying) {
      this.manager.resume();
    } else {
      this.manager.pause();
    }
  }
  public updatePitchTexture(texture: string): void {
    if (this.pitchSprite) {
      this.pitchSprite.setTexture(`pitch-${texture}`);
    }
  }
}
