import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';
import { DriveDocumento, SeccionGroup, groupBySecciones } from '../../admin/expediente-academico/all-expediente-academico/expediente-academico.model';

@Component({
  selector: 'app-mi-expediente-academico',
  templateUrl: './mi-expediente-academico.component.html',
  styleUrls: ['./mi-expediente-academico.component.scss'],
  imports: [
    CommonModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class MiExpedienteAcademicoComponent implements OnInit {
  breadscrums = [{ title: 'Mi Expediente Académico', items: ['Estudiante'], active: 'Mi Expediente Académico' }];

  loading = true;
  tieneExpediente = false;
  secciones: SeccionGroup[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/expediente-academico/me`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        this.tieneExpediente = !!data.expediente;
        this.secciones = groupBySecciones(data.documentos ?? []);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
