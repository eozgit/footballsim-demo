import type { Scene } from 'phaser';
import { GameObjects } from 'phaser';

import type { TeamStyle } from '../services/TeamProvider';

export interface PlayerStyle {
  body: number;
  detail: number;
  gk: number;
}

export class Player extends GameObjects.Container {
  private circle: GameObjects.Arc;
  private label: GameObjects.Text;
  private nameLabel: GameObjects.Text;
  private intentMarker: GameObjects.Arc;
  private intentLine: GameObjects.Graphics;
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
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5);

    this.nameLabel = scene.add
      .text(0, 26, playerName, {
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
    // Create the destination marker (team color applied later)
    this.intentMarker = scene.add.circle(0, 0, 4, 0xffffff, 0.6);
    this.intentMarker.setDepth(1);

    // Create the graphics object for the line
    this.intentLine = scene.add.graphics();
    this.intentLine.setDepth(1);
    this.add([this.circle, this.label, this.nameLabel]);
    this.setDepth(2);

    // Apply initial style
    this.updateStyle(style, isGK);

    scene.add.existing(this);
    scene.add.existing(this.intentMarker);
    this.intentMarker.setVisible(false);
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
  public updateIntent(destX: number, destY: number, color: number, visible: boolean): void {
    this.intentMarker.setVisible(visible);
    this.intentLine.setVisible(visible);

    if (visible) {
      this.intentMarker.setPosition(destX, destY);
      this.intentMarker.setFillStyle(color, 0.6);

      // Draw dashed line from current player position to intentPOS
      this.intentLine.clear();
      this.intentLine.lineStyle(1.5, color, 0.4);

      // Phaser doesn't have a native 'dashed' line method,
      // so we use a simple segment loop
      const startX = this.x;
      const startY = this.y;

      this.drawDashedLine(startX, startY, destX, destY);
    }
  }

  private drawDashedLine(x1: number, y1: number, x2: number, y2: number): void {
    const dashLength = 5;
    const gapLength = 3;
    const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    const numDashes = Math.floor(distance / (dashLength + gapLength));

    for (let i = 0; i < numDashes; i++) {
      const tStart = (i * (dashLength + gapLength)) / distance;
      const tEnd = (i * (dashLength + gapLength) + dashLength) / distance;

      const px1 = Phaser.Math.Interpolation.Linear([x1, x2], tStart);
      const py1 = Phaser.Math.Interpolation.Linear([y1, y2], tStart);
      const px2 = Phaser.Math.Interpolation.Linear([x1, x2], tEnd);
      const py2 = Phaser.Math.Interpolation.Linear([y1, y2], tEnd);

      this.intentLine.lineBetween(px1, py1, px2, py2);
    }
  }

  public destroy(fromScene?: boolean): void {
    this.intentMarker.destroy();
    this.intentLine.destroy();
    super.destroy(fromScene);
  }
}
