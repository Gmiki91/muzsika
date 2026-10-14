import { guessAudioType, titleFromFileName } from './audio-file';

describe('guessAudioType', () => {
  it('prefers the extension for known formats', () => {
    expect(guessAudioType({ name: 'song.M4A', type: '' })).toBe('audio/mp4');
    expect(guessAudioType({ name: 'song.mp3', type: 'application/octet-stream' })).toBe('audio/mpeg');
  });

  it('falls back to the reported audio type', () => {
    expect(guessAudioType({ name: 'track', type: 'audio/x-custom' })).toBe('audio/x-custom');
  });

  it('returns an empty type when nothing is known', () => {
    expect(guessAudioType({ name: 'track.xyz', type: '' })).toBe('');
    expect(guessAudioType({ name: 'track.xyz', type: 'video/mp4' })).toBe('');
  });
});

describe('titleFromFileName', () => {
  it('drops the extension and turns underscores into spaces', () => {
    expect(titleFromFileName('Artist_-_Song.mp3')).toBe('Artist - Song');
  });

  it('only removes the last extension', () => {
    expect(titleFromFileName('My   song.v2.flac')).toBe('My song.v2');
  });

  it('keeps the file name when nothing is left', () => {
    expect(titleFromFileName('.mp3')).toBe('.mp3');
  });
});
