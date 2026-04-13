import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';
import { RegistroDetailDialogComponent } from './registro-detail-dialog/registro-detail-dialog.component';

interface RegistroRow {
  tipo: string;
  fecha: string;
  descripcion: string;
  creadoPor: string;
  evidencias: number;
  evidenciasUrls: string[];
}

@Component({
  selector: 'app-mi-expediente',
  templateUrl: './mi-expediente.component.html',
  styleUrls: ['./mi-expediente.component.scss'],
  imports: [
    CommonModule, BreadcrumbComponent, MatDialogModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class MiExpedienteComponent implements OnInit {
  breadscrums = [{ title: 'Mi Expediente', items: ['Estudiante'], active: 'Mi Expediente Disciplinario' }];

  loading = true;
  tieneExpediente = false;

  displayedColumns = ['tipo', 'fecha', 'descripcion', 'creadoPor', 'evidencias'];
  dataSource = new MatTableDataSource<RegistroRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)      { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/expedientes/me`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        this.tieneExpediente = !!data.expediente;
        this.dataSource.data = (data.registros ?? []).map((r: any) => ({
          tipo:          r.tipo         ?? '—',
          fecha:         r.fecha        ?? '',
          descripcion:   r.descripcion  ?? '—',
          creadoPor:     r.creadoPor    ?? '—',
          evidencias:    (r.evidencias  ?? []).length,
          evidenciasUrls: r.evidencias  ?? [],
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openDetail(row: RegistroRow) {
    this.dialog.open(RegistroDetailDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {
        tipo:          row.tipo,
        fecha:         row.fecha,
        descripcion:   row.descripcion,
        creadoPor:     row.creadoPor,
        evidenciasUrls: row.evidenciasUrls,
      },
    });
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  exportPdf() { window.print(); }
}
