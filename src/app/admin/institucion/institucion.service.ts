import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

export interface InstitucionData {
  nombre?: string;
  codigoAMIE?: string;
  distrito?: string;
  provincia?: string;
  canton?: string;
  contacto?: string;
  email?: string;
  direccion?: string;
  autoridad?: string | { _id: string; name: string; email: string } | null;
  logotipo?: string;
  periodoLectivoFuncional?: string;
}

@Injectable({ providedIn: 'root' })
export class InstitucionService {
  private readonly API = `${environment.apiUrl}/institucion`;

  constructor(private http: HttpClient) {}

  get(): Observable<InstitucionData> {
    return this.http.get<any>(this.API).pipe(map((r) => r.data ?? r));
  }

  update(data: InstitucionData): Observable<InstitucionData> {
    return this.http.put<any>(this.API, data).pipe(map((r) => r.data ?? r));
  }

  uploadLogo(file: File): Observable<InstitucionData> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<any>(`${this.API}/logo`, form).pipe(map((r) => r.data ?? r));
  }
}
