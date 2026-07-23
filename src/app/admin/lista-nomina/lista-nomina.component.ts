import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { environment } from '@environments/environment';

interface CursoLectivoItem {
  id: string;
  academicYear: string;
  status: string;
  nivel: string;
  subnivel: string;
  especialidad: string;
  paralelo: string;
  jornada: string;
  tutorName: string;
  total: number;
  male: number;
  female: number;
}

interface EnrollmentStat {
  cursoLectivoId: string;
  total: number;
  male: number;
  female: number;
}

interface StudentRow {
  dni: string;
  name: string;
  gender: string;
  birthdate: string;
  status: string;
  mobile: string;
  studentStatus: string;
  nee: boolean;
  aulaEspecial: boolean;
}

@Component({
  selector: 'app-lista-nomina',
  templateUrl: './lista-nomina.component.html',
  styleUrls: ['./lista-nomina.component.scss'],
  imports: [
    CommonModule, FormsModule, DatePipe, BreadcrumbComponent, TableShowHideColumnComponent,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule, MatCheckboxModule,
  ],
})
export class ListaNominaComponent implements OnInit {
  breadscrums = [{ title: 'Nómina de Estudiantes', items: ['Cursos'], active: 'Nómina' }];

  // Filtros de búsqueda de curso
  filterNivel        = '';
  filterSubnivel     = '';
  filterEspecialidad = '';
  filterJornada      = '';
  filterParalelo     = '';
  readonly nivelOptions    = ['8VO', '9NO', '10MO', '1RO BACH', '2DO BACH', '3RO BACH'];
  readonly subnivelOptions = ['EGB Superior', 'Bachillerato General', 'Bachillerato Tecnico'];
  readonly jornadaOptions  = ['Matutina', 'Vespertina', 'Nocturna'];

  // Lista de cursos lectivos
  private allCursosLectivos: CursoLectivoItem[] = [];
  filteredCursos: CursoLectivoItem[] = [];
  selectedCurso: CursoLectivoItem | null = null;
  loadingCursos   = true;
  loadingStudents = false;
  loadingExportAll = false;
  hasSearched     = false;

  // Tabla de estudiantes
  columnDefinitions = [
    { def: 'dni',       label: 'Cédula',              type: 'text', visible: true  },
    { def: 'name',      label: 'Apellidos y nombres', type: 'text', visible: true  },
    { def: 'gender',    label: 'Género',              type: 'text', visible: true  },
    { def: 'birthdate', label: 'Fecha de Nac.',       type: 'date', visible: true  },
    { def: 'status',    label: 'Estado',              type: 'text', visible: false },
    { def: 'mobile',    label: 'Contacto',            type: 'text', visible: true  },
    { def: 'studentStatus', label: 'Estado Estudiante', type: 'text', visible: false },
  ];

  dataSource = new MatTableDataSource<StudentRow>([]);

  @ViewChild(MatSort)     set matSort(sort: MatSort)         { this.dataSource.sort = sort; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    forkJoin({
      cursos: this.http.get<any>(`${environment.apiUrl}/curso-lectivo?limit=500`),
      stats:  this.http.get<any>(`${environment.apiUrl}/enrollments/stats`),
    }).subscribe({
      next: ({ cursos, stats }) => {
        const statsArr: EnrollmentStat[] = stats.data ?? [];
        const statsMap = new Map(statsArr.map(s => [s.cursoLectivoId, s]));

        this.allCursosLectivos = cursos.data.data.map((cl: any) => {
          const c  = cl.cursoId ?? {};
          const id = cl._id ?? cl.id;
          const st = statsMap.get(id) ?? { total: 0, male: 0, female: 0 };
          return {
            id,
            academicYear: cl.academicYear ?? '',
            status:       cl.status ?? '',
            nivel:        c.nivel     ?? '',
            subnivel:     c.subnivel  ?? '',
            especialidad: c.especialidad ?? '',
            paralelo:     (c.paralelo ?? '').toUpperCase(),
            jornada:      c.jornada   ?? '',
            tutorName:    cl.tutorId?.name ?? '—',
            total:        st.total,
            male:         st.male,
            female:       st.female,
          };
        });
        this.allCursosLectivos.sort((a, b) => this.cursoSortKey(a).localeCompare(this.cursoSortKey(b)));
        this.filteredCursos = this.allCursosLectivos;
        this.hasSearched = true;
        this.loadingCursos  = false;
      },
      error: () => { this.loadingCursos = false; },
    });
  }

  buscar() {
    const especialidad = this.filterEspecialidad.trim().toLowerCase();
    const paralelo     = this.filterParalelo.trim().toUpperCase();

    this.filteredCursos = this.allCursosLectivos.filter(cl =>
      (!this.filterNivel     || cl.nivel     === this.filterNivel)                         &&
      (!this.filterSubnivel  || cl.subnivel  === this.filterSubnivel)                      &&
      (!especialidad         || cl.especialidad.toLowerCase().includes(especialidad))       &&
      (!paralelo             || cl.paralelo.includes(paralelo))                             &&
      (!this.filterJornada   || cl.jornada   === this.filterJornada)
    );
    this.filteredCursos.sort((a, b) => this.cursoSortKey(a).localeCompare(this.cursoSortKey(b)));
    this.hasSearched     = true;
    this.selectedCurso   = null;
    this.dataSource.data = [];
  }

  private cursoSortKey(cl: CursoLectivoItem): string {
    return `${cl.nivel} ${cl.especialidad} ${cl.paralelo} ${cl.jornada}`;
  }

  selectCurso(cl: CursoLectivoItem) {
    this.selectedCurso  = cl;
    this.loadingStudents = true;
    this.dataSource.data = [];

    this.http.get<any>(`${environment.apiUrl}/enrollments?cursoLectivoId=${cl.id}&status=enrolled&limit=500`).subscribe({
      next: r => {
        const rows: StudentRow[] = r.data.data
          .map((e: any): StudentRow => {
            const s = e.studentId ?? {};
            return {
              dni:           s.dni       ?? '—',
              name:          s.name      ?? '—',
              gender:        s.gender    ?? '—',
              birthdate:     s.birthdate ?? '',
              status:        e.status    ?? '',
              mobile:        s.mobile    ?? '—',
              studentStatus: s.status    ?? 'active',
              nee:           s.nee          ?? false,
              aulaEspecial:  s.aulaEspecial ?? false,
            };
          })
          // Solo se listan estudiantes activos; los suspendidos se mantienen visibles (resaltados)
          .filter((row: StudentRow) => row.studentStatus === 'active' || row.studentStatus === 'suspended');

        // Ordenar alfabéticamente por nombre
        rows.sort((a, b) => a.name.localeCompare(b.name));
        this.dataSource.data = rows;

        // Filtro de búsqueda sobre la tabla
        this.dataSource.filterPredicate = (row: StudentRow, filter: string) =>
          Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));

        this.loadingStudents = false;
      },
      error: () => { this.loadingStudents = false; },
    });
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
  }

  exportXls() {
    if (!this.selectedCurso || !this.dataSource.filteredData.length) return;

    const visibleCols = this.columnDefinitions.filter(c => c.visible);
    const curso = this.cursoLabelFor(this.selectedCurso);
    const data = this.dataSource.filteredData.map(s => {
      const row: Record<string, string> = { Curso: curso };
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

    const fileName = `nomina_${this.selectedCurso.nivel}_${this.selectedCurso.especialidad}_${this.selectedCurso.paralelo}_${this.selectedCurso.academicYear}`
      .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    TableExportUtil.exportToExcel(data, fileName);
  }

  exportPdf() { window.print(); }

  exportAllXls() {
    if (!this.filteredCursos.length || this.loadingExportAll) return;
    this.loadingExportAll = true;

    const cursosMap = new Map(this.filteredCursos.map(cl => [cl.id, cl]));
    const visibleCols = this.columnDefinitions.filter(c => c.visible);

    this.http.get<any>(`${environment.apiUrl}/enrollments?status=enrolled&limit=5000`).subscribe({
      next: r => {
        const entries: { curso: string; name: string; row: Record<string, string> }[] = [];

        (r.data.data as any[]).forEach(e => {
          const clId = e.cursoLectivoId?._id ?? e.cursoLectivoId?.id;
          const cl = cursosMap.get(clId);
          if (!cl) return;

          const s = e.studentId ?? {};
          const studentStatus = s.status ?? 'active';
          // Solo se exportan estudiantes activos; los suspendidos se mantienen (marcados)
          if (studentStatus !== 'active' && studentStatus !== 'suspended') return;

          const studentRow: StudentRow = {
            dni:           s.dni       ?? '—',
            name:          s.name      ?? '—',
            gender:        s.gender    ?? '—',
            birthdate:     s.birthdate ?? '',
            status:        e.status    ?? '',
            mobile:        s.mobile    ?? '—',
            studentStatus,
            nee:           s.nee          ?? false,
            aulaEspecial:  s.aulaEspecial ?? false,
          };

          const curso = this.cursoLabelFor(cl);
          const row: Record<string, string> = { Curso: curso };
          visibleCols.forEach(col => {
            const val = (studentRow as any)[col.def];
            row[col.label] = col.type === 'date' && val
              ? new Date(val).toLocaleDateString('es-EC')
              : (val ?? '');
          });
          row['NEE'] = studentRow.nee ? 'Sí' : 'No';
          row['Aula Especial'] = studentRow.aulaEspecial ? 'Sí' : 'No';
          entries.push({ curso, name: studentRow.name, row });
        });

        entries.sort((a, b) => a.curso.localeCompare(b.curso) || a.name.localeCompare(b.name));

        const date = new Date().toISOString().slice(0, 10);
        TableExportUtil.exportToExcel(entries.map(en => en.row), `nomina_cursos_${date}`);
        this.loadingExportAll = false;
      },
      error: () => { this.loadingExportAll = false; },
    });
  }

  private cursoLabelFor(c: CursoLectivoItem): string {
    return `${c.nivel} — ${c.especialidad} — Paralelo ${c.paralelo} — ${c.jornada} | Año ${c.academicYear}`;
  }

  get cursoLabel(): string {
    if (!this.selectedCurso) return '';
    return this.cursoLabelFor(this.selectedCurso);
  }

  // Prioridad de resaltado de fila: Suspendido > NEE > Aula Especial
  getRowClass(row: StudentRow): string {
    if (row.studentStatus === 'suspended') return 'row-suspended';
    if (row.nee) return 'row-nee';
    if (row.aulaEspecial) return 'row-aula-especial';
    return '';
  }

  getRowTooltip(row: StudentRow): string {
    if (row.studentStatus === 'suspended') return 'Estudiante suspendido';
    if (row.nee) return 'NEE (Necesidades Educativas <Específicas>)';
    if (row.aulaEspecial) return 'Aula Especial';
    return '';
  }
}
