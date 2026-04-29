import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import {
  RoleConfig,
  CreateRoleConfigPayload,
  UpdateRoleConfigPayload,
} from '@core/models/role-config.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly base = `${environment.apiUrl}/role-configs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoleConfig[]> {
    return this.http
      .get<{ data: RoleConfig[] }>(this.base)
      .pipe(map((r) => r.data));
  }

  getById(id: string): Observable<RoleConfig> {
    return this.http
      .get<{ data: RoleConfig }>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: CreateRoleConfigPayload): Observable<RoleConfig> {
    return this.http
      .post<{ data: RoleConfig }>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  update(id: string, payload: UpdateRoleConfigPayload): Observable<RoleConfig> {
    return this.http
      .put<{ data: RoleConfig }>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  updatePermissions(
    id: string,
    sidebarPermissions: string[]
  ): Observable<RoleConfig> {
    return this.http
      .put<{ data: RoleConfig }>(`${this.base}/${id}/permissions`, {
        sidebarPermissions,
      })
      .pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
