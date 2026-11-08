// Tunable numbers live here so the bow feel can be adjusted in one place.
export const GAME_W = 480;
export const GAME_H = 270;
export const GROUND_Y = 246;

export const WALL = { x: 0, width: 72, top: 150 };
export const ARCHER = { x: 52, y: WALL.top - 9 };

export const BOW = {
  gravity: 300,          // px/s² applied to arrows
  minSpeed: 140,         // px/s at the start of the draw
  maxSpeed: 430,         // px/s at full draw
  fullDrawMs: 650,       // time to reach full power
  quiverSize: 5,
  reloadMs: 550,         // one arrow back per interval
  previewSteps: 14,      // trajectory dots shown while drawing
  previewStepS: 0.07,
};

export const CASTLE = { maxHp: 10 };

export const WAVES = {
  firstDelayMs: 1200,    // pause before wave 1
  bannerMs: 1400,        // "WAVE n" banner, spawns start after it
  breakMs: 3200,         // breather between waves (quiver refills)
  startGapMs: 1900,      // average gap between spawns in wave 1
  minGapMs: 650,         // gap never shrinks below this
  gapRampMs: 140,        // gap shrinks by this much per wave
  jitter: 0.25,          // ± fraction of randomness on each gap
  speedRamp: 0.06,       // enemies get 6% faster per wave...
  maxSpeedMul: 1.6,      // ...up to this
  clearBonus: 250,       // × wave number, for clearing a wave
  flawlessBonus: 500,    // extra if the gate took no damage that wave
};

// Per-kind stats. speed is a [min, max] px/s range before the wave speed multiplier.
export const ENEMIES = {
  troop: { hp: 1, speed: [18, 34], bonus: 0, gateDamage: 1 },
  shield: { hp: 2, speed: [14, 22], bonus: 50, gateDamage: 1 },
  flyer: { hp: 1, speed: [30, 44], bonus: 75, gateDamage: 1, minY: 50, maxY: 120, bob: 8 },
  ram: { hp: 6, speed: [9, 13], bonus: 250, gateDamage: 3 },
} as const;

/** Shields only stop arrows coming in flatter than this; plunging shots get over the top. */
export const SHIELD_PLUNGE_DEG = 30;
