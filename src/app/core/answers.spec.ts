import { checkAnswer } from './answers';

describe('checkAnswer', () => {
  it('accepts the exact word', () => {
    expect(checkAnswer('night', 'night')).toBe('correct');
  });

  it('ignores capital letters, spaces and punctuation around the word', () => {
    expect(checkAnswer('Night', ' night. ')).toBe('correct');
    expect(checkAnswer('hello', 'HELLO,')).toBe('correct');
  });

  it('treats typographic and plain apostrophes the same', () => {
    expect(checkAnswer("don't", 'don\u2019t')).toBe('correct');
    expect(checkAnswer('don\u2019t', "don't")).toBe('correct');
  });

  it('ignores a leading apostrophe', () => {
    expect(checkAnswer("'cause", 'cause')).toBe('correct');
  });

  it('accepts composed and decomposed accents as the same letter', () => {
    expect(checkAnswer('über', 'u\u0308ber')).toBe('correct');
  });

  it('calls a missing accent almost right', () => {
    expect(checkAnswer('über', 'uber')).toBe('almost');
    expect(checkAnswer('árvíztűrő', 'arvizturo')).toBe('almost');
  });

  it('calls a missing apostrophe almost right', () => {
    expect(checkAnswer("don't", 'dont')).toBe('almost');
  });

  it('rejects other words and empty answers', () => {
    expect(checkAnswer('night', 'day')).toBe('wrong');
    expect(checkAnswer('night', '')).toBe('wrong');
    expect(checkAnswer('night', '  ')).toBe('wrong');
  });

  it('works for other alphabets', () => {
    expect(checkAnswer('Привет', 'привет')).toBe('correct');
  });
});
