import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Teachers } from './teachers.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({
  providedIn: 'root',
})
export class TeachersService {
  private readonly API_URL = `${environment.apiUrl}/teachers`;
  dataChange: BehaviorSubject<Teachers[]> = new BehaviorSubject<Teachers[]>([]);

  constructor(private httpClient: HttpClient) {}

  /** Map backend camelCase → frontend model */
  private normalize(raw: any): Teachers {
    return {
      ...raw,
      id: raw.id ?? raw._id,
      experience_years: raw.experience_years ?? raw.experienceYears ?? 0,
      subject_specialization: raw.subject_specialization ?? raw.subjectSpecialization ?? '',
      department: raw.department ?? raw.departmentId?.departmentName ?? '',
      departmentId: raw.departmentId?._id ?? raw.departmentId?.id ?? raw.departmentId ?? '',
      dni: raw.dni ?? '',
      laboralDependency: raw.laboralDependency ?? '',
      salarialCategory: raw.salarialCategory ?? '',
      emergencyName: raw.emergencyName ?? '',
      emergencyMobile: raw.emergencyMobile ?? '',
    };
  }

  /** Map frontend model → backend camelCase for POST/PUT */
  private toPayload(teacher: any): any {
    const payload: any = {
      name: teacher.name,
      email: teacher.email,
      dni: teacher.dni || undefined,
      gender: teacher.gender,
      mobile: teacher.mobile,
      departmentId: teacher.departmentId || undefined,
      address: teacher.address,
      laboralDependency: teacher.laboralDependency || undefined,
      salarialCategory: teacher.salarialCategory || undefined,
      emergencyName: teacher.emergencyName || undefined,
      emergencyMobile: teacher.emergencyMobile || undefined,
      subjectSpecialization: teacher.subjectSpecialization ?? teacher.subject_specialization,
      experienceYears: teacher.experienceYears ?? teacher.experience_years,
      status: teacher.status,
      birthdate: teacher.birthdate || undefined,
      bio: teacher.bio,
      img: teacher.img,
    };
    if (teacher.username) payload.username = teacher.username;
    if (teacher.password) payload.password = teacher.password;
    return payload;
  }

  getAllTeachers(): Observable<Teachers[]> {
    return this.httpClient.get<ApiList<any>>(this.API_URL).pipe(
      map((response) => {
        const teachers = response.data.data.map((t) => this.normalize(t));
        this.dataChange.next(teachers);
        return teachers;
      }),
      catchError(this.handleError)
    );
  }

  addTeacher(teacher: Teachers): Observable<Teachers> {
    return this.httpClient.post<ApiOne<any>>(this.API_URL, this.toPayload(teacher)).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  updateTeacher(teacher: Teachers): Observable<Teachers> {
    return this.httpClient
      .put<ApiOne<any>>(`${this.API_URL}/${teacher.id}`, this.toPayload(teacher))
      .pipe(
        map((response) => this.normalize(response.data)),
        catchError(this.handleError)
      );
  }

  deleteTeacher(id: string | number): Observable<string | number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => id),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    const message =
      error.error?.message ?? error.message ?? 'Something went wrong; please try again later.';
    return throwError(() => new Error(message));
  }
}
