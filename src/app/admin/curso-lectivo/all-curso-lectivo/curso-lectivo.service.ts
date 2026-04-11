import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { CursoLectivo } from './curso-lectivo.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({ providedIn: 'root' })
export class CursoLectivoService {
  private readonly API_URL = `${environment.apiUrl}/curso-lectivo`;
  dataChange = new BehaviorSubject<CursoLectivo[]>([]);

  constructor(private http: HttpClient) {}

  get data(): CursoLectivo[] { return this.dataChange.value; }

  private normalize(raw: any): CursoLectivo {
    const cl: any = { ...raw, id: raw.id ?? raw._id };

    if (raw.cursoId && typeof raw.cursoId === 'object') {
      const c = raw.cursoId;
      cl.cursoDisplay = `${c.nivel} - ${c.especialidad} - ${c.paralelo} - ${c.jornada}`;
      cl.cursoId = c._id ?? c.id;
    }
    if (raw.tutorId && typeof raw.tutorId === 'object') {
      cl.tutorName = raw.tutorId.name ?? '';
      cl.tutorId = raw.tutorId._id ?? raw.tutorId.id;
    }
    if (raw.inspectorId && typeof raw.inspectorId === 'object') {
      cl.inspectorName = raw.inspectorId.name ?? '';
      cl.inspectorId = raw.inspectorId._id ?? raw.inspectorId.id;
    }
    if (raw.psicologoId && typeof raw.psicologoId === 'object') {
      cl.psicologoName = raw.psicologoId.name ?? '';
      cl.psicologoId = raw.psicologoId._id ?? raw.psicologoId.id;
    }

    return cl;
  }

  getAll(): Observable<CursoLectivo[]> {
    return this.http.get<ApiList<any>>(this.API_URL).pipe(
      map(r => {
        const items = r.data.data.map(c => this.normalize(c));
        this.dataChange.next(items);
        return items;
      }),
      catchError(this.handleError)
    );
  }

  add(cl: Partial<CursoLectivo>): Observable<CursoLectivo> {
    return this.http.post<ApiOne<any>>(this.API_URL, this.toPayload(cl)).pipe(
      map(r => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  update(cl: Partial<CursoLectivo>): Observable<CursoLectivo> {
    return this.http.put<ApiOne<any>>(`${this.API_URL}/${cl.id}`, this.toPayload(cl)).pipe(
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

  private toPayload(cl: Partial<CursoLectivo>): any {
    return {
      cursoId: cl.cursoId || undefined,
      academicYear: cl.academicYear,
      tutorId: cl.tutorId || undefined,
      inspectorId: cl.inspectorId || undefined,
      psicologoId: cl.psicologoId || undefined,
      status: cl.status,
    };
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message ?? error.message ?? 'Algo salió mal, intente nuevamente.';
    return throwError(() => new Error(message));
  }
}
