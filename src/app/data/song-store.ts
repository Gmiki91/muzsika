import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { catchError, from, of } from 'rxjs';
import { guessAudioType, titleFromFileName } from '../core/audio-file';
import { normalizeLyrics } from '../core/lyrics';
import { db, type Song } from './db';

export interface NewSong {
  title: string;
  lyrics: string;
  audio: File;
}

@Injectable({ providedIn: 'root' })
export class SongStore {
  /** All songs, newest first. `undefined` until the first read has finished. */
  readonly songs = toSignal(
    from(liveQuery(() => db.songs.orderBy('createdAt').reverse().toArray())).pipe(
      catchError((error) => {
        console.error('Could not read the song library', error);
        return of<Song[]>([]);
      }),
    ),
    { initialValue: undefined },
  );

  async add(input: NewSong): Promise<number> {
    const type = guessAudioType(input.audio);
    // Copy the bytes into a fresh in-memory Blob so we don't depend on the file picker's handle.
    const blob = new Blob([await input.audio.arrayBuffer()], { type });
    const title = input.title.trim() || titleFromFileName(input.audio.name);
    const lyrics = normalizeLyrics(input.lyrics);

    return db.transaction('rw', db.songs, db.audio, async () => {
      const id = await db.songs.add({
        title,
        lyrics,
        audioName: input.audio.name,
        audioType: type,
        audioSize: blob.size,
        createdAt: Date.now(),
      });
      await db.audio.add({ songId: id, blob });
      return id;
    });
  }

  getSong(id: number): Promise<Song | undefined> {
    return db.songs.get(id);
  }

  async getAudio(id: number): Promise<Blob | undefined> {
    const row = await db.audio.get(id);
    return row?.blob;
  }

  remove(id: number): Promise<void> {
    return db.transaction('rw', db.songs, db.audio, async () => {
      await db.songs.delete(id);
      await db.audio.delete(id);
    });
  }
}
