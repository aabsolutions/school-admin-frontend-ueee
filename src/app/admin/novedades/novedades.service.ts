import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Novedad } from './novedad.model';

const API = `${environment.apiUrl}/novedades`;

export interface NovedadesQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tipo?: string;
  cursoLectivoId?: string;
  studentId?: string;
}

export interface NovedadesReporteQuery {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
  cursoLectivoId?: string;
  studentId?: string;
}

export interface CreateNovedadPayload {
  tipo: string;
  studentIds?: string[];
  cursoLectivoId?: string;
  fecha: string;
  descripcion: string;
  creadoPor: string;
  evidencias?: string[];
  files?: File[];
}

interface ApiPaged<T> {
  data: { data: T[]; total: number; page: number; limit: number; totalPages: number };
}
interface ApiOne<T> { data: T }
interface ApiArr<T> { data: T[] }

export interface NovedadesPage {
  data: Novedad[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class NovedadesService {
  constructor(private http: HttpClient) {}

  private toParams<T extends object>(query: T): HttpParams {
    let params = new HttpParams();
    Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  getAll(query: NovedadesQuery = {}): Observable<NovedadesPage> {
    const params = this.toParams(query);
    return this.http.get<ApiPaged<Novedad>>(API, { params }).pipe(map((r) => r.data));
  }

  getReporte(query: NovedadesReporteQuery = {}): Observable<Novedad[]> {
    const params = this.toParams(query);
    return this.http.get<ApiArr<Novedad>>(`${API}/reporte`, { params }).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Novedad> {
    return this.http.get<ApiOne<Novedad>>(`${API}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: CreateNovedadPayload): Observable<Novedad> {
    const fd = new FormData();
    fd.append('tipo', payload.tipo);
    fd.append('fecha', payload.fecha);
    fd.append('descripcion', payload.descripcion);
    fd.append('creadoPor', payload.creadoPor);
    (payload.studentIds ?? []).forEach((id) => fd.append('studentIds', id));
    if (payload.cursoLectivoId) fd.append('cursoLectivoId', payload.cursoLectivoId);
    (payload.evidencias ?? []).forEach((url) => fd.append('evidencias', url));
    (payload.files ?? []).forEach((f) => fd.append('files', f));
    return this.http.post<ApiOne<Novedad>>(API, fd).pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }

  getFileUrl(path: string): string {
    // Cloudinary returns full https:// URLs; legacy local uploads have relative paths
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  isImage(path: string): boolean {
    return /\.(jpe?g|png|webp|gif)$/i.test(path);
  }
}
