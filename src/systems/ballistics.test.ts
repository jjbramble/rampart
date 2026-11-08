import { describe, expect, it } from 'vitest';
import { BOW } from '../config';
import { drawPower, isPlunging, launchVelocity, positionAt } from './ballistics';

describe('ballistics', () => {
  it('clamps draw power to 0..1', () => {
    expect(drawPower(-10)).toBe(0);
    expect(drawPower(BOW.fullDrawMs / 2)).toBeCloseTo(0.5);
    expect(drawPower(BOW.fullDrawMs * 3)).toBe(1);
  });

  it('aims toward the target with speed scaled by power', () => {
    const v = launchVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 1);
    expect(v.x).toBeCloseTo(BOW.maxSpeed);
    expect(v.y).toBeCloseTo(0);
    const slow = launchVelocity({ x: 0, y: 0 }, { x: 0, y: -10 }, 0);
    expect(slow.y).toBeCloseTo(-BOW.minSpeed);
  });

  it('follows a gravity arc', () => {
    const p = positionAt({ x: 0, y: 0 }, { x: 100, y: -100 }, 1, 200);
    expect(p).toEqual({ x: 100, y: 0 });
  });

  it('detects plunging shots by descent angle', () => {
    expect(isPlunging({ x: 100, y: -50 }, 30)).toBe(false); // still rising
    expect(isPlunging({ x: 100, y: 20 }, 30)).toBe(false);  // flat
    expect(isPlunging({ x: 100, y: 100 }, 30)).toBe(true);  // 45° down
    expect(isPlunging({ x: -100, y: 100 }, 30)).toBe(true); // direction doesn't matter
  });
});
