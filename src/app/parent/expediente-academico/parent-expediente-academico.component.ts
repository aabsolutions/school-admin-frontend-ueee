import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentApiService, StudentSummary } from '../services/parent-api.service';
import { environment } from '@environments/environment';
import {
  SeccionGroup,
  groupBySecciones,
} from '../../admin/expediente-academico/all-expediente-academico/expediente-academico.model';

@Component({
  selector: 'app-parent-expediente-academico',
  templateUrl: './parent-expediente-academico.component.html',
  styleUrls: ['./parent-expediente-academico.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class ParentExpedienteAcademicoComponent implements OnInit {
  breadscrums = [{ title: 'Expedientes Académicos', items: ['Representante'], active: 'Expedientes Académicos' }];

  hijos: StudentSummary[] = [];
  selectedHijoId: string | null = null;

  loadingHijos = true;
  loadingExpediente = false;
  tieneExpediente = false;
  secciones: SeccionGroup[] = [];

  constructor(private api: ParentApiService, private http: HttpClient) {}

  ngOnInit() {
    this.api.getHijos().subscribe({
      next: (hijos) => {
        this.hijos = hijos;
        this.loadingHijos = false;
        if (hijos.length === 1) {
          this.selectedHijoId = hijos[0]._id;
          this.loadExpediente();
        }
      },
      error: () => { this.loadingHijos = false; },
    });
  }

  onHijoChange() {
    if (this.selectedHijoId) this.loadExpediente();
  }

  loadExpediente() {
    if (!this.selectedHijoId) return;
    this.loadingExpediente = true;
    this.tieneExpediente = false;
    this.secciones = [];

    this.http.get<any>(`${environment.apiUrl}/expediente-academico/parent/hijo/${this.selectedHijoId}`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        this.tieneExpediente = !!data.expediente;
        this.secciones = groupBySecciones(data.documentos ?? []);
        this.loadingExpediente = false;
      },
      error: () => { this.loadingExpediente = false; },
    });
  }

  getHijoNombre(): string {
    return this.hijos.find(h => h._id === this.selectedHijoId)?.name ?? '';
  }
}
