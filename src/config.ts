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

export const TROOPS = {
  firstSpawnMs: 1200,
  spawnMs: 2200,         // starting gap between spawns
  minSpawnMs: 700,       // gap never shrinks below this
  spawnRampMs: 90,       // gap shrinks by this much per spawn
  minSpeed: 18,
  maxSpeed: 34,
};
