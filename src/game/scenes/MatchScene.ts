import { Team } from 'footballsim';
import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { MatchManager } from '../MatchManager';
import { FieldEntityManager } from '../services/FieldEntityManager';
import { TeamProvider } from '../services/TeamProvider';
import { PITCH_STYLES, useSimulationStore } from '../../bridge/useSimulationStore';

export class MatchScene extends Scene {
  private manager!: MatchManager;
  private entities!: FieldEntityManager; // New delegated manager
  private teamProvider!: TeamProvider; // New
  private pitchSprite!: Phaser.GameObjects.Image;
  private readonly SIM_STEP_MS = 100;
  private fogLayer!: Phaser.GameObjects.Rectangle;
  private snowParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  constructor() {
    super('MatchScene');
  }

  preload(): void {
    this.load.json('colors', 'assets/colors.json');
    this.load.json('GS2025', 'assets/teams/GS1905.json');
    this.load.json('GS2000', 'assets/teams/GS_LEGEND_2000.json');
    PITCH_STYLES.forEach((style): void => {
      this.load.image(`pitch-${style}`, `assets/pitch/${style}.webp`);
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
    // src/game/scenes/MatchScene.ts

    // 1. Fog Layer (Stronger Alpha)
    // Increased from 0.15 to 0.4 for a "Blizzard" feel
    // Fog Layer: Increased to 0.6 opacity for a true "heavy weather" look
    this.fogLayer = this.add
      .rectangle(525, 340, 1050, 680, 0xffffff, 0.6)
      .setDepth(10)
      .setVisible(false);

    // 2. Snowfall (Increased Quantity and Size)
    this.snowParticles = this.add
      .particles(0, 0, 'pitch-snow', {
        x: { min: 0, max: 1050 },
        y: -20,
        emitZone: {
          type: 'random', // Phaser expects the literal 'random'
          source: new Phaser.Geom.Rectangle(0, 0, 1050, 1),
        } as unknown as Phaser.Types.GameObjects.Particles.ParticleEmitterRandomZoneConfig,
        speedY: { min: 60, max: 120 },
        speedX: { min: -15, max: 15 },
        scale: { start: 0.008, end: 0.004 }, // Reverted to small flakes
        alpha: { start: 0.9, end: 0.4 }, // More opaque for visibility
        lifespan: 7000,
        frequency: 25,
        emitting: false,
      })
      .setDepth(11);

    // Initial check based on current store state
    this.updateWeatherEffects(useSimulationStore.getState().pitchTexture);
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
  // Hook into your existing texture update method
  public updatePitchTexture(texture: string): void {
    if (this.pitchSprite) this.pitchSprite.setTexture(`pitch-${texture}`);
    this.updateWeatherEffects(texture);
  }

  private updateWeatherEffects(texture: string): void {
    const isSnow = texture.toLowerCase().includes('snow');
    this.fogLayer.setVisible(isSnow);

    if (isSnow) {
      this.snowParticles.start();
    } else {
      this.snowParticles.stop();
    }
  }
}
