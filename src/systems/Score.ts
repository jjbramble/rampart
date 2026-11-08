// Pure scoring logic (no Phaser) so it can be unit-tested.
export const BASE_POINTS = 100;
export const MAX_MULTIPLIER = 5;
export const HITS_PER_STEP = 3;

export class Score {
  points = 0;
  combo = 0;
  best = 0;

  get multiplier(): number {
    return Math.min(MAX_MULTIPLIER, 1 + Math.floor(this.combo / HITS_PER_STEP));
  }

  /** A kill: award points at the current multiplier, then grow the combo. Returns points awarded. */
  kill(bonus = 0): number {
    const awarded = (BASE_POINTS + bonus) * this.multiplier;
    this.points += awarded;
    this.combo += 1;
    this.best = Math.max(this.best, this.combo);
    return awarded;
  }

  /** An arrow that hit nothing breaks the combo. */
  miss(): void {
    this.combo = 0;
  }
}
