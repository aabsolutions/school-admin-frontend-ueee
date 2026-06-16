import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DriveDocumento, ExpedienteAcademico, StudentExpedienteRow } from './expediente-academico.model';

@Injectable({ providedIn: 'root' })
export class ExpedienteAcademicoService {
  private readonly base = `${environment.apiUrl}/expediente-academico`;

  constructor(private http: HttpClient) {}

  getSecciones(): Observable<string[]> {
    return this.http.get<any>(`${this.base}/secciones`).pipe(map((r) => r.data ?? []));
  }

  getSeccionesStats(): Observable<{ nombre: string; count: number }[]> {
    return this.http.get<any>(`${this.base}/secciones/stats`).pipe(map((r) => r.data ?? []));
  }

  deleteSeccionGlobal(seccionName: string): Observable<{ deleted: number }> {
    return this.http
      .delete<any>(`${this.base}/secciones/${encodeURIComponent(seccionName)}`)
      .pipe(map((r) => r.data));
  }

  getAll(search = '', page = 1, limit = 10): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.base, { params }).pipe(map((r) => r.data));
  }

  getOrCreate(studentId: string): Observable<ExpedienteAcademico> {
    return this.http
      .post<any>(`${this.base}/student/${studentId}/get-or-create`, {})
      .pipe(map((r) => r.data));
  }

  getByStudent(studentId: string): Observable<{ expediente: ExpedienteAcademico; documentos: DriveDocumento[] }> {
    return this.http
      .get<any>(`${this.base}/student/${studentId}`)
      .pipe(map((r) => r.data));
  }

  getDocumentos(expedienteId: string): Observable<DriveDocumento[]> {
    return this.http
      .get<any>(`${this.base}/${expedienteId}/documentos`)
      .pipe(map((r) => r.data));
  }

  addDocumento(expedienteId: string, dto: Partial<DriveDocumento>): Observable<DriveDocumento> {
    return this.http
      .post<any>(`${this.base}/${expedienteId}/documentos`, dto)
      .pipe(map((r) => r.data));
  }

  updateDocumento(
    expedienteId: string,
    docId: string,
    dto: Partial<DriveDocumento>,
  ): Observable<DriveDocumento> {
    return this.http
      .put<any>(`${this.base}/${expedienteId}/documentos/${docId}`, dto)
      .pipe(map((r) => r.data));
  }

  deleteDocumento(expedienteId: string, docId: string): Observable<void> {
    return this.http
      .delete<any>(`${this.base}/${expedienteId}/documentos/${docId}`)
      .pipe(map(() => undefined));
  }

  deleteSeccion(expedienteId: string, seccionName: string): Observable<void> {
    return this.http
      .delete<any>(`${this.base}/${expedienteId}/secciones/${encodeURIComponent(seccionName)}`)
      .pipe(map(() => undefined));
  }

  deleteExpediente(id: string): Observable<void> {
    return this.http.delete<any>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
