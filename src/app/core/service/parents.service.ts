import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { HijoActivo } from '@shared/services/tramitologia.model';

interface ApiOne<T> { data: T; }

export interface ParentProfile {
  _id: string;
  name: string;
  email: string;
  dni: string;
  mobile: string;
  gender?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class ParentsService {
  private readonly BASE = `${environment.apiUrl}/parents`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<ParentProfile> {
    return this.http.get<ApiOne<ParentProfile>>(`${this.BASE}/me`).pipe(map((r) => r.data));
  }

  getHijosActivos(): Observable<HijoActivo[]> {
    return this.http.get<ApiOne<HijoActivo[]>>(`${this.BASE}/me/hijos-activos`).pipe(map((r) => r.data));
  }
}
