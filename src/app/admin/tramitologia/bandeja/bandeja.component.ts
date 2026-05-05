import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { TramiteStatusBadgeComponent } from '@shared/components/tramitologia/status-badge/status-badge.component';
import { TransitionDialogComponent } from './transition-dialog/transition-dialog.component';
import { Tramite } from '@shared/services/tramitologia.model';
import { AuthService } from '@core';

@Component({
  selector: 'app-tramite-bandeja',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    BreadcrumbComponent, TramiteStatusBadgeComponent,
  ],
  templateUrl: './bandeja.component.html',
})
export class BandejaComponent implements OnInit {
  breadscrums = [{ title: 'Bandeja', items: ['Tramitología'], active: 'Bandeja' }];
  cols = ['codigo', 'plantilla', 'solicitante', 'state', 'fecha', 'acciones'];
  tramites: Tramite[] = [];
  stateFilter = '';
  loading = false;
  isOperativo = false;

  constructor(
    private tramitologiaService: TramitologiaService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.isOperativo = user?.roles?.[0]?.name === 'TRAMITE_OPERATIVO';
    this.load();
  }

  load() {
    this.loading = true;
    const obs = this.isOperativo
      ? this.tramitologiaService.getInbox(1, 100, this.stateFilter || undefined)
      : this.tramitologiaService.getAllTramites({ state: this.stateFilter || undefined, page: 1, limit: 100 });

    obs.subscribe({
      next: (r) => { this.tramites = r.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openTransition(tramite: Tramite) {
    const ref = this.dialog.open(TransitionDialogComponent, { width: '420px', data: { tramite } });
    ref.afterClosed().subscribe((result) => { if (result) this.load(); });
  }
}
