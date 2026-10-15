const GOLDEN = 0.6180339887498949;

/** A repeatable number in [0, 1) for a whole-number seed (one step of mulberry32). */
function seededUnit(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * The order in which words get hidden. Hiding the first N words of this order spreads
 * the blanks evenly across the song, and raising N only adds blanks to the ones already
 * there. The same seed always gives the same order, so a song looks the same every time.
 */
export function blankOrder(wordCount: number, seed: number): number[] {
  const taken = new Uint8Array(wordCount);
  const order: number[] = [];
  const start = seededUnit(seed);

  for (let k = 0; k < wordCount; k++) {
    let index = Math.floor(((start + k * GOLDEN) % 1) * wordCount);
    while (taken[index]) index = (index + 1) % wordCount;
    taken[index] = 1;
    order.push(index);
  }
  return order;
}

/** How many words to hide for a difficulty between 0 and 100 percent. */
export function blankCount(wordCount: number, difficulty: number): number {
  const share = Math.min(100, Math.max(0, difficulty)) / 100;
  return Math.round(wordCount * share);
}

/** The word indexes that are hidden: the first `count` entries of the order. */
export function selectBlanks(order: readonly number[], count: number): Set<number> {
  return new Set(order.slice(0, count));
}
