import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { formatBytes } from './core/format';
import { StorageStatus } from './data/storage-status';
import { UpdateBanner } from './shell/update-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, UpdateBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly storage = inject(StorageStatus);

  protected readonly storageNotice = computed(() => {
    switch (this.storage.persisted()) {
      case true:
        return 'Your songs are stored on this device and protected from automatic cleanup.';
      case false:
        return 'Your songs are stored on this device, but the browser may clear them if space runs low. Installing the app to your home screen usually prevents that.';
      default:
        return null;
    }
  });

  protected readonly usageNotice = computed(() => {
    const used = this.storage.usedBytes();
    return used === null ? null : `${formatBytes(used)} used on this device.`;
  });
}
