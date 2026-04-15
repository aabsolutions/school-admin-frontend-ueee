import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface ProfilePhotos {
  _id: string;
  img: string;
  imgCuerpoEntero: string;
  peso: number;
  talla: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class MisFotosStudentService {
  constructor(private http: HttpClient) {}

  getMe(): Observable<ProfilePhotos> {
    return this.http
      .get<{ data: ProfilePhotos }>(`${environment.apiUrl}/students/me`)
      .pipe(map((r) => r.data));
  }

  uploadPhoto(
    studentId: string,
    blob: Blob,
    filename: string,
    type: 'credencial' | 'cuerpo',
    peso?: number,
    talla?: number,
  ): Observable<ProfilePhotos> {
    const fd = new FormData();
    fd.append('file', blob, filename);
    fd.append('type', type);
    if (peso != null) fd.append('peso', String(peso));
    if (talla != null) fd.append('talla', String(talla));
    return this.http
      .post<{ data: ProfilePhotos }>(`${environment.apiUrl}/students/${studentId}/photo`, fd)
      .pipe(map((r) => r.data));
  }
}
