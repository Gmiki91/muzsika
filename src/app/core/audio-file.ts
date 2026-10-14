const TYPE_BY_EXTENSION: Readonly<Record<string, string | undefined>> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  wav: 'audio/wav',
  weba: 'audio/webm',
  webm: 'audio/webm',
};

/**
 * Picks a MIME type for an audio file. Some Android file pickers report an empty
 * or unusual type, so a recognised file extension wins over the reported type.
 */
export function guessAudioType(file: { name: string; type: string }): string {
  const extension = file.name.includes('.') ? (file.name.split('.').pop() ?? '').toLowerCase() : '';
  return TYPE_BY_EXTENSION[extension] ?? (file.type.startsWith('audio/') ? file.type : '');
}

/** Turns "Artist_-_Song.mp3" into "Artist - Song". */
export function titleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./\\]+$/, '');
  const title = withoutExtension.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
  return title || fileName;
}
