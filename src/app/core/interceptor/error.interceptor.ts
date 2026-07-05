import { Injectable } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        const isLoginRequest = request.url.includes('/auth/login');

        if (err.status === 401 && !isLoginRequest) {
          // Auto-logout only for authenticated requests, not login attempts
          this.authenticationService.logout();
          location.reload();
        }

        const message =
          err.status === 403
            ? err?.error?.message || 'No tienes permisos para realizar esta acción'
            : err?.error?.message || err?.message || err?.statusText || 'An unexpected error occurred';

        // Preserve `.error`/`.status` so existing components reading err?.error?.message
        // (the raw backend response shape) keep working — not just err.message.
        return throwError(() => Object.assign(new Error(message), { error: err.error, status: err.status }));
      })
    );
  }
}
