import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentApiService, StudentSummary } from '../services/parent-api.service';
import { environment } from '@environments/environment';
import { TIPO_CONFIG } from '../../admin/expedientes/all-expedientes/expediente.model';
import { RegistroDetailDialogComponent } from '../../student/mi-expediente/registro-detail-dialog/registro-detail-dialog.component';

interface DriveFile { nombre: string; url: string; }

interface RegistroRow {
  _id: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  creadoPor: string;
  evidenciasCount: number;
  evidenciasUrls: string[];
  driveFiles: DriveFile[];
}

@Component({
  selector: 'app-parent-expedientes',
  templateUrl: './parent-expedientes.component.html',
  imports: [
    CommonModule, FormsModule,
    BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule,
    MatTableModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDialogModule, MatDividerModule,
  ],
})
export class ParentExpedientesComponent implements OnInit {
  breadscrums = [{ title: 'Expedientes', items: ['Representante'], active: 'Expedientes de mis hijos' }];

  hijos: StudentSummary[] = [];
  selectedHijoId: string | null = null;

  loadingHijos = true;
  loadingExpediente = false;
  tieneExpediente = false;

  displayedColumns = ['tipo', 'fecha', 'descripcion', 'creadoPor', 'archivos'];
  dataSource = new MatTableDataSource<RegistroRow>([]);

  readonly tipoConfig = TIPO_CONFIG;

  constructor(
    private api: ParentApiService,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.api.getHijos().subscribe({
      next: (hijos) => {
        this.hijos = hijos;
        this.loadingHijos = false;
        if (hijos.length === 1) {
          this.selectedHijoId = hijos[0]._id;
          this.loadExpediente();
        }
      },
      error: () => { this.loadingHijos = false; },
    });
  }

  onHijoChange() {
    if (this.selectedHijoId) this.loadExpediente();
  }

  loadExpediente() {
    if (!this.selectedHijoId) return;
    this.loadingExpediente = true;
    this.tieneExpediente = false;
    this.dataSource.data = [];

    this.http.get<any>(`${environment.apiUrl}/expedientes/parent/hijo/${this.selectedHijoId}`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        this.tieneExpediente = !!data.expediente;
        this.dataSource.data = (data.registros ?? []).map((r: any): RegistroRow => ({
          _id:            r._id,
          tipo:           r.tipo         ?? '—',
          fecha:          r.fecha        ?? '',
          descripcion:    r.descripcion  ?? '—',
          creadoPor:      r.creadoPor    ?? '—',
          evidenciasCount: (r.evidencias ?? []).length,
          evidenciasUrls: r.evidencias   ?? [],
          driveFiles:     r.driveFiles   ?? [],
        }));
        this.loadingExpediente = false;
      },
      error: () => { this.loadingExpediente = false; },
    });
  }

  openDetail(row: RegistroRow) {
    this.dialog.open(RegistroDetailDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {
        tipo:           row.tipo,
        fecha:          row.fecha,
        descripcion:    row.descripcion,
        creadoPor:      row.creadoPor,
        evidenciasUrls: row.evidenciasUrls,
        driveFiles:     row.driveFiles,
      },
    });
  }

  getTipoClass(tipo: string): string {
    return this.tipoConfig[tipo]?.color ?? 'badge-solid-default';
  }

  getTipoIcon(tipo: string): string {
    return this.tipoConfig[tipo]?.icon ?? 'info';
  }

  getHijoNombre(): string {
    return this.hijos.find(h => h._id === this.selectedHijoId)?.name ?? '';
  }
}
