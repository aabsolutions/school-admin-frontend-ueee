import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  Plantilla, Tramite, TramiteHistory, ParsedVariables, TramiteStats,
  PagedResult, VariableConfig,
} from './tramitologia.model';

interface ApiOne<T> { data: T; }
interface ApiList<T> { data: PagedResult<T>; }

@Injectable({ providedIn: 'root' })
export class TramitologiaService {
  private readonly BASE = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ─── PLANTILLAS ─────────────────────────────────────────────────────────────

  getPlantillas(page = 1, limit = 10, search?: string): Observable<PagedResult<Plantilla>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiList<Plantilla>>(`${this.BASE}/plantillas`, { params }).pipe(map((r) => r.data));
  }

  getAvailablePlantillas(): Observable<Plantilla[]> {
    return this.http.get<ApiOne<Plantilla[]>>(`${this.BASE}/plantillas/available`).pipe(map((r) => r.data));
  }

  getPlantilla(id: string): Observable<Plantilla> {
    return this.http.get<ApiOne<Plantilla>>(`${this.BASE}/plantillas/${id}`).pipe(map((r) => r.data));
  }

  createPlantilla(body: Partial<Plantilla>): Observable<Plantilla> {
    return this.http.post<ApiOne<Plantilla>>(`${this.BASE}/plantillas`, body).pipe(map((r) => r.data));
  }

  updatePlantilla(id: string, body: Partial<Plantilla>): Observable<Plantilla> {
    return this.http.patch<ApiOne<Plantilla>>(`${this.BASE}/plantillas/${id}`, body).pipe(map((r) => r.data));
  }

  deletePlantilla(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/plantillas/${id}`);
  }

  parseVariables(bodyHtml: string): Observable<ParsedVariables> {
    return this.http
      .post<ApiOne<ParsedVariables>>(`${this.BASE}/plantillas/parse-variables`, { bodyHtml })
      .pipe(map((r) => r.data));
  }

  // ─── TRAMITES ────────────────────────────────────────────────────────────────

  createTramite(body: { plantillaId: string; operativoUserId?: string; values: Array<{ key: string; value: unknown }> }): Observable<Tramite> {
    return this.http.post<ApiOne<Tramite>>(`${this.BASE}/tramites`, body).pipe(map((r) => r.data));
  }

  uploadAttachment(tramiteId: string, formData: FormData): Observable<Tramite> {
    return this.http
      .post<ApiOne<Tramite>>(`${this.BASE}/tramites/${tramiteId}/attachments`, formData)
      .pipe(map((r) => r.data));
  }

  getMyTramites(page = 1, limit = 10, state?: string): Observable<PagedResult<Tramite>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (state) params = params.set('state', state);
    return this.http.get<ApiList<Tramite>>(`${this.BASE}/tramites/mine`, { params }).pipe(map((r) => r.data));
  }

  getInbox(page = 1, limit = 10, state?: string): Observable<PagedResult<Tramite>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (state) params = params.set('state', state);
    return this.http.get<ApiList<Tramite>>(`${this.BASE}/tramites/inbox`, { params }).pipe(map((r) => r.data));
  }

  getAllTramites(filters: Record<string, unknown> = {}): Observable<PagedResult<Tramite>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== null) params = params.set(k, String(v)); });
    return this.http.get<ApiList<Tramite>>(`${this.BASE}/tramites`, { params }).pipe(map((r) => r.data));
  }

  getTramite(id: string): Observable<Tramite> {
    return this.http.get<ApiOne<Tramite>>(`${this.BASE}/tramites/${id}`).pipe(map((r) => r.data));
  }

  getTramiteHistory(id: string): Observable<TramiteHistory[]> {
    return this.http.get<ApiOne<TramiteHistory[]>>(`${this.BASE}/tramites/${id}/history`).pipe(map((r) => r.data));
  }

  getPdfUrl(tramiteId: string): string {
    return `${this.BASE}/tramites/${tramiteId}/pdf`;
  }

  transition(tramiteId: string, newState: string, observation?: string): Observable<Tramite> {
    return this.http
      .patch<ApiOne<Tramite>>(`${this.BASE}/tramites/${tramiteId}/transition`, { newState, observation })
      .pipe(map((r) => r.data));
  }

  getOperatives(): Observable<unknown[]> {
    return this.http.get<ApiOne<unknown[]>>(`${this.BASE}/tramites/operatives`).pipe(map((r) => r.data));
  }

  // ─── REPORTS ────────────────────────────────────────────────────────────────

  getStats(filters: Record<string, string> = {}): Observable<TramiteStats> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<ApiOne<TramiteStats>>(`${this.BASE}/tramites/reports/stats`, { params }).pipe(map((r) => r.data));
  }

  getExportList(filters: Record<string, string> = {}): Observable<unknown[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<ApiOne<unknown[]>>(`${this.BASE}/tramites/reports/export`, { params }).pipe(map((r) => r.data));
  }
}
