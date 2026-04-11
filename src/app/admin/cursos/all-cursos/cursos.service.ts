import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Curso } from './curso.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({ providedIn: 'root' })
export class CursosService {
  private readonly API_URL = `${environment.apiUrl}/cursos`;
  dataChange = new BehaviorSubject<Curso[]>([]);

  constructor(private http: HttpClient) {}

  get data(): Curso[] { return this.dataChange.value; }

  private normalize(raw: any): Curso {
    return { ...raw, id: raw.id ?? raw._id };
  }

  getAll(): Observable<Curso[]> {
    return this.http.get<ApiList<any>>(this.API_URL).pipe(
      map(r => {
        const cursos = r.data.data.map(c => this.normalize(c));
        this.dataChange.next(cursos);
        return cursos;
      }),
      catchError(this.handleError)
    );
  }

  add(curso: Partial<Curso>): Observable<Curso> {
    const { id: _, ...payload } = curso as any;
    return this.http.post<ApiOne<any>>(this.API_URL, payload).pipe(
      map(r => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  update(curso: Partial<Curso>): Observable<Curso> {
    const { id: _, ...payload } = curso as any;
    return this.http.put<ApiOne<any>>(`${this.API_URL}/${curso.id}`, payload).pipe(
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
