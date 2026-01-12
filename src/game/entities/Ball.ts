// src/game/entities/Ball.ts
import { GameObjects, Scene } from 'phaser';
import { toCanvasCoordinates, getBallVisualY, getBallScale } from '../../core/physics';

export class Ball {
  private sprite: GameObjects.Arc;
  private shadow: GameObjects.Ellipse;
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;

    // Shadow (Lower depth)
    this.shadow = scene.add.ellipse(-100, -100, 16, 8, 0x000000, 0.3).setDepth(1);

    // Ball (Higher depth)
    this.sprite = scene.add.circle(-100, -100, 8, 0xffffff).setDepth(3).setStrokeStyle(2, 0x000000);
  }

  /**
   * Updates ball and shadow position based on 3D engine coordinates
   */
  public updatePosition(engX: number, engY: number, engZ: number = 0, duration: number): void {
    const { x, y } = toCanvasCoordinates(engX, engY);
    const visualY = getBallVisualY(y, engZ);
    const scale = getBallScale(engZ);

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

    // Shadow Tween (stays on pitch, fades as ball rises)
    this.scene.tweens.add({
      targets: this.shadow,
      x,
      y,
      alpha: Math.max(0.05, 0.3 - engZ / 150),
      scale: scale * 0.8,
      duration,
      ease: 'Linear',
      overwrite: true,
    });
  }
}
