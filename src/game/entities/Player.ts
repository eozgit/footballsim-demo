import { GameObjects, Scene } from 'phaser';
import { TeamStyle } from '../services/TeamProvider';

export interface PlayerStyle {
  body: number;
  detail: number;
  gk: number;
}

export class Player extends GameObjects.Container {
  private circle: GameObjects.Arc;
  private label: GameObjects.Text;
  private nameLabel: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    shirtNumber: string,
    playerName: string,
    style: PlayerStyle,
    isGK: boolean
  ) {
    super(scene, x, y);

    this.circle = scene.add.circle(0, 0, 15, 0xffffff);
    this.label = scene.add
      .text(0, 0, shirtNumber, {
        fontSize: '14px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.nameLabel = scene.add
      .text(0, 22, playerName, {
        // Removed .toUpperCase()
        fontSize: '11px',
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
        color: '#ffffff',
        // Reduced opacity from 'aa' (0.66) to '55' (0.33) for a more subtle look
        backgroundColor: '#00000055',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5);

    this.add([this.circle, this.label, this.nameLabel]);
    this.setDepth(2);

    // Apply initial style
    this.updateStyle(style, isGK);

    scene.add.existing(this);
  }
  public setDisplayName(visible: boolean): void {
    this.nameLabel.setVisible(visible);
  }

  /**
   * Updates the visual appearance of the player dynamically.
   */
  public updateStyle(style: TeamStyle, isGK: boolean): void {
    const bodyColor = isGK ? style.gk : style.body;
    // For GK contrast, we use black stroke/text or the detail color
    const strokeColor = isGK ? 0x000000 : style.detail;
    const textColor = isGK ? '#000000' : `#${style.detail.toString(16).padStart(6, '0')}`;

    this.circle.setFillStyle(bodyColor);
    this.circle.setStrokeStyle(3, strokeColor);
    this.label.setColor(textColor);
  }

  public updatePosition(x: number, y: number, duration: number): void {
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration,
      ease: 'Linear',
      overwrite: true,
    });
  }
}
