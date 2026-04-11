import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '@core/service/token.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private readonly skipUrls = ['/auth/login', '/auth/refresh'];

  constructor(private tokenService: TokenService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const shouldSkip = this.skipUrls.some((url) => request.url.includes(url));
    const bearerToken = this.tokenService.getBearerToken();

    if (!shouldSkip && bearerToken) {
      request = request.clone({
        setHeaders: { Authorization: bearerToken },
      });
    }

    return next.handle(request);
  }
}
