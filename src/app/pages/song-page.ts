import { Component, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClozeView } from '../cloze/cloze-view';
import { type Song } from '../data/db';
import { SongStore } from '../data/song-store';

type LoadState = 'loading' | 'ready' | 'missing' | 'error';

@Component({
  selector: 'app-song-page',
  imports: [RouterLink, ClozeView],
  templateUrl: './song-page.html',
})
export class SongPage {
  private readonly store = inject(SongStore);

  /** Bound from the `:id` route parameter. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly state = signal<LoadState>('loading');
  protected readonly song = signal<Song | null>(null);
  protected readonly audioUrl = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      const id = this.id();
      let cancelled = false;
      let url: string | null = null;

      // Runs when the song changes or the page is left: stop pending work and free the audio URL.
      onCleanup(() => {
        cancelled = true;
        if (url) URL.revokeObjectURL(url);
      });

      this.song.set(null);
      this.audioUrl.set(null);

      if (!Number.isInteger(id)) {
        this.state.set('missing');
        return;
      }
      this.state.set('loading');

      void (async () => {
        try {
          const [song, blob] = await Promise.all([this.store.getSong(id), this.store.getAudio(id)]);
          if (cancelled) return;
          if (!song) {
            this.state.set('missing');
            return;
          }
          if (blob) {
            url = URL.createObjectURL(blob);
            this.audioUrl.set(url);
          }
          this.song.set(song);
          this.state.set('ready');
        } catch (error) {
          if (cancelled) return;
          console.error('Could not open the song', error);
          this.state.set('error');
        }
      })();
    });
  }
}
