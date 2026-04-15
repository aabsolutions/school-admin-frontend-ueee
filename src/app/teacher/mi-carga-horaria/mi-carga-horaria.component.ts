import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';

interface MateriaItem {
  _id: string;
  nombre: string;
  codigo: string;
  horas: number;
}

interface GrupoCarga {
  cursoLectivo: {
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
  };
  materias: MateriaItem[];
  totalHoras: number;
}

@Component({
  selector: 'app-mi-carga-horaria',
  templateUrl: './mi-carga-horaria.component.html',
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class MiCargaHorariaComponent implements OnInit {
  breadscrums = [
    { title: 'Mi Carga Horaria', items: ['Docente'], active: 'Carga Horaria' },
  ];

  loading = false;
  grupos: GrupoCarga[] = [];
  displayedColumns = ['nombre', 'codigo', 'horas'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/teachers/me`).subscribe({
      next: (res) => {
        const teacher = res.data ?? res;
        const docenteId = teacher._id ?? teacher.id;
        this.loadCargaHoraria(docenteId);
      },
      error: () => { this.loading = false; },
    });
  }

  private loadCargaHoraria(docenteId: string): void {
    this.http.get<any>(`${environment.apiUrl}/carga-horaria/docente/${docenteId}`).subscribe({
      next: (res) => {
        this.grupos = res.data ?? res;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  getCursoLabel(grupo: GrupoCarga): string {
    const cl = grupo.cursoLectivo;
    if (!cl?.cursoId) return cl?.academicYear ?? '—';
    const c = cl.cursoId;
    const parts = [c.nivel, c.especialidad, c.paralelo, c.jornada].filter(Boolean);
    return `${parts.join(' - ')} · ${cl.academicYear}`;
  }
}
