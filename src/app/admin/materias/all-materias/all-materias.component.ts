import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { MateriaFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { MateriaDeleteComponent } from './dialogs/delete/delete.component';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MateriasService } from './materias.service';
import { Materia } from './materia.model';
import { rowsAnimation, TableExportUtil } from '@shared';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { Direction } from '@angular/cdk/bidi';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';

@Component({
  selector: 'app-all-materias',
  templateUrl: './all-materias.component.html',
  styleUrls: ['./all-materias.component.scss'],
  animations: [rowsAnimation],
  imports: [
    BreadcrumbComponent, FeatherIconsComponent, CommonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatTooltipModule, MatSelectModule, ReactiveFormsModule, FormsModule,
    MatOptionModule, MatCheckboxModule, MatTableModule, MatSortModule,
    NgClass, MatRippleModule, MatProgressSpinnerModule, MatMenuModule,
    MatPaginatorModule, TableShowHideColumnComponent,
  ],
})
export class AllMateriasComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select',      label: 'Checkbox',     type: 'check',     visible: true },
    { def: 'nombre',      label: 'Nombre',        type: 'text',      visible: true },
    { def: 'codigo',      label: 'Código',        type: 'text',      visible: true },
    { def: 'descripcion', label: 'Descripción',   type: 'text',      visible: true },
    { def: 'status',      label: 'Estado',        type: 'text',      visible: true },
    { def: 'actions',     label: 'Acciones',      type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<Materia>([]);
  selection = new SelectionModel<Materia>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  breadscrums = [{ title: 'Materias', items: ['Oferta Educativa'], active: 'Materias' }];

  constructor(
    public dialog: MatDialog,
    public materiasService: MateriasService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { this.loadData(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  refresh() { this.loadData(); }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
  }

  loadData() {
    this.materiasService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (row: Materia, filter: string) =>
          Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));
      },
      error: (err) => console.error(err),
    });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  addNew() { this.openDialog('add'); }
  editCall(row: Materia) { this.openDialog('edit', row); }

  openDialog(action: 'add' | 'edit', data?: Materia) {
    const varDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(MateriaFormComponent, {
      width: '50vw', maxWidth: '100vw',
      data: { materia: data, action },
      direction: varDirection, autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add') {
          this.dataSource.data = [result, ...this.dataSource.data];
        } else {
          this.updateRecord(result);
        }
        this.refreshTable();
        this.showNotification(
          action === 'add' ? 'snackbar-success' : 'black',
          `Materia ${action === 'add' ? 'agregada' : 'actualizada'} correctamente`,
          'bottom', 'center'
        );
      }
    });
  }

  private updateRecord(updated: Materia) {
    const idx = this.dataSource.data.findIndex(r => r.id === updated.id);
    if (idx !== -1) {
      this.dataSource.data[idx] = updated;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: Materia) {
    const dialogRef = this.dialog.open(MateriaDeleteComponent, { data: row });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== row.id);
        this.refreshTable();
        this.showNotification('snackbar-danger', 'Materia eliminada', 'bottom', 'center');
      }
    });
  }

  exportExcel() {
    const exportData = this.dataSource.filteredData.map(x => ({
      Nombre: x.nombre, Código: x.codigo, Descripción: x.descripcion, Estado: x.status,
    }));
    TableExportUtil.exportToExcel(exportData, 'materias_export');
  }

  showNotification(colorName: string, text: string,
    placementFrom: MatSnackBarVerticalPosition, placementAlign: MatSnackBarHorizontalPosition) {
    this.snackBar.open(text, '', { duration: 2000, verticalPosition: placementFrom,
      horizontalPosition: placementAlign, panelClass: colorName });
  }

  isAllSelected() { return this.selection.selected.length === this.dataSource.data.length; }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onContextMenu(event: MouseEvent, item: Materia) {
    event.preventDefault();
    this.contextMenuPosition = { x: `${event.clientX}px`, y: `${event.clientY}px` };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
