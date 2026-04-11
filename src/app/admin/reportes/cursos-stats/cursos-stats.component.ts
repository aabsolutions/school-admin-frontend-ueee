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
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableExportUtil } from '@shared';
import { environment } from '@environments/environment';

interface StatRow {
  nivel: string;
  subnivel: string;
  especialidad: string;
  paralelo: string;
  jornada: string;
  academicYear: string;
  tutorName: string;
  total: number;
  male: number;
  female: number;
  avgAge: number | null;
}

interface EnrollmentStat {
  cursoLectivoId: string;
  total: number;
  male: number;
  female: number;
}

@Component({
  selector: 'app-cursos-stats',
  templateUrl: './cursos-stats.component.html',
  styleUrls: ['./cursos-stats.component.scss'],
  imports: [
    CommonModule, FormsModule, DatePipe, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class CursosStatsComponent implements OnInit {
  breadscrums = [{ title: 'Estadísticas de Cursos', items: ['Reportes'], active: 'Estadísticas de Cursos' }];

  // Filtros
  filterYear        = '';
  filterNivel       = '';
  filterSubnivel    = '';
  filterEspecialidad = '';
  filterJornada     = '';

  readonly nivelOptions    = ['8VO', '9NO', '10MO', '1RO BACH', '2DO BACH', '3RO BACH'];
  readonly subnivelOptions = ['EGB Superior', 'Bachillerato General', 'Bachillerato Tecnico'];
  readonly jornadaOptions  = ['Matutina', 'Vespertina', 'Nocturna'];

  academicYears: string[] = [];

  // Datos cargados al inicio
  private allCursos: any[]          = [];
  private statsMap  = new Map<string, EnrollmentStat>();

  // Para calcular promedios de edad por curso
  // Map: cursoLectivoId → array de edades
  private agesByCurso = new Map<string, number[]>();

  loading          = true;
  loadingReport    = false;
  hasGenerated     = false;
  today            = new Date();

  displayedColumns = [
    'nivel', 'subnivel', 'especialidad', 'paralelo', 'jornada', 'academicYear',
    'tutorName', 'total', 'male', 'female', 'avgAge',
  ];

  dataSource = new MatTableDataSource<StatRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)          { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator){ this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    forkJoin({
      cursos: this.http.get<any>(`${environment.apiUrl}/curso-lectivo?limit=500`),
      stats:  this.http.get<any>(`${environment.apiUrl}/enrollments/stats`),
    }).subscribe({
      next: ({ cursos, stats }) => {
        const statsArr: EnrollmentStat[] = stats.data ?? [];
        this.statsMap = new Map(statsArr.map(s => [s.cursoLectivoId, s]));

        this.allCursos = cursos.data?.data ?? [];

        // Extraer años lectivos únicos para el filtro
        const years = new Set<string>(this.allCursos.map((cl: any) => cl.academicYear ?? ''));
        this.academicYears = [...years].filter(Boolean).sort().reverse();

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  generar() {
    this.loadingReport = true;

    // Filtrar los cursos según los criterios
    const especialidad = this.filterEspecialidad.trim().toLowerCase();

    const cursosFiltrados = this.allCursos.filter((cl: any) => {
      const c = cl.cursoId ?? {};
      if (this.filterYear     && cl.academicYear !== this.filterYear)     return false;
      if (this.filterNivel    && c.nivel          !== this.filterNivel)    return false;
      if (this.filterSubnivel && c.subnivel        !== this.filterSubnivel) return false;
      if (especialidad && !(c.especialidad ?? '').toLowerCase().includes(especialidad)) return false;
      if (this.filterJornada  && c.jornada         !== this.filterJornada)  return false;
      return true;
    });

    const ids = cursosFiltrados.map((cl: any) => (cl._id ?? cl.id).toString());

    if (ids.length === 0) {
      this.dataSource.data = [];
      this.loadingReport   = false;
      this.hasGenerated    = true;
      return;
    }

    // Cargar todas las matrículas para calcular promedios de edad
    this.http.get<any>(`${environment.apiUrl}/enrollments?limit=2000`).subscribe({
      next: (res) => {
        const enrollments: any[] = res.data?.data ?? [];

        // Agrupar edades por cursoLectivoId
        this.agesByCurso.clear();
        for (const e of enrollments) {
          const clId = (e.cursoLectivoId?._id ?? e.cursoLectivoId?.id ?? e.cursoLectivoId ?? '').toString();
          const birthdate = e.studentId?.birthdate;
          if (birthdate) {
            if (!this.agesByCurso.has(clId)) this.agesByCurso.set(clId, []);
            this.agesByCurso.get(clId)!.push(this.calcAge(birthdate));
          }
        }

        // Construir filas
        this.dataSource.data = cursosFiltrados.map((cl: any): StatRow => {
          const c    = cl.cursoId ?? {};
          const id   = (cl._id ?? cl.id).toString();
          const stat = this.statsMap.get(id) ?? { total: 0, male: 0, female: 0, cursoLectivoId: id };
          const ages = this.agesByCurso.get(id) ?? [];
          const avgAge = ages.length
            ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length * 10) / 10
            : null;

          return {
            nivel:        c.nivel        ?? '—',
            subnivel:     c.subnivel     ?? '—',
            especialidad: c.especialidad ?? '—',
            paralelo:     (c.paralelo    ?? '').toUpperCase(),
            jornada:      c.jornada      ?? '—',
            academicYear: cl.academicYear ?? '—',
            tutorName:    cl.tutorId?.name ?? '—',
            total:        stat.total,
            male:         stat.male,
            female:       stat.female,
            avgAge,
          };
        });

        this.dataSource.data.sort((a, b) => {
          const yearCmp = b.academicYear.localeCompare(a.academicYear);
          if (yearCmp !== 0) return yearCmp;
          return a.nivel.localeCompare(b.nivel);
        });

        this.loadingReport = false;
        this.hasGenerated  = true;
      },
      error: () => {
        // Si falla la carga de matrículas, generar sin promedios de edad
        this.dataSource.data = cursosFiltrados.map((cl: any): StatRow => {
          const c    = cl.cursoId ?? {};
          const id   = (cl._id ?? cl.id).toString();
          const stat = this.statsMap.get(id) ?? { total: 0, male: 0, female: 0, cursoLectivoId: id };
          return {
            nivel:        c.nivel        ?? '—',
            subnivel:     c.subnivel     ?? '—',
            especialidad: c.especialidad ?? '—',
            paralelo:     (c.paralelo    ?? '').toUpperCase(),
            jornada:      c.jornada      ?? '—',
            academicYear: cl.academicYear ?? '—',
            tutorName:    cl.tutorId?.name ?? '—',
            total:        stat.total,
            male:         stat.male,
            female:       stat.female,
            avgAge:       null,
          };
        });
        this.loadingReport = false;
        this.hasGenerated  = true;
      },
    });
  }

  limpiar() {
    this.filterYear        = '';
    this.filterNivel       = '';
    this.filterSubnivel    = '';
    this.filterEspecialidad = '';
    this.filterJornada     = '';
    this.dataSource.data   = [];
    this.hasGenerated      = false;
  }

  applyFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = val;
    this.dataSource.filterPredicate = (row: StatRow, filter: string) =>
      Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));
  }

  exportXls() {
    if (!this.dataSource.filteredData.length) return;
    const data = this.dataSource.filteredData.map(r => ({
      'Nivel':             r.nivel,
      'Subnivel':          r.subnivel,
      'Especialidad':      r.especialidad,
      'Paralelo':          r.paralelo,
      'Jornada':           r.jornada,
      'Año Lectivo':       r.academicYear,
      'Tutor':             r.tutorName,
      'Total':             r.total,
      'Hombres':           r.male,
      'Mujeres':           r.female,
      'Prom. Edad (años)': r.avgAge ?? 'N/D',
    }));
    TableExportUtil.exportToExcel(data, `estadisticas_cursos_${new Date().toISOString().slice(0, 10)}`);
  }

  exportPdf() { window.print(); }

  get totales() {
    const rows = this.dataSource.filteredData;
    return {
      total:  rows.reduce((s, r) => s + r.total,  0),
      male:   rows.reduce((s, r) => s + r.male,   0),
      female: rows.reduce((s, r) => s + r.female, 0),
    };
  }

  private calcAge(birthdate: string | Date): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
}
