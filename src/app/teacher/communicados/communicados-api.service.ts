import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface TeacherCommunicado {
  _id: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  parentId: string;
  subject: string;
  body: string;
  status: 'sent' | 'received';
  receivedAt?: string;
  createdAt: string;
}

export interface CreateCommunicadoPayload {
  studentId: string;
  parentId: string;
  subject: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class CommunicadosApiService {
  private readonly base = `${environment.apiUrl}/communicados`;

  constructor(private http: HttpClient) {}

  getMyCommunicados(page = 1, limit = 10, search = ''): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.base}/teacher`, { params }).pipe(map((r) => r.data));
  }

  getOne(id: string): Observable<TeacherCommunicado> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: CreateCommunicadoPayload): Observable<TeacherCommunicado> {
    return this.http.post<any>(this.base, payload).pipe(map((r) => r.data));
  }
}
