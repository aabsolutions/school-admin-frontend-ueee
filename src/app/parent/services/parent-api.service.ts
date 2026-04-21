import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface ParentProfile {
  _id: string;
  name: string;
  email: string;
  dni?: string;
  mobile?: string;
  gender?: string;
  studentIds?: StudentSummary[];
}

export interface StudentSummary {
  _id: string;
  name: string;
  email?: string;
  dni?: string;
  img?: string;
  imgCuerpoEntero?: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  status?: string;
  mobile?: string;
}

export interface Communicado {
  _id: string;
  teacherName: string;
  studentName: string;
  subject: string;
  body: string;
  status: 'sent' | 'received';
  receivedAt?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ParentApiService {
  private readonly base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<ParentProfile> {
    return this.http.get<any>(`${this.base}/parents/me`).pipe(map((r) => r.data));
  }

  getHijos(): Observable<StudentSummary[]> {
    return this.http.get<any>(`${this.base}/parents/me/hijos`).pipe(map((r) => r.data));
  }

  getCommunicados(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(`${this.base}/communicados/parent`, { params }).pipe(map((r) => r.data));
  }

  getCommunicado(id: string): Observable<Communicado> {
    return this.http.get<any>(`${this.base}/communicados/${id}`).pipe(map((r) => r.data));
  }

  markReceived(id: string): Observable<Communicado> {
    return this.http.patch<any>(`${this.base}/communicados/${id}/received`, {}).pipe(map((r) => r.data));
  }
}
