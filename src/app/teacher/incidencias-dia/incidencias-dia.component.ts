import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';

interface AsistenciaFlag {
  studentId: string;
  name: string;
  dni?: string;
  note?: string;
}

interface NovedadDia {
  _id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  creadoPor: string;
  studentIds: { _id: string; name: string; dni?: string }[];
  cursoLectivoId?: unknown;
}

interface ExpedienteDia {
  studentId: string;
  studentName: string;
  tipo: string;
  descripcion: string;
  creadoPor: string;
}

interface DeceFlag {
  studentId: string;
  name: string;
}

interface PanelIncidenciasResponse {
  date: string;
  cursoLectivo: any;
  totalEstudiantes: number;
  ausentes: AsistenciaFlag[];
  atrasados: AsistenciaFlag[];
  novedades: NovedadDia[];
  expedientes: ExpedienteDia[];
  deceFlags: DeceFlag[];
}

function todayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-incidencias-dia',
  standalone: true,
  templateUrl: './incidencias-dia.component.html',
  styleUrls: ['./incidencias-dia.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatChipsModule,
  ],
})
export class IncidenciasDiaComponent implements OnInit {
  breadscrums = [{ title: 'Incidencias del Día', items: ['Docente'], active: 'Incidencias del Día' }];

  selectedDate = todayIso();
  todayIso = todayIso();
  loading = true;
  esTutor = false;
  cursoLabel = '';
  data: PanelIncidenciasResponse | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http
      .get<any>(`${environment.apiUrl}/panel-incidencias/tutor/dia`, { params: { date: this.selectedDate } })
      .subscribe({
        next: (res) => {
          const body: PanelIncidenciasResponse = res.data ?? res;
          this.data = body;
          this.esTutor = !!body.cursoLectivo;
          this.cursoLabel = this.buildCursoLabel(body.cursoLectivo);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  private buildCursoLabel(cl: any): string {
    if (!cl) return '';
    const c = cl.cursoId ?? {};
    const nivel = c.nivel ?? '';
    const especialidad = c.especialidad ? ` — ${c.especialidad}` : '';
    const paralelo = c.paralelo ? ` — Paralelo ${c.paralelo}` : '';
    const jornada = c.jornada ? ` | ${c.jornada}` : '';
    return `${nivel}${especialidad}${paralelo}${jornada}`;
  }

  onDateChange(value: string) {
    this.selectedDate = value || todayIso();
    this.load();
  }

  goToday() {
    this.selectedDate = todayIso();
    this.load();
  }

  novedadEstudiantes(n: NovedadDia): string {
    return (n.studentIds ?? []).map((s) => s.name).join(', ');
  }
}
