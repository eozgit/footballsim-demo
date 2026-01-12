import { describe, it, expect } from 'vitest';
import { toCanvasCoordinates, getBallScale } from './projection';

describe('Physics Projections', () => {
  it('should swap X and Y coordinates for the canvas', () => {
    const result = toCanvasCoordinates(100, 50);
    expect(result).toEqual({ x: 50, y: 100 });
  });

  it('should increase ball scale as engZ rises', () => {
    const scaleGround = getBallScale(0);
    const scaleAir = getBallScale(100);
    expect(scaleAir).toBeGreaterThan(scaleGround);
    expect(scaleAir).toBe(2);
  });
});
