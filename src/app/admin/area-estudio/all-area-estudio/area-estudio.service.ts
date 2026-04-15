import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AreaEstudio } from './area-estudio.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AreaEstudioService {
  private readonly API = `${environment.apiUrl}/area-estudio`;
  dataChange = new BehaviorSubject<AreaEstudio[]>([]);

  constructor(private http: HttpClient) {}

  private normalize(raw: any): AreaEstudio {
    return new AreaEstudio({ ...raw, id: raw._id ?? raw.id });
  }

  getAll(): Observable<AreaEstudio[]> {
    return this.http.get<any>(this.API).pipe(
      map((res) => {
        const list = (res.data?.data ?? res.data ?? res) as any[];
        const areas = list.map((a) => this.normalize(a));
        this.dataChange.next(areas);
        return areas;
      }),
      catchError(this.handleError),
    );
  }

  add(area: AreaEstudio): Observable<AreaEstudio> {
    return this.http.post<any>(this.API, { nombre: area.nombre, descripcion: area.descripcion, isActive: area.isActive }).pipe(
      map((res) => this.normalize(res.data ?? res)),
      catchError(this.handleError),
    );
  }

  update(area: AreaEstudio): Observable<AreaEstudio> {
    return this.http.put<any>(`${this.API}/${area.id}`, { nombre: area.nombre, descripcion: area.descripcion, isActive: area.isActive }).pipe(
      map((res) => this.normalize(res.data ?? res)),
      catchError(this.handleError),
    );
  }

  delete(id: string | number): Observable<string | number> {
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      map(() => id),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.error?.message || 'Error en el servidor'));
  }
}
