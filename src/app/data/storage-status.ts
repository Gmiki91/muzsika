import { Injectable, signal } from '@angular/core';

/**
 * Whether the browser promises to keep our data, and how much space it uses.
 * Installed apps are usually granted persistent storage; plain browser tabs often are not.
 */
@Injectable({ providedIn: 'root' })
export class StorageStatus {
  /** `null` while unknown or when the browser doesn't say. */
  readonly persisted = signal<boolean | null>(null);
  readonly usedBytes = signal<number | null>(null);

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
    if (!storage) return;

    try {
      if (typeof storage.persisted === 'function') {
        let persisted = await storage.persisted();
        if (!persisted && typeof storage.persist === 'function') {
          persisted = await storage.persist();
        }
        this.persisted.set(persisted);
      }
      if (typeof storage.estimate === 'function') {
        const { usage } = await storage.estimate();
        this.usedBytes.set(usage ?? null);
      }
    } catch (error) {
      console.warn('Storage status is not available', error);
    }
  }
}
