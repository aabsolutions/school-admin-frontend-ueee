import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ExpedienteAcademicoService } from './expediente-academico.service';
import { StudentExpedienteRow } from './expediente-academico.model';
import { ExpedienteAcademicoDetailDialogComponent } from './dialogs/detail-dialog/detail-dialog.component';
import { GestionSeccionesDialogComponent } from './dialogs/gestion-secciones-dialog/gestion-secciones-dialog.component';

@Component({
  selector: 'app-all-expediente-academico',
  templateUrl: './all-expediente-academico.component.html',
  styleUrls: ['./all-expediente-academico.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class AllExpedienteAcademicoComponent implements OnInit, OnDestroy {
  breadscrums = [{ title: 'Expedientes Académicos', items: ['Gestión'], active: 'Expedientes Académicos' }];

  displayedColumns = ['student', 'dni', 'totalDocumentos', 'ultimaActividad', 'actions'];
  dataSource = new MatTableDataSource<StudentExpedienteRow>([]);

  isLoading = false;
  total = 0;
  page = 1;
  limit = 15;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) set matSort(s: MatSort) { this.dataSource.sort = s; }
  // No dataSource.paginator: la paginación es server-side (loadData() vía onPage()).
  // Asignar paginator acá hace que MatTableDataSource re-recorte localmente
  // la página ya recortada por el backend, vaciando la tabla desde la página 2.

  constructor(
    private svc: ExpedienteAcademicoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => { this.page = 1; this.loadData(); });
    this.loadData();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  loadData() {
    this.isLoading = true;
    this.svc.getAll(this.searchTerm, this.page, this.limit).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.total = res.total ?? 0;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onSearch(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  openExpediente(row: StudentExpedienteRow) {
    if (row.expedienteId) {
      this.showDetail(row);
    } else {
      this.svc.getOrCreate(row._id).subscribe({
        next: (exp) => {
          row.expedienteId = exp._id;
          this.showDetail(row);
        },
        error: (err) => this.snackBar.open(err.message || 'Error al crear expediente', '', {
          duration: 3000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        }),
      });
    }
  }

  onPage(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.loadData();
  }

  openGestionSecciones() {
    const ref = this.dialog.open(GestionSeccionesDialogComponent, {
      width: '560px', maxWidth: '95vw', autoFocus: false,
    });
    ref.afterClosed().subscribe(() => this.loadData());
  }

  private showDetail(row: StudentExpedienteRow) {
    const expediente: any = {
      _id: row.expedienteId,
      student: { _id: row._id, name: row.name, email: row.email, dni: row.dni, img: row.img, gender: '', mobile: '' },
    };
    const ref = this.dialog.open(ExpedienteAcademicoDetailDialogComponent, {
      width: '800px', maxWidth: '95vw', autoFocus: false,
      data: { expediente },
    });
    ref.afterClosed().subscribe(() => this.loadData());
  }
}
