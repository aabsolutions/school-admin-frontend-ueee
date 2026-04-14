import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface DisponiblesResponse {
  disponibles:        MateriaItem[];
  asignadasAlDocente: string[];
}

export interface MateriaItem {
  _id:    string;
  nombre: string;
  codigo: string;
}

export interface AsignacionItem {
  _id:       string;
  materiaId: MateriaItem;
  docenteId: { _id: string; name: string; email: string };
}

export interface TeacherItem {
  _id:   string;
  id:    string;
  name:  string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class CargaHorariaService {
  private readonly BASE    = `${environment.apiUrl}/carga-horaria`;
  private readonly TEACH   = `${environment.apiUrl}/teachers`;

  constructor(private http: HttpClient) {}

  searchDocentes(search: string): Observable<TeacherItem[]> {
    const params = new HttpParams().set('search', search).set('limit', '20');
    return this.http.get<{ data: { data: any[] } }>(this.TEACH, { params }).pipe(
      map(r => r.data.data.map(t => ({ ...t, id: t._id ?? t.id }))),
      catchError(this.handleError),
    );
  }

  getDisponibles(cursoLectivoId: string, docenteId: string): Observable<DisponiblesResponse> {
    const params = new HttpParams().set('docenteId', docenteId);
    return this.http.get<{ data: DisponiblesResponse }>(
      `${this.BASE}/curso-lectivo/${cursoLectivoId}/disponibles`, { params }
    ).pipe(
      map(r => r.data),
      catchError(this.handleError),
    );
  }

  setAsignacion(cursoLectivoId: string, docenteId: string, materiaIds: string[]): Observable<AsignacionItem[]> {
    return this.http.put<{ data: AsignacionItem[] }>(
      `${this.BASE}/curso-lectivo/${cursoLectivoId}/docente/${docenteId}`,
      { materiaIds },
    ).pipe(
      map(r => r.data),
      catchError(this.handleError),
    );
  }

  findByCursoLectivo(cursoLectivoId: string): Observable<AsignacionItem[]> {
    return this.http.get<{ data: AsignacionItem[] }>(
      `${this.BASE}/curso-lectivo/${cursoLectivoId}`
    ).pipe(
      map(r => r.data),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message ?? error.message ?? 'Algo salió mal';
    return throwError(() => new Error(Array.isArray(message) ? message.join(', ') : message));
  }
}
