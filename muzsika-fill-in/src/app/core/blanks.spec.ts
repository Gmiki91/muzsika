import { blankCount, blankOrder, selectBlanks } from './blanks';

describe('blankOrder', () => {
  it('contains every word exactly once', () => {
    for (const size of [0, 1, 2, 7, 41, 250]) {
      const order = blankOrder(size, 3);
      expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i));
    }
  });

  it('is repeatable for the same seed and differs between seeds', () => {
    expect(blankOrder(60, 5)).toEqual(blankOrder(60, 5));
    expect(blankOrder(60, 5)).not.toEqual(blankOrder(60, 6));
  });

  it('spreads any share of blanks evenly across the song', () => {
    for (const size of [20, 41, 100, 250]) {
      for (const seed of [1, 2, 17, 1234]) {
        const order = blankOrder(size, seed);
        for (const percent of [10, 30, 50, 70]) {
          const count = blankCount(size, percent);
          const picked = [...order.slice(0, count)].sort((a, b) => a - b);
          const gaps = picked.map((value, i) => (i === 0 ? value + size - picked[count - 1] : value - picked[i - 1]));
          expect(Math.max(...gaps)).toBeLessThanOrEqual(3 * (size / count));
        }
      }
    }
  });
});

describe('blankCount', () => {
  it('rounds the share of words', () => {
    expect(blankCount(41, 30)).toBe(12);
    expect(blankCount(10, 25)).toBe(3);
  });

  it('hides nothing at 0% and everything at 100%', () => {
    expect(blankCount(41, 0)).toBe(0);
    expect(blankCount(41, 100)).toBe(41);
  });

  it('stays within 0 to 100 percent', () => {
    expect(blankCount(10, -20)).toBe(0);
    expect(blankCount(10, 250)).toBe(10);
  });
});

describe('selectBlanks', () => {
  it('only adds blanks when the difficulty goes up', () => {
    const order = blankOrder(80, 9);
    const easy = selectBlanks(order, blankCount(80, 30));
    const hard = selectBlanks(order, blankCount(80, 60));
    expect([...easy].every((index) => hard.has(index))).toBe(true);
    expect(hard.size).toBeGreaterThan(easy.size);
  });
});
