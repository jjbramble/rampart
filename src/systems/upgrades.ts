// Pure upgrade logic (no Phaser): what each pick does, what can be offered, and the resulting loadout.
import { BOW, CASTLE, UPGRADE } from '../config';

export type UpgradeId = 'quiver' | 'reload' | 'draw' | 'pierce' | 'volley' | 'fortify' | 'repair';

export interface UpgradeDef {
  name: string;
  text: string;
  max: number; // how many times it can be taken in one run
}

export const UPGRADES: Record<UpgradeId, UpgradeDef> = {
  quiver: { name: 'Deep Quiver', text: `+${UPGRADE.quiverPlus} arrows`, max: 3 },
  reload: { name: 'Quick Hands', text: 'reload 20% faster', max: 3 },
  draw: { name: 'Strong Arm', text: 'full draw 20% faster', max: 3 },
  pierce: { name: 'Bodkin Tips', text: 'arrows pierce +1 foe', max: 2 },
  volley: { name: 'Volley', text: '+1 arrow per shot', max: 2 },
  fortify: { name: 'Fortify', text: `+${UPGRADE.fortifyPlus} max gate HP`, max: 2 },
  repair: { name: 'Mason', text: `repair gate +${UPGRADE.repairHp}`, max: Infinity },
};

export interface Loadout {
  quiverSize: number;
  reloadMs: number;
  fullDrawMs: number;
  pierce: number;      // extra enemies each arrow can pass through
  arrowsPerShot: number;
  gateMaxHp: number;
}

export function loadoutFor(taken: readonly UpgradeId[]): Loadout {
  const n = (id: UpgradeId) => taken.filter((t) => t === id).length;
  return {
    quiverSize: BOW.quiverSize + n('quiver') * UPGRADE.quiverPlus,
    reloadMs: Math.round(BOW.reloadMs * UPGRADE.reloadMul ** n('reload')),
    fullDrawMs: Math.round(BOW.fullDrawMs * UPGRADE.drawMul ** n('draw')),
    pierce: n('pierce'),
    arrowsPerShot: 1 + n('volley'),
    gateMaxHp: CASTLE.maxHp + n('fortify') * UPGRADE.fortifyPlus,
  };
}

export interface Gate { hp: number; max: number }

export function canOffer(id: UpgradeId, taken: readonly UpgradeId[], gate: Gate): boolean {
  if (id === 'repair') return gate.hp < gate.max;
  return taken.filter((t) => t === id).length < UPGRADES[id].max;
}

/** Up to `count` distinct upgrades to choose from. A repair is always among them when the gate is badly hurt. */
export function offerUpgrades(taken: readonly UpgradeId[], gate: Gate, rng: () => number = Math.random, count = 3): UpgradeId[] {
  const pool = (Object.keys(UPGRADES) as UpgradeId[]).filter((id) => canOffer(id, taken, gate));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const offer = pool.slice(0, count);
  if (gate.hp <= gate.max / 2 && pool.includes('repair') && !offer.includes('repair')) offer[offer.length - 1] = 'repair';
  return offer;
}
