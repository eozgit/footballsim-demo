// src/game/entities/Ball.ts
import { GameObjects, Scene } from 'phaser';
import { toCanvasCoordinates, getBallVisualY, getBallScale } from '../../core/physics';

export class Ball {
  private sprite: GameObjects.Arc;
  private shadow: GameObjects.Ellipse;
  private scene: Scene;

  // DIAGNOSTIC ONLY: Remove after verifying Z-axis physics
  private debugLabel: GameObjects.Text;

  constructor(scene: Scene) {
    this.scene = scene;

    // Shadow (Lower depth)
    this.shadow = scene.add.ellipse(-100, -100, 16, 8, 0x000000, 0.3).setDepth(1);

    // Ball (Higher depth)
    this.sprite = scene.add.circle(-100, -100, 8, 0xffffff).setDepth(3).setStrokeStyle(2, 0x000000);

    // TODO: DIAGNOSTIC ONLY - Display Z-coordinate near the ball
    this.debugLabel = scene.add
      .text(-100, -100, 'Z: 0', {
        fontSize: '12px',
        color: '#ffff00',
        backgroundColor: '#000000',
      })
      .setDepth(10);
  }

  /**
   * Updates ball and shadow position based on 3D engine coordinates
   */
  public updatePosition(engX: number, engY: number, engZ: number = 0, duration: number): void {
    const { x, y } = toCanvasCoordinates(engX, engY);
    const visualY = getBallVisualY(y, engZ);
    const scale = getBallScale(engZ);

    // 1. Performance Optimization: Hide shadow if on ground
    const isOnGround = engZ <= 0.1;
    this.shadow.setVisible(!isOnGround);

    // 2. Light Source Math:
    // Offset the shadow by a fraction of Z to simulate a light source
    const shadowOffsetX = engZ * 1.5;
    const shadowOffsetY = engZ * 1.2;

    // Ball Tween (lifts on Y based on Z)
    this.scene.tweens.add({
      targets: this.sprite,
      x,
      y: visualY,
      scale,
      duration,
      ease: 'Linear',
      overwrite: true,
    });

    if (!isOnGround) {
      this.scene.tweens.add({
        targets: this.shadow,
        x: x + shadowOffsetX,
        y: visualY + shadowOffsetY,
        scale: scale * 0.8,
        duration,
        ease: 'Linear',
        overwrite: true,
      });
    }

    // TODO: DIAGNOSTIC ONLY - Update debug label position and text
    this.scene.tweens.add({
      targets: this.debugLabel,
      x: x + 15, // Offset slightly to the right
      y: visualY - 15, // Offset slightly above
      duration,
      ease: 'Linear',
      overwrite: true,
      onUpdate: (): void => {
        this.debugLabel.setText(`Z: ${engZ.toFixed(2)}`);
      },
    });
  }
}
