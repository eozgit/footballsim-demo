// src/core/physics/projection.ts

/**
 * Maps engine coordinates to canvas coordinates.
 * Current implementation: Swaps X and Y.
 */
export const toCanvasCoordinates = (engX: number, engY: number): { x: number; y: number } => {
  return {
    x: engY,
    y: engX,
  };
};

/**
 * Visual lift calculation for the ball.
 */
export const getBallVisualY = (engX: number, engZ: number): number => {
  return engX - (engZ || 0);
};

export const getBallScale = (engZ: number): number => {
  return 1 + (engZ || 0) / 100;
};
