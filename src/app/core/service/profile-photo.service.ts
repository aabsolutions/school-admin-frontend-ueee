import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Role } from '@core/models/role';
import { environment } from '@environments/environment';

const DEFAULT_PHOTO = 'assets/images/user/user1.jpg';

@Injectable({ providedIn: 'root' })
export class ProfilePhotoService {
  private photo$ = new BehaviorSubject<string>(DEFAULT_PHOTO);

  /** Observable que emite la URL de foto del usuario logueado. */
  readonly photo = this.photo$.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Carga la foto del perfil según el rol.
   * Llamar en ngOnInit del header/sidebar.
   */
  load(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    const role: string = currentUser.roles?.[0]?.name ?? '';

    if (role === Role.Student) {
      this.http.get<any>(`${environment.apiUrl}/students/me`).subscribe({
        next: (res) => {
          const img = (res.data ?? res)?.img;
          this.photo$.next(img || DEFAULT_PHOTO);
        },
        error: () => this.photo$.next(DEFAULT_PHOTO),
      });
    } else if (role === Role.Teacher) {
      this.http.get<any>(`${environment.apiUrl}/teachers/me`).subscribe({
        next: (res) => {
          const img = (res.data ?? res)?.img;
          this.photo$.next(img || DEFAULT_PHOTO);
        },
        error: () => this.photo$.next(DEFAULT_PHOTO),
      });
    } else {
      // Admin / SuperAdmin: usa el avatar estático del currentUser
      const avatar = currentUser.avatar;
      this.photo$.next(avatar ? `assets/images/user/${avatar}` : DEFAULT_PHOTO);
    }
  }

  /**
   * Llama esto desde mis-fotos después de subir una foto nueva.
   */
  update(url: string): void {
    this.photo$.next(url || DEFAULT_PHOTO);
  }

  reset(): void {
    this.photo$.next(DEFAULT_PHOTO);
  }
}
