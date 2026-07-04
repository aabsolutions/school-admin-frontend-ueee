import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { NovedadesService } from '../novedades.service';
import { Novedad, getTipoConfig, cursoLectivoDisplay } from '../novedad.model';
import { NuevaNovedadDialogComponent } from './dialogs/nueva-novedad-dialog/nueva-novedad-dialog.component';
import { NovedadDetailDialogComponent } from './dialogs/detail-dialog/novedad-detail-dialog.component';

@Component({
  selector: 'app-all-novedades',
  templateUrl: './all-novedades.component.html',
  styleUrls: ['./all-novedades.component.scss'],
  imports: [
    CommonModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class AllNovedadesComponent implements OnInit {
  breadscrums = [{ title: 'Novedades', items: ['Registro'], active: 'Novedades' }];

  displayedColumns = ['tipo', 'involucrados', 'fecha', 'descripcion', 'creadoPor', 'actions'];
  dataSource = new MatTableDataSource<Novedad>([]);
  readonly getTipoConfig = getTipoConfig;
  readonly cursoDisplay = cursoLectivoDisplay;

  isLoading = true;
  total = 0;
  pageIndex = 0;
  pageSize = 15;
  sortBy = 'fecha';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private svc: NovedadesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.svc.getAll({
      page: this.pageIndex + 1,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    }).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Novedades] Error al cargar:', err);
        this.isLoading = false;
        this.snackBar.open(err?.message || 'Error al cargar las novedades', '', {
          duration: 5000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadData();
  }

  onSortChange(sort: Sort) {
    if (!sort.active || !sort.direction) {
      this.sortBy = 'fecha';
      this.sortOrder = 'desc';
    } else {
      this.sortBy = sort.active;
      this.sortOrder = sort.direction;
    }
    this.pageIndex = 0;
    this.loadData();
  }

  involucradosLabel(n: Novedad): string {
    if (n.tipo === 'ProblemaAula') return this.cursoDisplay(n.cursoLectivoId);
    return n.studentIds?.length ? n.studentIds.map((s) => s.name).join(', ') : '—';
  }

  openNuevaNovedad() {
    const ref = this.dialog.open(NuevaNovedadDialogComponent, {
      width: '720px', maxWidth: '100vw', maxHeight: '90vh', autoFocus: false,
    });
    ref.afterClosed().subscribe((created?: Novedad) => {
      if (!created) return;
      this.snackBar.open('Novedad registrada', '', {
        duration: 2500, panelClass: 'snackbar-success',
        verticalPosition: 'bottom', horizontalPosition: 'center',
      });
      this.loadData();
    });
  }

  openDetail(novedad: Novedad) {
    this.dialog.open(NovedadDetailDialogComponent, {
      width: '700px', maxWidth: '95vw', maxHeight: '90vh', autoFocus: false,
      data: { novedad },
    });
  }

  deleteNovedad(novedad: Novedad, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm('¿Eliminar esta novedad? Esta acción no se puede deshacer.')) return;
    this.svc.delete(novedad._id).subscribe({
      next: () => {
        this.snackBar.open('Novedad eliminada', '', {
          duration: 2500, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
        this.loadData();
      },
      error: (err) => this.snackBar.open(err.message || 'Error al eliminar', '', {
        duration: 4000, panelClass: 'snackbar-danger',
        verticalPosition: 'bottom', horizontalPosition: 'center',
      }),
    });
  }
}
