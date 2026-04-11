import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private zone: NgZone) {}

  handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));

    // Log to console in development — replace with remote logging in production
    console.error('[GlobalErrorHandler]', err);

    // Avoid triggering change detection for errors that happen outside Angular zone
    this.zone.run(() => {
      // Future: integrate with a toast/snackbar notification service
    });
  }
}
