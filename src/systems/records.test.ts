import { describe, expect, it } from 'vitest';
import { KV, Records } from './records';

const memory = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

describe('Records', () => {
  it('starts empty', () => {
    expect(new Records(memory()).best).toEqual({ score: 0, wave: 0 });
  });

  it('keeps the best score and wave across instances', () => {
    const kv = memory();
    const r = new Records(kv);
    expect(r.submit(1200, 3)).toBe(true);
    expect(r.submit(800, 5)).toBe(false); // lower score, but a further wave
    expect(new Records(kv).best).toEqual({ score: 1200, wave: 5 });
  });

  it('ignores corrupt data', () => {
    const kv = memory();
    kv.setItem('rampart.best', '{not json');
    expect(new Records(kv).best).toEqual({ score: 0, wave: 0 });
  });

  it('works when storage is missing or throws', () => {
    const broken: KV = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    for (const kv of [null, broken]) {
      const r = new Records(kv);
      expect(r.submit(500, 2)).toBe(true);
      expect(r.best).toEqual({ score: 500, wave: 2 });
    }
  });
});
