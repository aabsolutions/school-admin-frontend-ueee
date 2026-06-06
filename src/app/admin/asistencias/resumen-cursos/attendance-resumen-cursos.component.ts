import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableExportUtil } from '@shared';
import { AsistenciasService } from '@shared/services/asistencias.service';

interface CursoResumen {
  cursoLectivoId: string;
  label: string;
  totalStudents: number;
  totalDays: number;
  attendanceRate: number;
  totalPresences: number;
  totalAbsences: number;
}

@Component({
  selector: 'app-attendance-resumen-cursos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BreadcrumbComponent,
  ],
  templateUrl: './attendance-resumen-cursos.component.html',
})
export class AttendanceResumenCursosComponent implements OnInit {
  breadscrums = [{ title: 'Asistencias', items: ['Admin'], active: 'Resumen por Cursos' }];

  cursoLectivos: any[] = [];
  dateFrom = '';
  dateTo = '';
  isLoading = false;
  generated = false;

  dataSource = new MatTableDataSource<CursoResumen>();
  displayedColumns = ['label', 'totalStudents', 'totalDays', 'attendanceRate', 'totalPresences', 'totalAbsences'];

  avgRate = 0;
  grandTotalAbsences = 0;
  grandTotalStudents = 0;

  constructor(private svc: AsistenciasService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.svc.getCursoLectivos().subscribe((cl) => (this.cursoLectivos = cl));
  }

  generate() {
    if (!this.cursoLectivos.length) {
      this.snack.open('No hay cursos lectivos disponibles', 'OK', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    this.generated = false;
    this.dataSource.data = [];

    const requests = this.cursoLectivos.map((cl) =>
      this.svc
        .getConsolidated(cl._id, this.dateFrom || undefined, this.dateTo || undefined)
        .pipe(catchError(() => of(null))),
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const rows: CursoResumen[] = results
          .map((r, i) => {
            if (!r || r.totalDays === 0) return null;
            const cl = this.cursoLectivos[i];
            return {
              cursoLectivoId: cl._id,
              label: this.cursoLabel(cl),
              totalStudents: r.totalStudents,
              totalDays: r.totalDays,
              attendanceRate: r.attendanceRate,
              totalPresences: r.totalPresences,
              totalAbsences: r.totalAbsences,
            } as CursoResumen;
          })
          .filter((r): r is CursoResumen => r !== null)
          .sort((a, b) => a.label.localeCompare(b.label, 'es'));

        this.dataSource.data = rows;
        this.avgRate = rows.length
          ? Math.round(rows.reduce((s, r) => s + r.attendanceRate, 0) / rows.length)
          : 0;
        this.grandTotalAbsences = rows.reduce((s, r) => s + r.totalAbsences, 0);
        this.grandTotalStudents = rows.reduce((s, r) => s + r.totalStudents, 0);
        this.generated = true;
        this.isLoading = false;
      },
      error: () => {
        this.snack.open('Error al generar el resumen', 'Cerrar', { duration: 4000 });
        this.isLoading = false;
      },
    });
  }

  cursoLabel(cl: any): string {
    const c = cl.cursoId;
    if (!c) return cl.academicYear;
    return `${c.nivel} ${c.paralelo} — ${cl.academicYear}`;
  }

  exportXls() {
    if (!this.dataSource.data.length) return;
    const data = this.dataSource.data.map((r) => ({
      Curso: r.label,
      Estudiantes: r.totalStudents,
      'Días Registrados': r.totalDays,
      '% Asistencia': r.attendanceRate,
      Presencias: r.totalPresences,
      Ausencias: r.totalAbsences,
    }));
    TableExportUtil.exportToExcel(data, 'resumen-cursos-asistencias');
  }
}
