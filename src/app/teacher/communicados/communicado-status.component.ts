import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CommunicadosApiService, TeacherCommunicado } from './communicados-api.service';

@Component({
  selector: 'app-communicado-status',
  templateUrl: './communicado-status.component.html',
  imports: [CommonModule, RouterLink, BreadcrumbComponent, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
})
export class CommunicadoStatusComponent implements OnInit {
  breadscrums = [{ title: 'Detalle Comunicado', items: ['Docente', 'Comunicados'], active: 'Detalle' }];
  communicado: TeacherCommunicado | null = null;
  isLoading = true;

  constructor(
    private api: CommunicadosApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.api.getOne(id).subscribe({
      next: (c) => { this.communicado = c; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }
}
