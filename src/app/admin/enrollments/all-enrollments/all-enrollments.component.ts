import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { EnrollmentFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { EnrollmentDeleteComponent } from './dialogs/delete/delete.component';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './enrollment.model';
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
  selector: 'app-all-enrollments',
  templateUrl: './all-enrollments.component.html',
  styleUrls: ['./all-enrollments.component.scss'],
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
export class AllEnrollmentsComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select',       label: 'Checkbox',       type: 'check',     visible: true },
    { def: 'studentName',  label: 'Estudiante',     type: 'text',      visible: true },
    { def: 'studentDni',   label: 'DNI',            type: 'text',      visible: true },
    { def: 'cursoDisplay', label: 'Curso',          type: 'text',      visible: true },
    { def: 'academicYear', label: 'Año Lectivo',    type: 'text',      visible: true },
    { def: 'status',       label: 'Estado',         type: 'text',      visible: true },
    { def: 'enrolledAt',   label: 'Fecha Matrícula',type: 'date',      visible: false },
    { def: 'notes',        label: 'Observaciones',  type: 'text',      visible: false },
    { def: 'actions',      label: 'Acciones',       type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<Enrollment>([]);
  selection = new SelectionModel<Enrollment>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  filterStatus = '';
  filterAcademicYear = '';
  statusOptions = ['enrolled', 'withdrawn', 'transferred'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  breadscrums = [{ title: 'Matrículas', items: ['Gestión'], active: 'Matrículas' }];

  constructor(
    public dialog: MatDialog,
    public enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { this.loadData(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
  refresh() { this.loadData(); }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
  }

  loadData() {
    this.enrollmentService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (row: Enrollment, filter: string) =>
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

  applyDropdownFilters() {
    this.dataSource.filterPredicate = (row: Enrollment, filter: string) => {
      const matchStatus = this.filterStatus ? row.status === this.filterStatus : true;
      const matchYear = this.filterAcademicYear ? row.academicYear === this.filterAcademicYear : true;
      const matchSearch = filter
        ? Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter))
        : true;
      return matchStatus && matchYear && matchSearch;
    };
    this.dataSource.filter = this.dataSource.filter || ' ';
    if (this.dataSource.filter === ' ') this.dataSource.filter = '';
  }

  addNew() { this.openDialog('add'); }
  editCall(row: Enrollment) { this.openDialog('edit', row); }

  openDialog(action: 'add' | 'edit', data?: Enrollment) {
    const varDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(EnrollmentFormComponent, {
      width: '60vw', maxWidth: '100vw',
      data: { enrollment: data, action },
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
          `Matrícula ${action === 'add' ? 'registrada' : 'actualizada'} correctamente`,
          'bottom', 'center'
        );
      }
    });
  }

  private updateRecord(updated: Enrollment) {
    const idx = this.dataSource.data.findIndex(r => r.id === updated.id);
    if (idx !== -1) {
      this.dataSource.data[idx] = updated;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: Enrollment) {
    const dialogRef = this.dialog.open(EnrollmentDeleteComponent, { data: row });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== row.id);
        this.refreshTable();
        this.showNotification('snackbar-danger', 'Matrícula eliminada', 'bottom', 'center');
      }
    });
  }

  exportExcel() {
    const exportData = this.dataSource.filteredData.map(x => ({
      Estudiante: x.studentName, DNI: x.studentDni,
      Curso: x.cursoDisplay, 'Año Lectivo': x.academicYear,
      Estado: x.status, 'Fecha Matrícula': x.enrolledAt, Observaciones: x.notes,
    }));
    TableExportUtil.exportToExcel(exportData, 'matriculas_export');
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

  onContextMenu(event: MouseEvent, item: Enrollment) {
    event.preventDefault();
    this.contextMenuPosition = { x: `${event.clientX}px`, y: `${event.clientY}px` };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
