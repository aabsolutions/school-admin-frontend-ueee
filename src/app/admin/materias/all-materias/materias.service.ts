import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Materia } from './materia.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({ providedIn: 'root' })
export class MateriasService {
  private readonly API_URL = `${environment.apiUrl}/materias`;

  constructor(private http: HttpClient) {}

  private normalize(raw: any): Materia {
    return new Materia({ ...raw, id: raw.id ?? raw._id });
  }

  getAll(): Observable<Materia[]> {
    return this.http.get<ApiList<any>>(this.API_URL).pipe(
      map(r => r.data.data.map(m => this.normalize(m))),
      catchError(this.handleError)
    );
  }

  add(materia: Partial<Materia>): Observable<Materia> {
    const { id: _, ...payload } = materia as any;
    return this.http.post<ApiOne<any>>(this.API_URL, payload).pipe(
      map(r => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  update(materia: Partial<Materia>): Observable<Materia> {
    const { id: _, ...payload } = materia as any;
    return this.http.put<ApiOne<any>>(`${this.API_URL}/${materia.id}`, payload).pipe(
      map(r => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  delete(id: string | number): Observable<string | number> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => id),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message ?? error.message ?? 'Algo salió mal, intente nuevamente.';
    return throwError(() => new Error(message));
  }
}
