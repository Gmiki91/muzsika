/** One piece of a lyric line: a word, or the spaces and punctuation between words. */
export interface Token {
  text: string;
  /** True for words (letters or digits). Only words can be hidden. */
  word: boolean;
  /** Position among all words of the song, or -1 for spaces and punctuation. */
  wordIndex: number;
}

/**
 * `text` is a line of lyrics. `label` is a section tag such as "[Chorus]" that is never hidden.
 * `break` is the blank line between stanzas.
 */
export type LineKind = 'text' | 'label' | 'break';

export interface Line {
  kind: LineKind;
  tokens: Token[];
}

export interface ParsedLyrics {
  lines: Line[];
  /** Every word in reading order, so `words[token.wordIndex]` is the word of that token. */
  words: string[];
}

let segmenter: Intl.Segmenter | undefined;

/**
 * Splits lyrics into lines and tokens. Words come from `Intl.Segmenter`, which keeps
 * contractions like "don't" together and also works for languages without spaces.
 */
export function parseLyrics(lyrics: string): ParsedLyrics {
  const wordSegmenter = (segmenter ??= new Intl.Segmenter(undefined, { granularity: 'word' }));
  const words: string[] = [];

  const lines = lyrics.split('\n').map((raw): Line => {
    const trimmed = raw.trim();
    if (trimmed === '') return { kind: 'break', tokens: [] };
    if (/^\[.*\]$/.test(trimmed)) {
      return { kind: 'label', tokens: [{ text: trimmed, word: false, wordIndex: -1 }] };
    }

    const tokens: Token[] = [];
    for (const part of wordSegmenter.segment(raw)) {
      if (part.isWordLike) {
        tokens.push({ text: part.segment, word: true, wordIndex: words.length });
        words.push(part.segment);
        continue;
      }
      // Join neighbouring spaces and punctuation into one token.
      const last = tokens.at(-1);
      if (last && !last.word) last.text += part.segment;
      else tokens.push({ text: part.segment, word: false, wordIndex: -1 });
    }
    return { kind: 'text', tokens };
  });

  return { lines, words };
}
