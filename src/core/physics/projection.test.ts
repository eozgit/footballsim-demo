import { describe, it, expect } from 'vitest';

import { toCanvasCoordinates, getBallScale, getBallVisualY } from './projection';

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
  it('should handle missing or undefined Z-axis gracefully', () => {
    // @ts-ignore: Testing runtime resilience for missing Z
    const visualY = getBallVisualY(100, undefined);

    expect(visualY).toBe(100);

    // @ts-ignore: Testing scale fallback
    const scale = getBallScale(null);

    expect(scale).toBe(1);
  });
});
