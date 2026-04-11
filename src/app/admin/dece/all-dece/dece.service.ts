import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DeceExpediente, DeceRegistro } from './dece.model';

const API = `${environment.apiUrl}/dece`;

interface ApiList<T> { data: { data: T[]; total: number } }
interface ApiOne<T>  { data: T }
interface ApiArr<T>  { data: T[] }

@Injectable({ providedIn: 'root' })
export class DeceService {
  constructor(private http: HttpClient) {}

  getAll(search = '', page = 1, limit = 200): Observable<{ data: DeceExpediente[]; total: number }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiList<DeceExpediente>>(API, { params }).pipe(
      map(r => ({ data: r.data.data, total: r.data.total })),
    );
  }

  getOrCreate(studentId: string): Observable<DeceExpediente> {
    return this.http.post<ApiOne<DeceExpediente>>(`${API}/student/${studentId}/get-or-create`, {}).pipe(
      map(r => r.data),
    );
  }

  getRegistros(expedienteId: string): Observable<DeceRegistro[]> {
    return this.http.get<ApiArr<DeceRegistro>>(`${API}/${expedienteId}/registros`).pipe(
      map(r => r.data),
    );
  }

  addRegistro(expedienteId: string, formData: FormData): Observable<DeceRegistro> {
    return this.http.post<ApiOne<DeceRegistro>>(`${API}/${expedienteId}/registros`, formData).pipe(
      map(r => r.data),
    );
  }

  updateRegistro(expedienteId: string, registroId: string, formData: FormData): Observable<DeceRegistro> {
    return this.http.put<ApiOne<DeceRegistro>>(
      `${API}/${expedienteId}/registros/${registroId}`, formData,
    ).pipe(map(r => r.data));
  }

  deleteRegistro(expedienteId: string, registroId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${expedienteId}/registros/${registroId}`);
  }

  deleteEvidencia(expedienteId: string, registroId: string, url: string): Observable<DeceRegistro> {
    return this.http.delete<ApiOne<DeceRegistro>>(
      `${API}/${expedienteId}/registros/${registroId}/evidencias`,
      { body: { url } },
    ).pipe(map(r => r.data));
  }

  deleteExpediente(expedienteId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${expedienteId}`);
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
