import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { LocalStorageService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(protected http: HttpClient, private store: LocalStorageService) {}

  login(username: string, password: string, rememberMe = false) {
    return this.http
      .post<{ user: any; token: string }>(`${this.authUrl}/login`, { username, password })
      .pipe(
        map((response) => ({
          user: response.user,
          token: { access_token: response.token, token_type: 'Bearer' },
          status: 200,
        }))
      );
  }

  refresh() {
    return this.http.post<{ token: string }>(`${this.authUrl}/refresh`, {}).pipe(
      map((response) => ({
        status: 200,
        body: { access_token: response.token, token_type: 'Bearer' },
      }))
    );
  }

  logout() {
    this.store.clear();
    return new Promise<void>((resolve) => resolve());
  }
}
