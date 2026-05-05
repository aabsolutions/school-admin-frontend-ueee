import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TramiteStatusBadgeComponent } from '@shared/components/tramitologia/status-badge/status-badge.component';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tramite-reportes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    BreadcrumbComponent, TramiteStatusBadgeComponent,
  ],
  templateUrl: './tramite-reportes.component.html',
})
export class TramiteReportesComponent implements OnInit {
  breadscrums = [{ title: 'Reportes', items: ['Tramitología'], active: 'Reportes' }];
  cols = ['codigo', 'plantilla', 'state', 'solicitante', 'fechaCreacion', 'fechaCierre'];
  data: any[] = [];
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  loading = false;

  constructor(private tramitologiaService: TramitologiaService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const filters: Record<string, string> = {};
    if (this.dateFrom) filters['dateFrom'] = this.dateFrom.toISOString();
    if (this.dateTo) filters['dateTo'] = this.dateTo.toISOString();
    this.tramitologiaService.getExportList(filters).subscribe({
      next: (d) => { this.data = d as any[]; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  exportExcel() {
    const rows = this.data.map((t: any) => ({
      Código: t.codigo,
      Plantilla: t.plantilla?.nombre,
      Estado: t.state,
      Rol: t.solicitanteRole,
      Creado: t.createdAt,
      Cerrado: t.closedAt ?? '',
      Observación: t.lastObservation ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trámites');
    XLSX.writeFile(wb, `tramites_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
