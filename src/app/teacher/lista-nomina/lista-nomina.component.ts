import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { environment } from '@environments/environment';
import { StudentAttendanceDialogComponent } from './dialogs/student-attendance-dialog.component';

interface StudentRow {
  _id: string;
  dni: string;
  name: string;
  birthdate: string | null;
  edad: number | null;
  mobile: string;
  address: string;
  parentGuardianName: string;
  parentGuardianMobile: string;
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  motherMobile: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  status: string;
  nee: boolean;
  aulaEspecial: boolean;
}

function calcularEdad(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const nacimiento = new Date(birthdate);
  if (isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad--;
  return edad;
}

@Component({
  selector: 'app-lista-nomina-teacher',
  templateUrl: './lista-nomina.component.html',
  styleUrls: ['./lista-nomina.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent, TableShowHideColumnComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule, MatInputModule, MatFormFieldModule,
  ],
})
export class ListaNominaTeacherComponent implements OnInit {
  breadscrums = [{ title: 'Nómina de mi Curso', items: ['Docente'], active: 'Nómina de mi Curso' }];

  loading = true;
  esTutor = false;
  cursoLabel = '';

  columnDefinitions = [
    { def: 'dni',                   label: 'Cédula',                       type: 'text',   visible: true  },
    { def: 'name',                  label: 'Apellidos y Nombres',          type: 'text',   visible: true  },
    { def: 'present',               label: 'Días Asistidos',               type: 'number', visible: true  },
    { def: 'edad',                  label: 'Edad',                         type: 'number', visible: true  },
    { def: 'parentGuardianName',    label: 'Representante Legal',          type: 'text',   visible: true  },
    { def: 'parentGuardianMobile',  label: 'Contacto Representante Legal', type: 'text',   visible: true  },
    { def: 'mobile',                label: 'Contacto del Estudiante',      type: 'text',   visible: false },
    { def: 'address',               label: 'Dirección',                   type: 'text',   visible: false },
    { def: 'fatherName',            label: 'Nombre del Padre',             type: 'text',   visible: false },
    { def: 'fatherMobile',          label: 'Contacto del Padre',           type: 'text',   visible: false },
    { def: 'motherName',            label: 'Nombre de la Madre',           type: 'text',   visible: false },
    { def: 'motherMobile',          label: 'Contacto de la Madre',         type: 'text',   visible: false },
  ];

  dataSource = new MatTableDataSource<StudentRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)      { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/curso-lectivo/mi-tutor-alumnos`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        const cl   = data.cursoLectivo;

        if (!cl) {
          this.esTutor = false;
          this.loading = false;
          return;
        }

        this.esTutor = true;
        const c = cl.cursoId ?? {};
        const nivel        = c.nivel        ?? '';
        const especialidad = c.especialidad ? ` — ${c.especialidad}` : '';
        const paralelo     = c.paralelo     ? ` — Paralelo ${c.paralelo}` : '';
        const jornada      = c.jornada      ? ` | ${c.jornada}` : '';
        const year         = cl.academicYear ? ` · ${cl.academicYear}` : '';
        this.cursoLabel = `${nivel}${especialidad}${paralelo}${jornada}${year}`;

        this.dataSource.data = (data.estudiantes ?? [])
          // Solo se listan estudiantes activos; los suspendidos se mantienen visibles (resaltados)
          .filter((s: any) => (s.status ?? 'active') === 'active' || s.status === 'suspended')
          .map((s: any) => ({
            ...s,
            edad: calcularEdad(s.birthdate),
          }));
        this.dataSource.filterPredicate = (row: StudentRow, filter: string) =>
          Object.values(row).some(v =>
            v != null && typeof v !== 'object' && v.toString().toLowerCase().includes(filter));

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  getDisplayedColumns(): string[] {
    return [...this.columnDefinitions.filter(c => c.visible).map(c => c.def), 'detalle'];
  }

  verDetalleAsistencia(row: StudentRow) {
    this.dialog.open(StudentAttendanceDialogComponent, {
      width: '420px',
      data: {
        studentName: row.name,
        present: row.present,
        absent: row.absent,
        late: row.late,
        excused: row.excused,
      },
    });
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  exportXls() {
    if (!this.dataSource.filteredData.length) return;
    const visibleCols = this.columnDefinitions.filter(c => c.visible);
    const data = this.dataSource.filteredData.map(s => {
      const row: Record<string, string> = {};
      visibleCols.forEach(col => {
        const val = (s as any)[col.def];
        row[col.label] = col.type === 'date' && val
          ? new Date(val).toLocaleDateString('es-EC')
          : (val ?? '');
      });
      row['NEE'] = s.nee ? 'Sí' : 'No';
      row['Aula Especial'] = s.aulaEspecial ? 'Sí' : 'No';
      return row;
    });
    const fileName = `nomina_${this.cursoLabel}`.replace(/[\s|·—]+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    TableExportUtil.exportToExcel(data, fileName);
  }

  exportPdf() { window.print(); }

  // Prioridad de resaltado de fila: Suspendido > NEE > Aula Especial
  getRowClass(row: StudentRow): string {
    if (row.status === 'suspended') return 'row-suspended';
    if (row.nee) return 'row-nee';
    if (row.aulaEspecial) return 'row-aula-especial';
    return '';
  }

  getRowTooltip(row: StudentRow): string {
    if (row.status === 'suspended') return 'Estudiante suspendido';
    if (row.nee) return 'NEE (Necesidades Educativas Específicas)';
    if (row.aulaEspecial) return 'Aula Especial';
    return '';
  }
}
