import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

const API = `${environment.apiUrl}/documental-estudiante`;

interface ApiList<T> { data: { data: T[]; total: number; page: number; limit: number } }
interface ApiOne<T>  { data: T }

export interface DocumentalEstudiante {
  _id: string;
  studentId: string | any;
  nivelActual: string | null;
  boleta2do: boolean;
  boleta3ro: boolean;
  boleta4to: boolean;
  boleta5to: boolean;
  boleta6to: boolean;
  boleta7mo: boolean;
  boleta8vo: boolean;
  boleta9no: boolean;
  boleta10mo: boolean;
  boleta1roBach: boolean;
  boleta2doBach: boolean;
  copiaCedulaEstudiante: boolean;
  copiaCedulaRepresentante: boolean;
  certificadoParticipacion: boolean;
  notas?: string;
  student?: { name: string; dni: string; email: string; img: string };
}

export const NIVEL_BACH = ['1RO BACH', '2DO BACH', '3RO BACH'];

@Injectable({ providedIn: 'root' })
export class DocumentalEstudianteService {
  constructor(private http: HttpClient) {}

  getAll(search = '', page = 1, limit = 20): Observable<{ data: DocumentalEstudiante[]; total: number }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiList<DocumentalEstudiante>>(API, { params }).pipe(
      map(r => ({ data: r.data.data, total: r.data.total })),
    );
  }

  getOrCreate(studentId: string): Observable<DocumentalEstudiante> {
    return this.http
      .post<ApiOne<DocumentalEstudiante>>(`${API}/student/${studentId}/get-or-create`, {})
      .pipe(map(r => r.data));
  }

  update(id: string, payload: Partial<DocumentalEstudiante>): Observable<DocumentalEstudiante> {
    return this.http
      .put<ApiOne<DocumentalEstudiante>>(`${API}/${id}`, payload)
      .pipe(map(r => r.data));
  }

  /** For student portal — read own record */
  getMe(): Observable<DocumentalEstudiante> {
    return this.http
      .get<ApiOne<DocumentalEstudiante>>(`${API}/me`)
      .pipe(map(r => r.data));
  }
}
