import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AppUser } from './user.model';
import { environment } from '@environments/environment';

interface ApiList<T> { data: T[] }
interface ApiOne<T>  { data: T }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;
  dataChange = new BehaviorSubject<AppUser[]>([]);

  constructor(private http: HttpClient) {}

  private normalize(raw: any): AppUser {
    return { ...raw, id: raw.id ?? raw._id };
  }

  getAllUsers(): Observable<AppUser[]> {
    return this.http.get<ApiList<any>>(this.API_URL).pipe(
      map((r) => {
        const users = r.data.map((u) => this.normalize(u));
        this.dataChange.next(users);
        return users;
      }),
      catchError(this.handleError)
    );
  }

  addUser(user: AppUser & { password: string }): Observable<AppUser> {
    console.log(user);
    return this.http.post<ApiOne<any>>(this.API_URL, user).pipe(
      map((r) => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  updateUser(user: AppUser): Observable<AppUser> {
    const { id, ...body } = user;
    return this.http.put<ApiOne<any>>(`${this.API_URL}/${id}`, body).pipe(
      map((r) => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  toggleStatus(id: string | number): Observable<AppUser> {
    return this.http.patch<ApiOne<any>>(`${this.API_URL}/${id}/status`, {}).pipe(
      map((r) => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<AppUser> {
    return this.http.get<ApiOne<any>>(`${this.API_URL}/me`).pipe(
      map((r) => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  updateProfile(data: Partial<AppUser> & { password?: string }): Observable<AppUser> {
    return this.http.patch<ApiOne<any>>(`${this.API_URL}/me`, data).pipe(
      map((r) => this.normalize(r.data)),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string | number): Observable<string | number> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => id),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    let message: string;
    if (error.status === 0) {
      message = 'Cannot connect to the server. Make sure the backend is running.';
    } else if (error.error?.message) {
      message = Array.isArray(error.error.message)
        ? error.error.message.join(', ')
        : error.error.message;
    } else {
      message = `Server error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(message));
  }
}
