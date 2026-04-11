import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { DeceService } from './dece.service';
import { DeceExpediente } from './dece.model';
import { DeceDetailDialogComponent } from './dialogs/detail-dialog/dece-detail-dialog.component';
import { DeceRegistroDialogComponent } from './dialogs/registro-dialog/dece-registro-dialog.component';
import { NuevoDeceDialogComponent } from './dialogs/nuevo-expediente-dialog/nuevo-dece-dialog.component';

@Component({
  selector: 'app-all-dece',
  templateUrl: './all-dece.component.html',
  styleUrls: ['./all-dece.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class AllDeceComponent implements OnInit {
  breadscrums = [{ title: 'DECE', items: ['Atención Psicológica'], active: 'DECE' }];

  displayedColumns = ['student', 'dni', 'totalRegistros', 'ultimoRegistro', 'status', 'actions'];
  dataSource = new MatTableDataSource<DeceExpediente>([]);

  searchTerm = '';
  isLoading  = true;
  total      = 0;

  private search$ = new Subject<string>();

  @ViewChild(MatSort)      set matSort(s: MatSort)           { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(
    private svc: DeceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadData();
    this.search$.pipe(debounceTime(350), distinctUntilChanged()).subscribe(term => {
      this.searchTerm = term;
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;
    this.svc.getAll(this.searchTerm, 1, 200).subscribe({
      next: ({ data, total }) => {
        this.dataSource.data = data;
        this.total = total;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onSearch(term: string) { this.search$.next(term); }

  openNuevoExpediente() {
    const ref = this.dialog.open(NuevoDeceDialogComponent, {
      width: '520px', maxWidth: '100vw', autoFocus: false,
    });
    ref.afterClosed().subscribe((exp: DeceExpediente | undefined) => {
      if (!exp) return;
      const idx = this.dataSource.data.findIndex(e => e._id === exp._id);
      if (idx === -1) {
        this.dataSource.data = [exp, ...this.dataSource.data];
        this.dataSource._updateChangeSubscription();
        this.snackBar.open('Expediente DECE creado', '', {
          duration: 2500, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      } else {
        this.snackBar.open('El estudiante ya tiene un expediente DECE — abriendo...', '', {
          duration: 2500, verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
      this.openDetail(exp);
    });
  }

  openDetail(exp: DeceExpediente) {
    const ref = this.dialog.open(DeceDetailDialogComponent, {
      width: '800px', maxWidth: '95vw', maxHeight: '90vh',
      autoFocus: false,
      data: { expediente: exp },
    });
    ref.afterClosed().subscribe((result?: { count: number; ultimoRegistro?: string }) => {
      if (!result) return;
      const idx = this.dataSource.data.findIndex(e => e._id === exp._id);
      if (idx !== -1) {
        this.dataSource.data[idx] = {
          ...this.dataSource.data[idx],
          totalRegistros: result.count,
          ultimoRegistro: result.ultimoRegistro,
        };
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  deleteExpediente(exp: DeceExpediente, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar el expediente DECE de ${exp.student?.name ?? 'este estudiante'}?`)) return;
    this.svc.deleteExpediente(exp._id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(e => e._id !== exp._id);
        this.dataSource._updateChangeSubscription();
        this.snackBar.open('Expediente eliminado', '', {
          duration: 2500, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
      error: (err) => this.snackBar.open(err.message || 'Error al eliminar', '', {
        duration: 4000, panelClass: 'snackbar-danger',
        verticalPosition: 'bottom', horizontalPosition: 'center',
      }),
    });
  }

  openNuevoRegistro(exp: DeceExpediente, event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialog.open(DeceRegistroDialogComponent, {
      width: '600px', maxWidth: '100vw', autoFocus: false,
      data: { expedienteId: exp._id, studentName: exp.student?.name ?? '' },
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        const idx = this.dataSource.data.findIndex(e => e._id === exp._id);
        if (idx !== -1) {
          this.dataSource.data[idx] = {
            ...this.dataSource.data[idx],
            totalRegistros: (this.dataSource.data[idx].totalRegistros ?? 0) + 1,
            ultimoRegistro: res.fecha,
          };
          this.dataSource._updateChangeSubscription();
        }
        this.snackBar.open('Registro DECE agregado', '', {
          duration: 2500, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
    });
  }
}
