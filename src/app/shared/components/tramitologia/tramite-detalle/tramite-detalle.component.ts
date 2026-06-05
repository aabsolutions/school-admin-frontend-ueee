import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { TramiteStatusBadgeComponent } from '../status-badge/status-badge.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Tramite, TramiteHistory } from '@shared/services/tramitologia.model';

@Component({
  selector: 'app-tramite-detalle',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    TramiteStatusBadgeComponent, BreadcrumbComponent,
  ],
  templateUrl: './tramite-detalle.component.html',
})
export class TramiteDetalleComponent implements OnInit {
  breadscrums = [{ title: 'Detalle', items: ['Trámites'], active: 'Detalle' }];
  tramite: Tramite | null = null;
  history: TramiteHistory[] = [];
  downloadingPdf = false;
  downloadingResponse = false;
  private tramiteId = '';

  constructor(
    private route: ActivatedRoute,
    private tramitologiaService: TramitologiaService,
  ) {}

  ngOnInit() {
    this.tramiteId = this.route.snapshot.paramMap.get('id')!;
    this.tramitologiaService.getTramite(this.tramiteId).subscribe((t) => {
      this.tramite = t;
      this.breadscrums = [{ title: t.codigo, items: ['Trámites'], active: t.codigo }];
    });
    this.tramitologiaService.getTramiteHistory(this.tramiteId).subscribe((h) => { this.history = h; });
  }

  openPdf() {
    this.downloadingPdf = true;
    this.tramitologiaService.downloadPdf(this.tramiteId).subscribe({
      next: (blob) => { this.openBlob(blob, `${this.tramite?.codigo}.pdf`); this.downloadingPdf = false; },
      error: () => { this.downloadingPdf = false; },
    });
  }

  openResponsePdf() {
    this.downloadingResponse = true;
    this.tramitologiaService.downloadResponsePdf(this.tramiteId).subscribe({
      next: (blob) => { this.openBlob(blob, `respuesta-${this.tramite?.codigo}.pdf`); this.downloadingResponse = false; },
      error: () => { this.downloadingResponse = false; },
    });
  }

  private openBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  actorName(h: TramiteHistory): string {
    if (typeof h.actorUserId === 'object') return h.actorUserId.name;
    return h.actorRole;
  }

  stateBadgeClass(state: string): string {
    const map: Record<string, string> = {
      pendiente:   'bg-warning',
      en_proceso:  'bg-info',
      aprobado:    'bg-success',
      rechazado:   'bg-danger',
      finalizado:  'bg-primary',
    };
    return map[state] ?? 'bg-secondary';
  }
}
