import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Direction } from '@angular/cdk/bidi';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AreaEstudio } from './area-estudio.model';
import { AreaEstudioService } from './area-estudio.service';
import { AreaEstudioFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { AreaEstudioDeleteComponent } from './dialogs/delete/delete.component';

@Component({
  selector: 'app-all-area-estudio',
  templateUrl: './all-area-estudio.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatTooltipModule, MatProgressSpinnerModule,
    MatTableModule, MatSortModule, MatPaginatorModule, MatChipsModule,
  ],
})
export class AllAreaEstudioComponent implements OnInit {
  breadscrums = [{ title: 'Áreas de Estudio', items: ['Administración'], active: 'Áreas de Estudio' }];

  displayedColumns = ['nombre', 'descripcion', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<AreaEstudio>([]);
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: AreaEstudioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.dataSource.filterPredicate = (row, filter) =>
          row.nombre.toLowerCase().includes(filter) ||
          (row.descripcion ?? '').toLowerCase().includes(filter);
      },
      error: () => { this.isLoading = false; },
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  openDialog(action: 'add' | 'edit', area?: AreaEstudio): void {
    const direction: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(AreaEstudioFormComponent, {
      width: '500px',
      maxWidth: '100vw',
      data: { action, area: area ?? new AreaEstudio() },
      direction,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (action === 'add') {
        this.dataSource.data = [result, ...this.dataSource.data];
      } else {
        const idx = this.dataSource.data.findIndex((r) => r.id === result.id);
        if (idx !== -1) {
          this.dataSource.data[idx] = result;
          this.dataSource._updateChangeSubscription();
        }
      }
      this.snackBar.open(
        action === 'add' ? 'Área creada correctamente' : 'Área actualizada correctamente',
        '', { duration: 3000, panelClass: 'snackbar-success', verticalPosition: 'bottom', horizontalPosition: 'center' }
      );
    });
  }

  deleteItem(row: AreaEstudio): void {
    const dialogRef = this.dialog.open(AreaEstudioDeleteComponent, {
      width: '400px',
      data: { id: row.id, nombre: row.nombre },
    });
    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) {
        this.dataSource.data = this.dataSource.data.filter((r) => r.id !== row.id);
        this.snackBar.open('Área eliminada', '', {
          duration: 3000, panelClass: 'snackbar-danger', verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
    });
  }
}
