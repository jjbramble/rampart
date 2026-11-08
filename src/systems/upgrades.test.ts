import { describe, expect, it } from 'vitest';
import { BOW, CASTLE, UPGRADE } from '../config';
import { canOffer, loadoutFor, offerUpgrades, UPGRADES, UpgradeId } from './upgrades';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const healthy = { hp: CASTLE.maxHp, max: CASTLE.maxHp };

describe('upgrades', () => {
  it('starts from the base config', () => {
    expect(loadoutFor([])).toEqual({
      quiverSize: BOW.quiverSize, reloadMs: BOW.reloadMs, fullDrawMs: BOW.fullDrawMs,
      pierce: 0, arrowsPerShot: 1, gateMaxHp: CASTLE.maxHp,
    });
  });

  it('stacks picks', () => {
    const l = loadoutFor(['quiver', 'quiver', 'reload', 'volley', 'pierce', 'fortify', 'draw', 'repair']);
    expect(l.quiverSize).toBe(BOW.quiverSize + 2 * UPGRADE.quiverPlus);
    expect(l.reloadMs).toBe(Math.round(BOW.reloadMs * UPGRADE.reloadMul));
    expect(l.fullDrawMs).toBe(Math.round(BOW.fullDrawMs * UPGRADE.drawMul));
    expect(l.arrowsPerShot).toBe(2);
    expect(l.pierce).toBe(1);
    expect(l.gateMaxHp).toBe(CASTLE.maxHp + UPGRADE.fortifyPlus);
  });

  it('stops offering an upgrade once it is maxed', () => {
    const taken: UpgradeId[] = Array(UPGRADES.pierce.max).fill('pierce');
    expect(canOffer('pierce', taken, healthy)).toBe(false);
    expect(canOffer('pierce', taken.slice(1), healthy)).toBe(true);
  });

  it('only offers a repair when the gate is damaged', () => {
    expect(canOffer('repair', [], healthy)).toBe(false);
    expect(canOffer('repair', [], { hp: 9, max: 10 })).toBe(true);
  });

  it('offers three distinct, eligible upgrades', () => {
    const rng = seeded(3);
    for (let i = 0; i < 50; i++) {
      const offer = offerUpgrades([], healthy, rng);
      expect(offer).toHaveLength(3);
      expect(new Set(offer).size).toBe(3);
      expect(offer).not.toContain('repair');
    }
  });

  it('always offers a repair when the gate is at half HP or less', () => {
    const rng = seeded(9);
    for (let i = 0; i < 50; i++) expect(offerUpgrades([], { hp: 5, max: 10 }, rng)).toContain('repair');
  });

  it('offers fewer when almost everything is maxed', () => {
    const taken = (Object.keys(UPGRADES) as UpgradeId[])
      .filter((id) => id !== 'repair' && id !== 'quiver')
      .flatMap((id) => Array(UPGRADES[id].max).fill(id));
    expect(offerUpgrades(taken, healthy, seeded(1))).toEqual(['quiver']);
  });
});
