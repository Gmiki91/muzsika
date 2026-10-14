import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { titleFromFileName } from '../core/audio-file';
import { formatBytes } from '../core/format';
import { type Song } from '../data/db';
import { SongStore } from '../data/song-store';
import { StorageStatus } from '../data/storage-status';

@Component({
  selector: 'app-home-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly store = inject(SongStore);
  private readonly storage = inject(StorageStatus);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly songs = this.store.songs;
  protected readonly formatBytes = formatBytes;

  protected readonly title = signal('');
  protected readonly lyrics = signal('');
  protected readonly file = signal<File | null>(null);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  /** `null` means "follow the default": the form is open while the library is empty. */
  private readonly formToggle = signal<boolean | null>(null);
  protected readonly formOpen = computed(() => this.formToggle() ?? this.songs()?.length === 0);

  protected readonly titlePlaceholder = computed(() => {
    const file = this.file();
    return file ? titleFromFileName(file.name) : 'Song title';
  });

  protected readonly canSave = computed(
    () => this.file() !== null && this.lyrics().trim() !== '' && !this.saving(),
  );

  protected toggleForm(): void {
    if (this.formOpen()) this.resetForm();
    this.formToggle.set(!this.formOpen());
  }

  protected onFileChosen(event: Event): void {
    this.file.set((event.target as HTMLInputElement).files?.item(0) ?? null);
    this.error.set(null);
  }

  protected async save(): Promise<void> {
    const audio = this.file();
    if (!audio || !this.canSave()) return;

    this.saving.set(true);
    this.error.set(null);
    try {
      await this.store.add({ title: this.title(), lyrics: this.lyrics(), audio });
      this.resetForm();
      this.formToggle.set(false);
      void this.storage.refresh();
    } catch (error) {
      console.error('Could not save the song', error);
      this.error.set(describeSaveError(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(song: Song): Promise<void> {
    if (!confirm(`Delete "${song.title}"?`)) return;

    try {
      await this.store.remove(song.id);
      void this.storage.refresh();
    } catch (error) {
      console.error('Could not delete the song', error);
      this.error.set('Could not delete the song.');
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.lyrics.set('');
    this.file.set(null);
    this.error.set(null);
    const input = this.fileInput();
    if (input) input.nativeElement.value = '';
  }
}

function describeSaveError(error: unknown): string {
  if (error instanceof Error && error.name === 'QuotaExceededError') {
    return 'There is not enough storage space on this device for this file.';
  }
  return 'Could not save the song. Please try again.';
}
