import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { TramiteStats } from '@shared/services/tramitologia.model';

@Component({
  selector: 'app-tramite-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, BreadcrumbComponent],
  templateUrl: './tramite-dashboard.component.html',
})
export class TramiteDashboardComponent implements OnInit {
  breadscrums = [{ title: 'Dashboard', items: ['Tramitología'], active: 'Dashboard' }];
  stats: TramiteStats | null = null;
  loading = false;

  constructor(private tramitologiaService: TramitologiaService) {}

  ngOnInit() {
    this.loading = true;
    this.tramitologiaService.getStats().subscribe({
      next: (s) => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
