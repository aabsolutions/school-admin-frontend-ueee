import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentApiService, HijoDashboard } from '../services/parent-api.service';

@Component({
  selector: 'app-hijos-list',
  templateUrl: './hijos-list.component.html',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent,
  ],
})
export class HijosListComponent implements OnInit {
  breadscrums = [{ title: 'Mis Hijos', items: ['Representante'], active: 'Mis Hijos' }];
  hijos: HijoDashboard[] = [];
  isLoading = true;

  constructor(private api: ParentApiService) {}

  ngOnInit() {
    this.api.getHijosDashboard().subscribe({
      next: (data) => {
        this.hijos = data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      active: 'primary', inactive: 'warn', graduated: 'accent', suspended: 'warn',
    };
    return map[status] ?? 'default';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Activo', inactive: 'Inactivo', graduated: 'Graduado', suspended: 'Suspendido',
    };
    return map[status] ?? status;
  }
}
