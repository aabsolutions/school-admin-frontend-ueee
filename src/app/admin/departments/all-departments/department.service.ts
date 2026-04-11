import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Department } from './department.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly API_URL = `${environment.apiUrl}/departments`;
  dataChange: BehaviorSubject<Department[]> = new BehaviorSubject<Department[]>([]);

  constructor(private httpClient: HttpClient) {}

  /** Map backend camelCase → frontend snake_case */
  private normalize(raw: any): Department {
    return {
      ...raw,
      id: raw.id ?? raw._id,
      department_name: raw.department_name ?? raw.departmentName ?? '',
      hod: raw.hod ?? raw.hodName ?? '',
      student_capacity: raw.student_capacity ?? String(raw.studentCapacity ?? ''),
      establishedYear: String(raw.establishedYear ?? ''),
      totalFaculty: String(raw.totalFaculty ?? ''),
    };
  }

  /** Map frontend snake_case → backend camelCase */
  private toPayload(dept: any): any {
    return {
      departmentName: dept.departmentName ?? dept.department_name,
      hodName: dept.hodName ?? dept.hod,
      phone: dept.phone,
      email: dept.email,
      studentCapacity: Number(dept.studentCapacity ?? dept.student_capacity ?? 0),
      establishedYear: Number(dept.establishedYear ?? 0),
      totalFaculty: Number(dept.totalFaculty ?? 0),
      description: dept.description,
    };
  }

  getAllDepartments(): Observable<Department[]> {
    return this.httpClient.get<ApiList<any>>(this.API_URL).pipe(
      map((response) => {
        const departments = response.data.data.map((d) => this.normalize(d));
        this.dataChange.next(departments);
        return departments;
      }),
      catchError(this.handleError)
    );
  }

  addDepartment(department: Department): Observable<Department> {
    return this.httpClient.post<ApiOne<any>>(this.API_URL, this.toPayload(department)).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  updateDepartment(department: Department): Observable<Department> {
    return this.httpClient
      .put<ApiOne<any>>(`${this.API_URL}/${department.id}`, this.toPayload(department))
      .pipe(
        map((response) => this.normalize(response.data)),
        catchError(this.handleError)
      );
  }

  deleteDepartment(id: string | number): Observable<string | number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => id),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
