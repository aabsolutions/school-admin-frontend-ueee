import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '@environments/environment';

export interface CursoDetalleDialogData {
  cursoLectivoId: string;
  cantidadEstudiantes: number;
}

interface CursoDetalle {
  nivel: string;
  subnivel: string;
  especialidad: string;
  paralelo: string;
  jornada: string;
  academicYear: string;
  status: string;
  tutor: { name: string; email: string; mobile: string } | null;
  inspector: { name: string; email: string; mobile: string } | null;
  dece: { name: string; email: string; mobile: string } | null;
}

@Component({
  selector: 'app-curso-detalle-dialog',
  templateUrl: './curso-detalle-dialog.component.html',
  styleUrls: ['./curso-detalle-dialog.component.scss'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
})
export class CursoDetalleDialogComponent implements OnInit {
  loading = true;
  curso: CursoDetalle | null = null;
  cantidadEstudiantes: number;

  constructor(
    public dialogRef: MatDialogRef<CursoDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CursoDetalleDialogData,
    private http: HttpClient,
  ) {
    this.cantidadEstudiantes = data.cantidadEstudiantes;
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/curso-lectivo/${this.data.cursoLectivoId}`).subscribe({
      next: (res) => {
        const cl = res.data ?? {};
        const c  = cl.cursoId ?? {};
        this.curso = {
          nivel: c.nivel ?? '—',
          subnivel: c.subnivel ?? '—',
          especialidad: c.especialidad ?? '',
          paralelo: c.paralelo ?? '—',
          jornada: c.jornada ?? '—',
          academicYear: cl.academicYear ?? '—',
          status: cl.status ?? '—',
          tutor: cl.tutorId ? { name: cl.tutorId.name, email: cl.tutorId.email, mobile: cl.tutorId.mobile ?? '—' } : null,
          inspector: cl.inspectorId ? { name: cl.inspectorId.name, email: cl.inspectorId.email, mobile: cl.inspectorId.mobile ?? '—' } : null,
          dece: cl.psicologoId ? { name: cl.psicologoId.name, email: cl.psicologoId.email, mobile: cl.psicologoId.mobile ?? '—' } : null,
        };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
