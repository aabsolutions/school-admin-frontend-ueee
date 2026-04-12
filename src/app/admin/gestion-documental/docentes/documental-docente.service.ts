import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

const API = `${environment.apiUrl}/documental-docente`;

interface ApiList<T> { data: { data: T[]; total: number; page: number; limit: number } }
interface ApiOne<T>  { data: T }

export interface DocumentoItem {
  _id: string;
  nombre: string;
  url: string;
  categoria: 'profesional' | 'planificacion';
  descripcion?: string;
  fecha: string;
}

export interface DocumentalDocente {
  _id: string;
  teacherId: string | any;
  documentos: DocumentoItem[];
  totalProfesionales?: number;
  totalPlanificaciones?: number;
  teacher?: { name: string; dni: string; email: string; img: string };
}

@Injectable({ providedIn: 'root' })
export class DocumentalDocenteService {
  constructor(private http: HttpClient) {}

  getAll(search = '', page = 1, limit = 20): Observable<{ data: DocumentalDocente[]; total: number }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiList<DocumentalDocente>>(API, { params }).pipe(
      map(r => ({ data: r.data.data, total: r.data.total })),
    );
  }

  getByTeacher(teacherId: string): Observable<DocumentalDocente> {
    return this.http
      .get<ApiOne<DocumentalDocente>>(`${API}/teacher/${teacherId}`)
      .pipe(map(r => r.data));
  }

  uploadDocumento(teacherId: string, formData: FormData): Observable<DocumentalDocente> {
    return this.http
      .post<ApiOne<DocumentalDocente>>(`${API}/teacher/${teacherId}/documentos`, formData)
      .pipe(map(r => r.data));
  }

  deleteDocumento(teacherId: string, docId: string): Observable<DocumentalDocente> {
    return this.http
      .delete<ApiOne<DocumentalDocente>>(`${API}/teacher/${teacherId}/documentos/${docId}`)
      .pipe(map(r => r.data));
  }

  /** Teacher self-service */
  getMe(): Observable<DocumentalDocente> {
    return this.http.get<ApiOne<DocumentalDocente>>(`${API}/me`).pipe(map(r => r.data));
  }

  uploadMe(formData: FormData): Observable<DocumentalDocente> {
    return this.http
      .post<ApiOne<DocumentalDocente>>(`${API}/me/documentos`, formData)
      .pipe(map(r => r.data));
  }

  deleteMe(docId: string): Observable<DocumentalDocente> {
    return this.http
      .delete<ApiOne<DocumentalDocente>>(`${API}/me/documentos/${docId}`)
      .pipe(map(r => r.data));
  }
}
