import { parseLyrics } from './tokens';

describe('parseLyrics', () => {
  it('splits lines, words and punctuation', () => {
    const { lines, words } = parseLyrics("Hello, world!\nSecond line");
    expect(words).toEqual(['Hello', 'world', 'Second', 'line']);
    expect(lines[0].tokens.map((t) => t.text)).toEqual(['Hello', ', ', 'world', '!']);
    expect(lines[0].tokens.map((t) => t.word)).toEqual([true, false, true, false]);
  });

  it('numbers words across lines in reading order', () => {
    const { lines } = parseLyrics('a b\nc');
    const indexes = lines.flatMap((line) => line.tokens.filter((t) => t.word).map((t) => t.wordIndex));
    expect(indexes).toEqual([0, 1, 2]);
  });

  it('keeps contractions together, also with a typographic apostrophe', () => {
    expect(parseLyrics("don't stop").words).toEqual(["don't", 'stop']);
    expect(parseLyrics('don\u2019t stop').words).toEqual(['don\u2019t', 'stop']);
  });

  it('handles accented and non-Latin words', () => {
    expect(parseLyrics('Fűrészporos über Привет').words).toEqual(['Fűrészporos', 'über', 'Привет']);
  });

  it('treats blank lines as stanza breaks', () => {
    const { lines } = parseLyrics('one\n\ntwo');
    expect(lines.map((line) => line.kind)).toEqual(['text', 'break', 'text']);
  });

  it('keeps section tags like [Chorus] out of the words', () => {
    const { lines, words } = parseLyrics('[Chorus]\nla la');
    expect(lines[0]).toMatchObject({ kind: 'label' });
    expect(lines[0].tokens[0].text).toBe('[Chorus]');
    expect(words).toEqual(['la', 'la']);
  });

  it('keeps lines in parentheses, because backing vocals are lyrics too', () => {
    expect(parseLyrics('(oh oh) yeah').words).toEqual(['oh', 'oh', 'yeah']);
  });

  it('returns nothing for empty lyrics', () => {
    const { lines, words } = parseLyrics('');
    expect(words).toEqual([]);
    expect(lines.map((line) => line.kind)).toEqual(['break']);
  });
});
