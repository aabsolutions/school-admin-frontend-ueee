import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { environment } from '@environments/environment';
import { StudentProfileComponent } from '../../students/student-profile/student-profile.component';
import { CursoDetalleDialogComponent } from './curso-detalle-dialog/curso-detalle-dialog.component';

interface StudentRow {
  id: string;
  dni: string;
  name: string;
  email: string;
  gender: string;
  birthdate: string;
  age: number;
  mobile: string;
  residenceZone: string;
  address: string;
  parentGuardianName: string;
  parentGuardianMobile: string;
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  motherMobile: string;
  status: string;
  cursoLectivoId: string;
  curso: string;
}

@Component({
  selector: 'app-directorio-estudiantes',
  templateUrl: './directorio-estudiantes.component.html',
  styleUrls: ['./directorio-estudiantes.component.scss'],
  imports: [
    CommonModule, FormsModule, DatePipe, BreadcrumbComponent, TableShowHideColumnComponent,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDialogModule,
  ],
})
export class DirectorioEstudiantesComponent implements OnInit {
  breadscrums = [{ title: 'Directorio de Estudiantes', items: ['Reportes'], active: 'Directorio de Estudiantes' }];

  // Filtros
  filterName          = '';
  filterGender        = '';
  filterStatus        = 'active';
  filterResidenceZone = '';
  filterAgeMin: number | null = null;
  filterAgeMax: number | null = null;

  readonly genderOptions        = ['Male', 'Female', 'Other'];
  readonly statusOptions        = ['active', 'inactive', 'graduated', 'suspended'];
  readonly residenceZoneOptions = ['URBANA', 'RURAL', 'FUERA DEL CANTÓN'];

  private allStudents: StudentRow[] = [];
  cursoStudentCount: Record<string, number> = {};
  loading     = true;
  hasSearched = false;
  today       = new Date();

  columnDefinitions = [
    { def: 'dni',                 label: 'Cédula',           type: 'text',   visible: true  },
    { def: 'name',                label: 'Nombre',           type: 'text',   visible: true  },
    { def: 'email',               label: 'Email',            type: 'text',   visible: false },
    { def: 'gender',              label: 'Género',           type: 'gender', visible: false },
    { def: 'age',                 label: 'Edad',             type: 'number', visible: true  },
    { def: 'birthdate',           label: 'Fecha de Nac.',    type: 'date',   visible: false },
    { def: 'mobile',              label: 'Teléfono',         type: 'text',   visible: true  },
    { def: 'residenceZone',       label: 'Zona',             type: 'text',   visible: false },
    { def: 'curso',               label: 'Curso',            type: 'curso',  visible: true  },
    { def: 'address',             label: 'Dirección',        type: 'text',   visible: false },
    { def: 'parentGuardianName',  label: 'Rep. Legal',       type: 'text',   visible: false },
    { def: 'parentGuardianMobile',label: 'Tel. Rep. Legal',  type: 'text',   visible: false },
    { def: 'fatherName',          label: 'Padre',            type: 'text',   visible: false },
    { def: 'fatherMobile',        label: 'Tel. Padre',       type: 'text',   visible: false },
    { def: 'motherName',          label: 'Madre',            type: 'text',   visible: false },
    { def: 'motherMobile',        label: 'Tel. Madre',       type: 'text',   visible: false },
    { def: 'status',              label: 'Estado',           type: 'status', visible: false },
    { def: 'actions',             label: 'Acciones',         type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<StudentRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)          { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator){ this.dataSource.paginator = p; }

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    // Directorio = estudiantes matriculados (enrollment 'enrolled') en el
    // período lectivo actual (cursoLectivo.status === 'active'), no el total
    // histórico de la colección students.
    this.http.get<any>(`${environment.apiUrl}/enrollments?status=enrolled&limit=5000`).subscribe({
      next: (res) => {
        const enrollments = (res.data?.data ?? []).filter(
          (e: any) => e.cursoLectivoId?.status === 'active'
        );
        const cursoStudentCount: Record<string, number> = {};
        for (const e of enrollments) {
          const clId = e.cursoLectivoId?._id;
          if (clId) cursoStudentCount[clId] = (cursoStudentCount[clId] ?? 0) + 1;
        }
        this.cursoStudentCount = cursoStudentCount;

        this.allStudents = enrollments.map((e: any) => {
          const s  = e.studentId ?? {};
          const cl = e.cursoLectivoId ?? {};
          const c  = cl.cursoId ?? {};
          const cursoLabel = c.nivel
            ? `${c.nivel}${c.especialidad ? ' ' + c.especialidad : ''} "${c.paralelo}" - ${c.jornada}`
            : '—';
          return {
            id:                   s._id                  ?? '',
            dni:                  s.dni                  ?? '—',
            name:                 s.name                 ?? '—',
            email:                s.email                ?? '—',
            gender:               s.gender               ?? '—',
            birthdate:            s.birthdate             ?? '',
            age:                  s.birthdate ? this.calcAge(s.birthdate) : 0,
            mobile:               s.mobile               ?? '—',
            residenceZone:        s.residenceZone         ?? '—',
            address:              s.address               ?? '—',
            parentGuardianName:   s.parentGuardianName    ?? '—',
            parentGuardianMobile: s.parentGuardianMobile  ?? '—',
            fatherName:           s.fatherName            ?? '—',
            fatherMobile:         s.fatherMobile          ?? '—',
            motherName:           s.motherName            ?? '—',
            motherMobile:         s.motherMobile          ?? '—',
            status:               s.status               ?? '—',
            cursoLectivoId:       cl._id                  ?? '',
            curso:                cursoLabel,
          };
        });
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  buscar() {
    const name = this.filterName.trim().toLowerCase();

    this.dataSource.data = this.allStudents.filter(s => {
      if (name && !s.name.toLowerCase().includes(name) && !s.email.toLowerCase().includes(name) && !s.dni.toLowerCase().includes(name)) return false;
      if (this.filterGender && s.gender !== this.filterGender) return false;
      if (this.filterStatus && s.status !== this.filterStatus) return false;
      if (this.filterResidenceZone && s.residenceZone !== this.filterResidenceZone) return false;
      if (this.filterAgeMin !== null && s.age < this.filterAgeMin) return false;
      if (this.filterAgeMax !== null && s.age > this.filterAgeMax) return false;
      return true;
    });

    this.dataSource.data.sort((a, b) => a.name.localeCompare(b.name));
    this.hasSearched = true;
  }

  limpiar() {
    this.filterName          = '';
    this.filterGender        = '';
    this.filterStatus        = '';
    this.filterResidenceZone = '';
    this.filterAgeMin        = null;
    this.filterAgeMax        = null;
    this.dataSource.data     = [];
    this.hasSearched         = false;
  }

  verDetalle(row: StudentRow) {
    if (!row.id) return;
    this.dialog.open(StudentProfileComponent, {
      width: '70vw',
      maxWidth: '100vw',
      data: { studentId: row.id },
      autoFocus: false,
    });
  }

  verCurso(row: StudentRow) {
    if (!row.cursoLectivoId) return;
    this.dialog.open(CursoDetalleDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        cursoLectivoId: row.cursoLectivoId,
        cantidadEstudiantes: this.cursoStudentCount[row.cursoLectivoId] ?? 0,
      },
      autoFocus: false,
    });
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (row: StudentRow, filter: string) =>
      Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
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
      return row;
    });
    TableExportUtil.exportToExcel(data, `directorio_estudiantes_${new Date().toISOString().slice(0, 10)}`);
  }

  exportPdf() { window.print(); }

  private calcAge(birthdate: string | Date): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
}
