// src/game/entities/Player.ts
import { GameObjects, Scene } from 'phaser';

export interface PlayerStyle {
  body: number;
  detail: number;
}

export class Player extends GameObjects.Container {
  private circle: GameObjects.Arc;
  private label: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    shirtNumber: string,
    style: PlayerStyle,
    isGK: boolean
  ) {
    super(scene, x, y);

    const bodyColor = isGK ? 0x00ff00 : style.body;
    // GKs get black text for contrast, others get the team's detail color
    const textColor = isGK ? '#000000' : `#${style.detail.toString(16).padStart(6, '0')}`;
    const strokeColor = isGK ? 0x000000 : style.detail;

    // 1. Create the circle (the "body")
    this.circle = scene.add.circle(0, 0, 15, bodyColor).setStrokeStyle(3, strokeColor);

    // 2. Create the label (the "shirt number")
    this.label = scene.add
      .text(0, 0, shirtNumber, {
        fontSize: '14px',
        color: textColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 3. Add to container and scene
    this.add([this.circle, this.label]);
    this.setDepth(2);
    scene.add.existing(this);
  }

  /**
   * Smoothly moves the player to a new position using Phaser's tween system
   */
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
