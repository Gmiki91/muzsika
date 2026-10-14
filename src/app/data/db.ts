import Dexie, { type EntityTable, type Table } from 'dexie';

/** A song's text and details. The audio itself lives in its own table, so reading the list stays cheap. */
export interface Song {
  id: number;
  title: string;
  lyrics: string;
  audioName: string;
  audioType: string;
  audioSize: number;
  createdAt: number;
}

export interface SongAudio {
  songId: number;
  blob: Blob;
}

export const db = new Dexie('muzsika') as Dexie & {
  songs: EntityTable<Song, 'id'>;
  audio: Table<SongAudio, number>;
};

// Only indexed fields are listed. Other fields (for example line timings later on)
// can be added to a song without a new schema version.
db.version(1).stores({
  songs: '++id, createdAt',
  audio: 'songId',
});
