import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Enrollment } from './enrollment.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly API_URL = `${environment.apiUrl}/enrollments`;
  dataChange = new BehaviorSubject<Enrollment[]>([]);

  constructor(private http: HttpClient) {}

  get data(): Enrollment[] { return this.dataChange.value; }

  private normalize(raw: any): Enrollment {
    const e: any = { ...raw, id: raw.id ?? raw._id };

    if (raw.studentId && typeof raw.studentId === 'object') {
      e.studentName = raw.studentId.name ?? '';
      e.studentDni  = raw.studentId.dni ?? '';
      e.studentId   = raw.studentId._id ?? raw.studentId.id;
    }

    if (raw.cursoLectivoId && typeof raw.cursoLectivoId === 'object') {
      e.academicYear = raw.cursoLectivoId.academicYear ?? '';
      const curso = raw.cursoLectivoId.cursoId;
      if (curso && typeof curso === 'object') {
        e.cursoDisplay = `${curso.nivel} - ${curso.especialidad} - ${curso.paralelo} - ${curso.jornada}`;
      }
      e.cursoLectivoId = raw.cursoLectivoId._id ?? raw.cursoLectivoId.id;
    }

    return e;
  }

  getAll(): Observable<Enrollment[]> {
    return this.http.get<ApiList<any>>(this.API_URL).pipe(
      map(r => {
        const items = r.data.data.map(e => this.normalize(e));
        this.dataChange.next(items);
        return items;
      }),
      catchError(this.handleError)
    );
  }

  add(enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.post<ApiOne<any>>(this.API_URL, {
      studentId: enrollment.studentId,
      cursoLectivoId: enrollment.cursoLectivoId,
      status: enrollment.status,
      notes: enrollment.notes,
    }).pipe(
      map(r => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  update(enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.put<ApiOne<any>>(`${this.API_URL}/${enrollment.id}`, {
      status: enrollment.status,
      notes: enrollment.notes,
    }).pipe(
      map(r => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  withdraw(id: string | number): Observable<Enrollment> {
    return this.http.patch<ApiOne<any>>(`${this.API_URL}/${id}/withdraw`, {}).pipe(
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
