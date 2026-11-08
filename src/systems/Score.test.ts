import { describe, expect, it } from 'vitest';
import { BASE_POINTS, MAX_MULTIPLIER, Score } from './Score';

describe('Score', () => {
  it('awards base points at x1 to start', () => {
    const s = new Score();
    expect(s.kill()).toBe(BASE_POINTS);
    expect(s.points).toBe(BASE_POINTS);
  });

  it('steps the multiplier up every 3 consecutive kills', () => {
    const s = new Score();
    [1, 1, 1, 2, 2, 2, 3].forEach((m) => {
      expect(s.multiplier).toBe(m);
      s.kill();
    });
  });

  it('caps the multiplier', () => {
    const s = new Score();
    for (let i = 0; i < 100; i++) s.kill();
    expect(s.multiplier).toBe(MAX_MULTIPLIER);
  });

  it('resets the combo on a miss but keeps points and best combo', () => {
    const s = new Score();
    for (let i = 0; i < 4; i++) s.kill();
    const pts = s.points;
    s.miss();
    expect(s.combo).toBe(0);
    expect(s.multiplier).toBe(1);
    expect(s.points).toBe(pts);
    expect(s.best).toBe(4);
  });

  it('applies bonuses before the multiplier', () => {
    const s = new Score();
    for (let i = 0; i < 3; i++) s.kill();
    expect(s.kill(50)).toBe((BASE_POINTS + 50) * 2);
  });
});
