import { normalizeLyrics } from './lyrics';

describe('normalizeLyrics', () => {
  it('unifies line breaks', () => {
    expect(normalizeLyrics('one\r\ntwo\rthree')).toBe('one\ntwo\nthree');
  });

  it('replaces non-breaking spaces and removes invisible characters', () => {
    expect(normalizeLyrics('a\u00a0b\u200b\ufeffc')).toBe('a bc');
  });

  it('trims trailing spaces and collapses blank lines between stanzas', () => {
    expect(normalizeLyrics('  first line  \n\n\n\nsecond line \n')).toBe('first line\n\nsecond line');
  });

  it('keeps a single blank line between stanzas', () => {
    expect(normalizeLyrics('a\n\nb')).toBe('a\n\nb');
  });
});
