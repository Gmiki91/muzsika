import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, type VersionReadyEvent } from '@angular/service-worker';
import { filter, fromEvent } from 'rxjs';

/** Tells the user when a new version of the app has been downloaded. */
@Component({
  selector: 'app-update-banner',
  templateUrl: './update-banner.html',
})
export class UpdateBanner {
  private readonly updates = inject(SwUpdate, { optional: true });
  protected readonly ready = signal(false);

  constructor() {
    const updates = this.updates;
    if (!updates?.isEnabled) return;

    updates.versionUpdates
      .pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.ready.set(true));

    // An installed app can stay alive in the background for days,
    // so look for a new version whenever it comes back to the foreground.
    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntilDestroyed(),
      )
      .subscribe(() => void updates.checkForUpdate().catch(() => undefined));
  }

  protected async reload(): Promise<void> {
    try {
      await this.updates?.activateUpdate();
    } finally {
      location.reload();
    }
  }
}
