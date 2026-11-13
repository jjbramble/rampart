// Best score / wave, kept in localStorage when it is available. Storage can be missing or throw
// (private windows, blocked site data), so every access is guarded and the game works without it.
export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Best { score: number; wave: number }

const KEY = 'rampart.best';

function browserStorage(): KV | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export class Records {
  private cached: Best;

  constructor(private readonly kv: KV | null = browserStorage()) {
    this.cached = this.load();
  }

  get best(): Best {
    return { ...this.cached };
  }

  /** Record a finished run. Returns true if it beat the best score. */
  submit(score: number, wave: number): boolean {
    const newBest = score > this.cached.score;
    this.cached = { score: Math.max(score, this.cached.score), wave: Math.max(wave, this.cached.wave) };
    try {
      this.kv?.setItem(KEY, JSON.stringify(this.cached));
    } catch {
      // storage full or blocked: keep the in-memory best for this session
    }
    return newBest;
  }

  private load(): Best {
    try {
      const raw = JSON.parse(this.kv?.getItem(KEY) ?? 'null');
      const score = Number(raw?.score), wave = Number(raw?.wave);
      return { score: Number.isFinite(score) ? score : 0, wave: Number.isFinite(wave) ? wave : 0 };
    } catch {
      return { score: 0, wave: 0 };
    }
  }
}
