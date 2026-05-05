import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { Plantilla } from '@shared/services/tramitologia.model';

@Component({
  selector: 'app-plantillas-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, BreadcrumbComponent,
  ],
  templateUrl: './plantillas-list.component.html',
})
export class PlantillasListComponent implements OnInit {
  breadscrums = [{ title: 'Plantillas', items: ['Tramitología'], active: 'Plantillas' }];
  cols = ['nombre', 'categoria', 'roles', 'version', 'activa', 'acciones'];
  plantillas: Plantilla[] = [];
  search = '';
  loading = false;

  constructor(private tramitologiaService: TramitologiaService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.tramitologiaService.getPlantillas(1, 50, this.search || undefined).subscribe({
      next: (r) => { this.plantillas = r.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  delete(p: Plantilla) {
    if (!confirm(`¿Desactivar "${p.nombre}"?`)) return;
    this.tramitologiaService.deletePlantilla(p._id).subscribe({
      next: () => { this.snackBar.open('Plantilla desactivada', 'OK', { duration: 2000 }); this.load(); },
      error: () => { this.snackBar.open('Error al desactivar', 'OK', { duration: 2000 }); },
    });
  }
}
