/**
 * `correct` matches apart from capital letters, punctuation and apostrophe style.
 * `almost` also needs different accents or a missing apostrophe. `wrong` is anything else.
 */
export type AnswerResult = 'correct' | 'almost' | 'wrong';

const APOSTROPHES = /[\u2018\u2019\u201b\u02bc\u0060\u00b4]/g;
const EDGE_NON_LETTERS = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const COMBINING_MARKS = /\p{M}/gu;

function normalize(text: string): string {
  return text.normalize('NFC').replace(APOSTROPHES, "'").replace(EDGE_NON_LETTERS, '').toLowerCase();
}

function loosen(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').normalize('NFC').replace(/'/g, '');
}

/** Compares what was typed with the original word of the lyrics. */
export function checkAnswer(expected: string, typed: string): AnswerResult {
  const wanted = normalize(expected);
  const given = normalize(typed);

  if (given === '') return 'wrong';
  if (given === wanted) return 'correct';
  if (loosen(given) === loosen(wanted)) return 'almost';
  return 'wrong';
}
