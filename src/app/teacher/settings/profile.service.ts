import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class TeacherProfileService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.base}/teachers/me`).pipe(map(r => r.data));
  }

  updateGeneral(body: any): Observable<any> {
    return this.http.patch<any>(`${this.base}/teachers/me`, body).pipe(map(r => r.data));
  }

  updateMedical(body: any): Observable<any> {
    return this.http.patch<any>(`${this.base}/teachers/me/medical`, body).pipe(map(r => r.data));
  }

  updateFamily(body: any): Observable<any> {
    return this.http.patch<any>(`${this.base}/teachers/me/family`, body).pipe(map(r => r.data));
  }

  updateUserAccount(body: { name?: string; email?: string; password?: string }): Observable<any> {
    return this.http.patch<any>(`${this.base}/users/me`, body).pipe(map(r => r.data));
  }
}
