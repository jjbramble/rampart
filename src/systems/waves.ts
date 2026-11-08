// Pure wave planning (no Phaser) so the difficulty curve can be unit-tested.
import { WAVES } from '../config';

export type EnemyKind = 'troop' | 'shield' | 'flyer' | 'ram';
export interface Spawn { kind: EnemyKind; at: number } // ms after the wave's first spawn

/** How many of each enemy wave `n` (1-based) contains. New kinds arrive on waves 2, 3 and 4. */
export function waveComposition(n: number): Record<EnemyKind, number> {
  return {
    troop: 3 + 2 * n,
    flyer: n >= 2 ? n - 1 : 0,
    shield: n >= 3 ? Math.floor((n - 1) / 2) : 0,
    ram: n >= 4 ? Math.floor(n / 4) : 0,
  };
}

/** Average gap between spawns on wave `n`. */
export function spawnGap(n: number): number {
  return Math.max(WAVES.minGapMs, WAVES.startGapMs - (n - 1) * WAVES.gapRampMs);
}

/** Speed multiplier applied to every enemy on wave `n`. */
export function speedMultiplier(n: number): number {
  return Math.min(WAVES.maxSpeedMul, 1 + (n - 1) * WAVES.speedRamp);
}

/** The full spawn schedule for wave `n`: kinds shuffled, gaps jittered around `spawnGap(n)`. */
export function planWave(n: number, rng: () => number = Math.random): Spawn[] {
  const kinds: EnemyKind[] = [];
  for (const [kind, count] of Object.entries(waveComposition(n)) as [EnemyKind, number][]) {
    for (let i = 0; i < count; i++) kinds.push(kind);
  }
  // Fisher–Yates, but always open with a plain troop so each wave starts gently.
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  const first = kinds.indexOf('troop');
  [kinds[0], kinds[first]] = [kinds[first], kinds[0]];

  const gap = spawnGap(n);
  let at = 0;
  return kinds.map((kind, i) => {
    if (i > 0) at += Math.max(WAVES.minGapMs * 0.5, gap * (1 + (rng() * 2 - 1) * WAVES.jitter));
    return { kind, at: Math.round(at) };
  });
}
