/**
 * Cleans up pasted lyrics: one kind of line break, no invisible characters,
 * no trailing spaces, and at most one blank line between stanzas.
 */
export function normalizeLyrics(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u202f\u2007]/g, ' ')
    .replace(/[\u200b\ufeff]/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
