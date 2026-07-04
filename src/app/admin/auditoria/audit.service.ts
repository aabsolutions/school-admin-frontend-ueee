import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuditLogFilters, PagedAuditLogs } from './audit.model';

interface ApiOne<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly API_URL = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(filters: AuditLogFilters): Observable<PagedAuditLogs> {
    let params = new HttpParams()
      .set('page', filters.page)
      .set('limit', filters.limit);

    if (filters.actorId) params = params.set('actorId', filters.actorId);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.platform) params = params.set('platform', filters.platform);
    if (filters.targetCollection) params = params.set('targetCollection', filters.targetCollection);
    if (filters.outcome) params = params.set('outcome', filters.outcome);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http
      .get<ApiOne<PagedAuditLogs>>(this.API_URL, { params })
      .pipe(map((r) => r.data));
  }
}
