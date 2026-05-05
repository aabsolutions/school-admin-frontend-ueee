import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { TramiteStatusBadgeComponent } from '../status-badge/status-badge.component';
import { Tramite } from '@shared/services/tramitologia.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-mis-tramites',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, MatTooltipModule,
    TramiteStatusBadgeComponent, BreadcrumbComponent,
  ],
  templateUrl: './mis-tramites.component.html',
})
export class MisTramitesComponent implements OnInit {
  @Input() portal: string = 'student';
  breadscrums = [{ title: 'Mis Trámites', items: ['Trámites'], active: 'Mis Trámites' }];
  cols = ['codigo', 'plantilla', 'state', 'fecha', 'acciones'];
  tramites: Tramite[] = [];
  stateFilter = '';
  loading = false;

  constructor(private tramitologiaService: TramitologiaService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.tramitologiaService.getMyTramites(1, 50, this.stateFilter || undefined).subscribe({
      next: (r) => { this.tramites = r.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
