import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { AttendanceConsolidated, StudentAttendanceSummary } from '@shared/services/asistencias.model';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    TableShowHideColumnComponent,
  ],
  templateUrl: './attendance-report.component.html',
})
export class AttendanceReportComponent implements OnInit {
  breadscrums = [{ title: 'Asistencias', items: ['Admin'], active: 'Reporte' }];

  cursoLectivos: any[] = [];
  selectedCursoLectivoId = '';
  dateFrom = '';
  dateTo = '';

  consolidated: AttendanceConsolidated | null = null;
  dataSource = new MatTableDataSource<StudentAttendanceSummary>();
  isLoading = false;

  columnDefinitions = [
    { def: 'name',    label: 'Estudiante',   visible: true },
    { def: 'present', label: 'Presente',     visible: true },
    { def: 'absent',  label: 'Ausente',      visible: true },
    { def: 'late',    label: 'Tardanza',     visible: true },
    { def: 'excused', label: 'Justificado',  visible: true },
    { def: 'rate',    label: '% Asistencia', visible: true },
  ];

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
  }

  constructor(private svc: AsistenciasService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.svc.getCursoLectivos().subscribe((cl) => (this.cursoLectivos = cl));
  }

  cursoLabel(cl: any): string {
    const c = cl.cursoId;
    if (!c) return cl.academicYear;
    return `${c.nivel} ${c.paralelo} — ${cl.academicYear}`;
  }

  search() {
    if (!this.selectedCursoLectivoId) {
      this.snack.open('Seleccione un curso lectivo', 'OK', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    this.svc
      .getConsolidated(
        this.selectedCursoLectivoId,
        this.dateFrom || undefined,
        this.dateTo || undefined,
      )
      .subscribe({
        next: (data) => {
          this.consolidated = data;
          this.dataSource.data = data.students;
          this.isLoading = false;
        },
        error: (e) => {
          this.snack.open(e.message, 'Cerrar', { duration: 4000 });
          this.isLoading = false;
        },
      });
  }

  attendanceRate(row: StudentAttendanceSummary): number {
    const total = row.present + row.absent + row.late + row.excused;
    return total > 0 ? Math.round((row.present / total) * 100) : 100;
  }

  exportXls() {
    if (!this.dataSource.data.length) return;
    const visibleCols = this.columnDefinitions.filter(c => c.visible);
    const data = this.dataSource.data.map(s => {
      const row: Record<string, string | number> = {};
      visibleCols.forEach(col => {
        row[col.label] = col.def === 'rate' ? this.attendanceRate(s) : (s as any)[col.def] ?? '';
      });
      return row;
    });
    TableExportUtil.exportToExcel(data, 'reporte-asistencias');
  }
}
