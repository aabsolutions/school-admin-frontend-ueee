import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Course } from './course.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly API_URL = `${environment.apiUrl}/courses`;
  dataChange: BehaviorSubject<Course[]> = new BehaviorSubject<Course[]>([]);

  dialogData!: Course;

  constructor(private httpClient: HttpClient) {}

  get data(): Course[] {
    return this.dataChange.value;
  }

  getDialogData(): Course {
    return this.dialogData;
  }

  private normalize(raw: any): Course {
    const item = { ...raw, id: raw.id ?? raw._id };
    // Flatten populated departmentId object
    if (raw.departmentId && typeof raw.departmentId === 'object') {
      item.departmentId = raw.departmentId._id ?? raw.departmentId.id ?? raw.departmentId;
      item.department = raw.departmentId.departmentName ?? item.department;
    }
    return item;
  }

  getAllCourses(): Observable<Course[]> {
    return this.httpClient.get<ApiList<any>>(this.API_URL).pipe(
      map((response) => {
        const courses = response.data.data.map((c) => this.normalize(c));
        this.dataChange.next(courses);
        return courses;
      }),
      catchError(this.handleError)
    );
  }

  addCourse(course: Course): Observable<Course> {
    return this.httpClient.post<ApiOne<any>>(this.API_URL, course).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  updateCourse(course: Course): Observable<Course> {
    return this.httpClient.put<ApiOne<any>>(`${this.API_URL}/${course.id}`, course).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  deleteCourse(id: string | number): Observable<string | number> {
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
