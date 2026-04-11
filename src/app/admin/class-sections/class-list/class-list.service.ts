import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ClassList } from './class-list.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Injectable({
  providedIn: 'root',
})
export class ClassListService {
  private readonly API_URL = `${environment.apiUrl}/class-sections`;
  dataChange: BehaviorSubject<ClassList[]> = new BehaviorSubject<ClassList[]>([]);

  constructor(private httpClient: HttpClient) {}

  private normalize(raw: any): ClassList {
    return { ...raw, classId: raw.classId ?? raw.id ?? raw._id };
  }

  getAllClasses(): Observable<ClassList[]> {
    return this.httpClient.get<ApiList<any>>(this.API_URL).pipe(
      map((response) => {
        const classes = response.data.data.map((c) => this.normalize(c));
        this.dataChange.next(classes);
        return classes;
      }),
      catchError(this.handleError)
    );
  }

  addClass(newClass: ClassList): Observable<ClassList> {
    return this.httpClient.post<ApiOne<any>>(this.API_URL, newClass).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  updateClass(updatedClass: ClassList): Observable<ClassList> {
    return this.httpClient.put<ApiOne<any>>(`${this.API_URL}/${updatedClass.classId}`, updatedClass).pipe(
      map((response) => this.normalize(response.data)),
      catchError(this.handleError)
    );
  }

  deleteClass(id: string | number): Observable<string | number> {
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
