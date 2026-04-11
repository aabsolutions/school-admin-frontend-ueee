import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Expediente, ExpedienteRegistro } from './expediente.model';

const API = `${environment.apiUrl}/expedientes`;

interface ApiList<T> { data: { data: T[]; total: number; page: number; limit: number } }
interface ApiOne<T>  { data: T }
interface ApiArr<T>  { data: T[] }

@Injectable({ providedIn: 'root' })
export class ExpedientesService {
  constructor(private http: HttpClient) {}

  getAll(search = '', page = 1, limit = 20): Observable<{ data: Expediente[]; total: number }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiList<Expediente>>(API, { params }).pipe(
      map(r => ({ data: r.data.data, total: r.data.total })),
    );
  }

  getByStudent(studentId: string): Observable<Expediente | null> {
    return this.http.get<ApiOne<Expediente>>(`${API}/student/${studentId}`).pipe(
      map(r => r.data),
    );
  }

  getOrCreate(studentId: string): Observable<Expediente> {
    return this.http.post<ApiOne<Expediente>>(`${API}/student/${studentId}/get-or-create`, {}).pipe(
      map(r => r.data),
    );
  }

  getRegistros(expedienteId: string): Observable<ExpedienteRegistro[]> {
    return this.http.get<ApiArr<ExpedienteRegistro>>(`${API}/${expedienteId}/registros`).pipe(
      map(r => r.data),
    );
  }

  addRegistro(expedienteId: string, formData: FormData): Observable<ExpedienteRegistro> {
    return this.http.post<ApiOne<ExpedienteRegistro>>(
      `${API}/${expedienteId}/registros`, formData,
    ).pipe(map(r => r.data));
  }

  updateRegistro(expedienteId: string, registroId: string, formData: FormData): Observable<ExpedienteRegistro> {
    return this.http.put<ApiOne<ExpedienteRegistro>>(
      `${API}/${expedienteId}/registros/${registroId}`, formData,
    ).pipe(map(r => r.data));
  }

  deleteExpediente(expedienteId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${expedienteId}`);
  }

  deleteRegistro(expedienteId: string, registroId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${expedienteId}/registros/${registroId}`);
  }

  deleteEvidencia(expedienteId: string, registroId: string, url: string): Observable<ExpedienteRegistro> {
    return this.http.delete<ApiOne<ExpedienteRegistro>>(
      `${API}/${expedienteId}/registros/${registroId}/evidencias`,
      { body: { url } },
    ).pipe(map(r => r.data));
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
