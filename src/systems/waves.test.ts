import { describe, expect, it } from 'vitest';
import { WAVES } from '../config';
import { planWave, spawnGap, speedMultiplier, waveComposition } from './waves';

/** Small deterministic PRNG (mulberry32) so plans are reproducible. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('waves', () => {
  it('wave 1 is plain troops only', () => {
    expect(waveComposition(1)).toEqual({ troop: 5, flyer: 0, shield: 0, ram: 0 });
  });

  it('introduces flyers, shields and rams on waves 2, 3 and 4', () => {
    expect(waveComposition(2).flyer).toBeGreaterThan(0);
    expect(waveComposition(2).shield).toBe(0);
    expect(waveComposition(3).shield).toBeGreaterThan(0);
    expect(waveComposition(3).ram).toBe(0);
    expect(waveComposition(4).ram).toBeGreaterThan(0);
  });

  it('never gets smaller from one wave to the next', () => {
    for (let n = 1; n < 30; n++) {
      const a = waveComposition(n);
      const b = waveComposition(n + 1);
      for (const k of Object.keys(a) as (keyof typeof a)[]) expect(b[k]).toBeGreaterThanOrEqual(a[k]);
    }
  });

  it('tightens the spawn gap down to the floor and caps speed', () => {
    expect(spawnGap(1)).toBe(WAVES.startGapMs);
    expect(spawnGap(2)).toBeLessThan(spawnGap(1));
    expect(spawnGap(100)).toBe(WAVES.minGapMs);
    expect(speedMultiplier(1)).toBe(1);
    expect(speedMultiplier(100)).toBe(WAVES.maxSpeedMul);
  });

  it('plans every enemy, in time order, opening with a troop', () => {
    const rng = seeded(7);
    for (let n = 1; n <= 12; n++) {
      const plan = planWave(n, rng);
      const total = Object.values(waveComposition(n)).reduce((a, b) => a + b, 0);
      expect(plan).toHaveLength(total);
      expect(plan[0]).toEqual({ kind: 'troop', at: 0 });
      for (let i = 1; i < plan.length; i++) expect(plan[i].at).toBeGreaterThan(plan[i - 1].at);
    }
  });

  it('is reproducible for the same random source', () => {
    expect(planWave(6, seeded(42))).toEqual(planWave(6, seeded(42)));
  });
});
