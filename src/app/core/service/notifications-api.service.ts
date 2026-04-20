import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface AppNotification {
  _id: string;
  recipient: string;
  type: 'message' | 'system' | 'enrollment' | 'expediente' | 'dece';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly base = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 20): Observable<{ data: AppNotification[]; total: number; unread: number }> {
    return this.http
      .get<{ data: { data: AppNotification[]; total: number; unread: number } }>(
        this.base, { params: { page, limit } }
      )
      .pipe(map((r) => r.data));
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<{ data: number }>(`${this.base}/unread-count`)
      .pipe(map((r) => r.data));
  }

  markRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/read-all`, {});
  }

  deleteOne(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  broadcast(payload: { title: string; body: string; link?: string; roles?: string[] }): Observable<void> {
    return this.http.post<void>(`${this.base}/broadcast`, payload);
  }
}
