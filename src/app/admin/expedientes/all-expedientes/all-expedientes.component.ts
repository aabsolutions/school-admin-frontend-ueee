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
import { ExpedientesService } from './expedientes.service';
import { Expediente } from './expediente.model';
import { DetailDialogComponent } from './dialogs/detail-dialog/detail-dialog.component';
import { RegistroDialogComponent } from './dialogs/registro-dialog/registro-dialog.component';
import { NuevoExpedienteDialogComponent } from './dialogs/nuevo-expediente-dialog/nuevo-expediente-dialog.component';

@Component({
  selector: 'app-all-expedientes',
  templateUrl: './all-expedientes.component.html',
  styleUrls: ['./all-expedientes.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class AllExpedientesComponent implements OnInit {
  breadscrums = [{ title: 'Expedientes', items: ['Disciplina'], active: 'Expedientes' }];

  displayedColumns = ['student', 'dni', 'totalRegistros', 'ultimoRegistro', 'status', 'actions'];
  dataSource = new MatTableDataSource<Expediente>([]);

  searchTerm = '';
  isLoading  = true;
  total      = 0;

  private search$ = new Subject<string>();

  @ViewChild(MatSort)     set matSort(s: MatSort)          { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator){ this.dataSource.paginator = p; }

  constructor(
    private svc: ExpedientesService,
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
      error: (err) => {
        console.error('[Expedientes] Error al cargar:', err);
        this.isLoading = false;
        this.snackBar.open(err?.message || 'Error al cargar los expedientes', '', {
          duration: 5000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onSearch(term: string) { this.search$.next(term); }

  openNuevoExpediente() {
    const ref = this.dialog.open(NuevoExpedienteDialogComponent, {
      width: '520px', maxWidth: '100vw', autoFocus: false,
    });
    ref.afterClosed().subscribe((exp: Expediente | undefined) => {
      if (!exp) return;
      // Agrega si no existe, o actualiza si ya estaba en la tabla
      const idx = this.dataSource.data.findIndex(e => e._id === exp._id);
      if (idx === -1) {
        this.dataSource.data = [exp, ...this.dataSource.data];
        this.dataSource._updateChangeSubscription();
        this.snackBar.open('Expediente creado', '', {
          duration: 2500, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      } else {
        this.snackBar.open('El estudiante ya tiene un expediente — abriendo...', '', {
          duration: 2500, verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
      // Siempre abre el detalle
      this.openDetail(exp);
    });
  }

  openDetail(exp: Expediente) {
    const ref = this.dialog.open(DetailDialogComponent, {
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

  deleteExpediente(exp: Expediente, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm(`¿Eliminár el expediente de ${exp.student?.name ?? 'este estudiante'}?`)) return;
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

  openNuevoRegistro(exp: Expediente, event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialog.open(RegistroDialogComponent, {
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
        this.snackBar.open('Registro agregado', '', {
          duration: 2500, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
    });
  }
}
