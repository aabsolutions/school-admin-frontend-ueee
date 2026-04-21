import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Parent {
  _id: string;
  name: string;
  email: string;
  dni?: string;
  mobile?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  educationLevel?: string;
  studentIds?: any[];
  isActive: boolean;
  createdAt?: string;
}

export interface ParentSearchResult {
  _id: string;
  name: string;
  email: string;
  dni?: string;
  mobile?: string;
}

export interface PaginatedParents {
  data: Parent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ParentsApiService {
  private readonly base = `${environment.apiUrl}/parents`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10, search = ''): Observable<PaginatedParents> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.base, { params }).pipe(map((r) => r.data));
  }

  getOne(id: string): Observable<Parent> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: any): Observable<Parent> {
    return this.http.post<any>(this.base, payload).pipe(map((r) => r.data));
  }

  update(id: string, payload: any): Observable<Parent> {
    return this.http.patch<any>(`${this.base}/${id}`, payload).pipe(map((r) => r.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  search(q: string, studentId?: string): Observable<ParentSearchResult[]> {
    let params = new HttpParams().set('q', q);
    if (studentId) params = params.set('studentId', studentId);
    return this.http.get<any>(`${this.base}/search`, { params }).pipe(map((r) => r.data));
  }

  linkStudents(parentId: string, studentIds: string[]): Observable<Parent> {
    return this.http.post<any>(`${this.base}/${parentId}/link`, { studentIds }).pipe(map((r) => r.data));
  }

  unlinkStudent(parentId: string, studentId: string): Observable<Parent> {
    return this.http.delete<any>(`${this.base}/${parentId}/unlink/${studentId}`).pipe(map((r) => r.data));
  }
}
