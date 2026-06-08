import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableExportUtil } from '@shared';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { ReporteMasivoItem } from '@shared/services/asistencias.model';

@Component({
  selector: 'app-attendance-masivo-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BreadcrumbComponent,
  ],
  templateUrl: './attendance-masivo-report.component.html',
})
export class AttendanceMasivoReportComponent {
  breadscrums = [{ title: 'Estudiantes', items: ['Admin'], active: 'Reporte Masivo' }];

  status = 'absent';
  jornada = '';
  dateFrom = '';
  dateTo = '';
  minCount = 2;

  isLoading = false;
  searched = false;
  items: ReporteMasivoItem[] = [];

  readonly statusOptions = [
    { value: 'absent',  label: 'Inasistencias' },
    { value: 'late',    label: 'Tardanzas' },
    { value: 'excused', label: 'Justificadas' },
  ];

  readonly jornadaOptions = [
    { value: '',           label: 'Todas' },
    { value: 'Matutina',   label: 'Matutina' },
    { value: 'Vespertina', label: 'Vespertina' },
    { value: 'Nocturna',   label: 'Nocturna' },
  ];

  constructor(private svc: AsistenciasService, private snack: MatSnackBar) {}

  get groups(): { curso: string; students: ReporteMasivoItem[] }[] {
    const sorted = [...this.items].sort((a, b) => {
      const cc = a.cursoNombre.localeCompare(b.cursoNombre, 'es');
      if (cc !== 0) return cc;
      return a.name.localeCompare(b.name, 'es');
    });

    const map = new Map<string, ReporteMasivoItem[]>();
    for (const s of sorted) {
      const key = s.cursoNombre || 'Sin curso';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([curso, students]) => ({ curso, students }));
  }

  globalIndex(
    groups: { curso: string; students: ReporteMasivoItem[] }[],
    group: { curso: string; students: ReporteMasivoItem[] },
    localIdx: number,
  ): number {
    let offset = 0;
    for (const g of groups) {
      if (g.curso === group.curso) break;
      offset += g.students.length;
    }
    return offset + localIdx + 1;
  }

  search() {
    if (!this.status) {
      this.snack.open('Seleccioná un tipo de registro', 'OK', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    this.svc
      .getReporteMasivo({
        status: this.status,
        dateFrom: this.dateFrom || undefined,
        dateTo: this.dateTo || undefined,
        minCount: this.minCount,
        jornada: this.jornada || undefined,
      })
      .subscribe({
        next: (data) => {
          this.items = data;
          this.searched = true;
          this.isLoading = false;
        },
        error: (e) => {
          this.snack.open(e.message, 'Cerrar', { duration: 4000 });
          this.isLoading = false;
        },
      });
  }

  exportXls() {
    if (!this.items.length) return;
    const rows: Record<string, string | number>[] = [];
    for (const group of this.groups) {
      for (const s of group.students) {
        rows.push({ Nombre: s.name, Curso: s.cursoNombre, Cantidad: s.count });
      }
    }
    const typeLabel: Record<string, string> = {
      absent: 'inasistencias',
      late: 'tardanzas',
      excused: 'justificadas',
    };
    const date = new Date().toISOString().slice(0, 10);
    TableExportUtil.exportToExcel(rows, `reporte-${typeLabel[this.status] ?? this.status}-${date}`);
  }
}
