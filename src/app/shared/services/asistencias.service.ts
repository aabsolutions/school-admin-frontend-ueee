import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  AttendanceAssignment,
  AttendanceConsolidated,
  AttendanceRecord,
  ChildAttendanceSummary,
  SaveAttendancePayload,
  StudentHistoryEntry,
} from './asistencias.model';

interface ApiList<T> {
  data: { data: T[]; total: number; page: number; limit: number; totalPages: number };
}
interface ApiOne<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  private readonly BASE = `${environment.apiUrl}/asistencias`;

  constructor(private http: HttpClient) {}

  // ─── ASSIGNMENTS ────────────────────────────────────────────────────────────

  getMyAssignment(): Observable<AttendanceAssignment> {
    return this.http.get<ApiOne<AttendanceAssignment>>(`${this.BASE}/assignments/me`).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  getAllAssignments(
    page = 1,
    limit = 20,
  ): Observable<{ data: AttendanceAssignment[]; total: number }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ApiList<AttendanceAssignment>>(`${this.BASE}/assignments`, { params })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  createAssignment(userId: string, cursoLectivoId: string): Observable<AttendanceAssignment> {
    return this.http
      .post<ApiOne<AttendanceAssignment>>(`${this.BASE}/assignments`, { userId, cursoLectivoId })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  deleteAssignment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/assignments/${id}`).pipe(
      catchError(this.handleError),
    );
  }

  // ─── RECORDS ────────────────────────────────────────────────────────────────

  saveAttendance(
    payload: SaveAttendancePayload,
  ): Observable<{ record: AttendanceRecord; absentCount: number }> {
    return this.http
      .post<ApiOne<{ record: AttendanceRecord; absentCount: number }>>(`${this.BASE}/records`, payload)
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  getMyRecords(params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<{ data: AttendanceRecord[]; total: number }> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiList<AttendanceRecord>>(`${this.BASE}/records/mine`, { params: httpParams })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  getAllRecords(params: {
    page?: number;
    limit?: number;
    cursoLectivoId?: string;
    dateFrom?: string;
    dateTo?: string;
    studentId?: string;
  }): Observable<{ data: AttendanceRecord[]; total: number }> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiList<AttendanceRecord>>(`${this.BASE}/records`, { params: httpParams })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  getConsolidated(
    cursoLectivoId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Observable<AttendanceConsolidated> {
    const params = this.buildParams({ cursoLectivoId, dateFrom, dateTo });
    return this.http
      .get<ApiOne<AttendanceConsolidated>>(`${this.BASE}/records/consolidated`, { params })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  getStudentHistory(
    studentId: string,
    params: { page?: number; limit?: number; cursoLectivoId?: string; dateFrom?: string; dateTo?: string } = {},
  ): Observable<{ data: StudentHistoryEntry[]; total: number }> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiList<StudentHistoryEntry>>(`${this.BASE}/records/student/${studentId}`, {
        params: httpParams,
      })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  getMyChildrenAttendance(
    params: { dateFrom?: string; dateTo?: string } = {},
  ): Observable<ChildAttendanceSummary[]> {
    const httpParams = this.buildParams(params);
    return this.http
      .get<ApiOne<ChildAttendanceSummary[]>>(`${this.BASE}/records/my-children`, {
        params: httpParams,
      })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  getMyStudentProfile(): Observable<{ _id: string; name: string }> {
    return this.http.get<ApiOne<any>>(`${environment.apiUrl}/students/me`).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  // ─── SUPPORTING ─────────────────────────────────────────────────────────────

  getCursoLectivos(): Observable<any[]> {
    const params = new HttpParams().set('limit', '200');
    return this.http.get<any>(`${environment.apiUrl}/curso-lectivo`, { params }).pipe(
      map((r) => r.data?.data ?? r.data ?? []),
      catchError(this.handleError),
    );
  }

  getUsers(search?: string): Observable<any[]> {
    let params = new HttpParams().set('limit', '100');
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${environment.apiUrl}/users`, { params }).pipe(
      map((r) => r.data?.data ?? r.data ?? []),
      catchError(this.handleError),
    );
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private buildParams(obj: Record<string, any>): HttpParams {
    let params = new HttpParams();
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    }
    return params;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message ?? error.message ?? 'Error al procesar la solicitud';
    return throwError(() => new Error(message));
  }
}
