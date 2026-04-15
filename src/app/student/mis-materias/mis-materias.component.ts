import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';

interface MateriaConDocente {
  materia: { _id: string; nombre: string; codigo: string; horas: number };
  docente: { _id: string; name: string; email: string } | null;
}

interface CursoLectivoInfo {
  _id: string;
  academicYear: string;
  status: string;
  cursoId?: {
    nivel: string;
    especialidad?: string;
    paralelo: string;
    jornada: string;
    subnivel: string;
  };
}

@Component({
  selector: 'app-mis-materias',
  templateUrl: './mis-materias.component.html',
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
})
export class MisMateriasComponent implements OnInit {
  breadscrums = [
    { title: 'Mis Materias', items: ['Estudiante'], active: 'Mis Materias' },
  ];

  loading = false;
  errorMsg: string | null = null;
  cursoLectivo: CursoLectivoInfo | null = null;
  materias: MateriaConDocente[] = [];
  displayedColumns = ['nombre', 'codigo', 'horas', 'docente'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMsg = null;

    this.http.get<any>(`${environment.apiUrl}/students/me`).subscribe({
      next: (res) => {
        const student = res.data ?? res;
        const estudianteId = student._id ?? student.id;
        if (!estudianteId) {
          this.errorMsg = 'No se pudo obtener el perfil del estudiante.';
          this.loading = false;
          return;
        }
        this.loadMaterias(estudianteId);
      },
      error: (err) => {
        console.error('[MisMaterias] GET /students/me falló:', err);
        this.errorMsg = `Error al cargar tu perfil (${err.status ?? 'sin conexión'}). Contactá al administrador.`;
        this.loading = false;
      },
    });
  }

  private loadMaterias(estudianteId: string): void {
    this.http
      .get<any>(`${environment.apiUrl}/carga-horaria/estudiante/${estudianteId}`)
      .subscribe({
        next: (res) => {
          console.log(res);
          const data = res.data ?? res;
          this.cursoLectivo = data.cursoLectivo ?? null;
          this.materias = data.materias ?? [];
          this.loading = false;
        },
        error: (err) => {
          console.error('[MisMaterias] GET /carga-horaria/estudiante falló:', err);
          this.errorMsg = `Error al cargar las materias (${err.status ?? 'sin conexión'}). Contactá al administrador.`;
          this.loading = false;
        },
      });
  }

  getCursoLabel(): string {
    if (!this.cursoLectivo) return '—';
    const cl = this.cursoLectivo;
    if (!cl.cursoId) return cl.academicYear ?? '—';
    const c = cl.cursoId;
    const parts = [c.nivel, c.especialidad, c.paralelo, c.jornada].filter(Boolean);
    return `${parts.join(' - ')} · ${cl.academicYear}`;
  }
}
