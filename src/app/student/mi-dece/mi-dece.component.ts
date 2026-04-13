import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

interface RegistroRow {
  tipo: string;
  fecha: string;
  descripcion: string;
  creadoPor: string;
  evidencias: number;
}

@Component({
  selector: 'app-mi-dece',
  templateUrl: './mi-dece.component.html',
  styleUrls: ['./mi-dece.component.scss'],
  imports: [
    CommonModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class MiDeceComponent implements OnInit {
  breadscrums = [{ title: 'Mi Atención DECE', items: ['Estudiante'], active: 'Mi Atención DECE' }];

  loading = true;
  tieneExpediente = false;

  displayedColumns = ['tipo', 'fecha', 'descripcion', 'creadoPor', 'evidencias'];
  dataSource = new MatTableDataSource<RegistroRow>([]);

  @ViewChild(MatSort)     set matSort(s: MatSort)     { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/dece/me`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        this.tieneExpediente = !!data.expediente;
        this.dataSource.data = (data.registros ?? []).map((r: any) => ({
          tipo:        r.tipo        ?? '—',
          fecha:       r.fecha       ?? '',
          descripcion: r.descripcion ?? '—',
          creadoPor:   r.creadoPor   ?? '—',
          evidencias:  (r.evidencias ?? []).length,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  exportPdf() { window.print(); }
}
