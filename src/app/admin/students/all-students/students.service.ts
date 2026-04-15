import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Students } from './students.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private readonly API_URL = `${environment.apiUrl}/students`;
  dataChange: BehaviorSubject<Students[]> = new BehaviorSubject<Students[]>([]);

  dialogData!: Students;

  constructor(private httpClient: HttpClient) {}

  get data(): Students[] {
    return this.dataChange.value;
  }

  getDialogData(): Students {
    return this.dialogData;
  }

  /** Map backend camelCase → frontend model */
  private normalize(raw: any): Students {
    return {
      ...raw,
      id: raw.id ?? raw._id,
      dni: raw.dni ?? '',
      mobile: raw.mobile ?? '',
      residenceZone: raw.residenceZone ?? '',
      birthdate: raw.birthdate ?? '',
      parentGuardianName: raw.parentGuardianName ?? '',
      parentGuardianMobile: raw.parentGuardianMobile ?? '',
      fatherName: raw.fatherName ?? '',
      fatherMobile: raw.fatherMobile ?? '',
      motherName: raw.motherName ?? '',
      motherMobile: raw.motherMobile ?? '',
      imgCuerpoEntero: raw.imgCuerpoEntero ?? '',
      peso: raw.peso ?? 0,
      talla: raw.talla ?? 0,
    };
  }

  /** Map frontend model → backend camelCase */
  private toPayload(student: any): any {
    const payload: any = {
      name: student.name,
      email: student.email,
      dni: student.dni || undefined,
      mobile: student.mobile || undefined,
      gender: student.gender || undefined,
      residenceZone: student.residenceZone || undefined,
      birthdate: student.birthdate || undefined,
      address: student.address,
      parentGuardianName: student.parentGuardianName || undefined,
      parentGuardianMobile: student.parentGuardianMobile || undefined,
      fatherName: student.fatherName || undefined,
      fatherMobile: student.fatherMobile || undefined,
      motherName: student.motherName || undefined,
      motherMobile: student.motherMobile || undefined,
      status: student.status,
      img: student.img,
    };
    if (student.username) payload.username = student.username;
    if (student.password) payload.password = student.password;
    return payload;
  }

  getAllStudents(): Observable<Students[]> {
    return this.httpClient.get<ApiList<any>>(this.API_URL).pipe(
      map((response) => {
        const students = response.data.data.map((s) => this.normalize(s));
        this.dataChange.next(students);
        return students;
      }),
      catchError(this.handleError)
    );
  }

  addStudent(student: Students): Observable<Students> {
    console.log(student);
    return this.httpClient.post<ApiOne<any>>(this.API_URL, this.toPayload(student)).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  updateStudent(student: Students): Observable<Students> {
    return this.httpClient
      .put<ApiOne<any>>(`${this.API_URL}/${student.id}`, this.toPayload(student))
      .pipe(
        map((response) => this.normalize(response.data)),
        catchError(this.handleError)
      );
  }

  deleteStudent(id: string | number): Observable<string | number> {
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
