import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { StudentsFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { StudentsDeleteComponent } from './dialogs/delete/delete.component';
import { BulkImportDialogComponent, BulkImportColumn } from '@shared/components/bulk-import/bulk-import-dialog.component';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { StudentsService } from './students.service';
import { Students } from './students.model';
import { rowsAnimation, TableExportUtil } from '@shared';
import { formatDate, DatePipe, CommonModule, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-all-students',
  templateUrl: './all-students.component.html',
  styleUrls: ['./all-students.component.scss'],
  animations: [rowsAnimation],
  imports: [
    BreadcrumbComponent,
    FeatherIconsComponent,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    NgClass,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatPaginatorModule,
    DatePipe,
    TableShowHideColumnComponent,
    NgxPermissionsModule,
  ],
})
export class AllStudentsComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: false },
    { def: 'id', label: 'ID', type: 'text', visible: false },
    { def: 'dni', label: 'DNI', type: 'text', visible: true },
    { def: 'name', label: 'Name', type: 'text', visible: true },
    { def: 'mobile', label: 'Celular', type: 'text', visible: true },
    { def: 'email', label: 'Email', type: 'email', visible: false },
    { def: 'gender', label: 'Sexo', type: 'text', visible: true },
    { def: 'residenceZone', label: 'Zona de Residencia', type: 'text', visible: true },
    { def: 'birthdate', label: 'Fecha de Nac.', type: 'date', visible: true },
    { def: 'address', label: 'Dirección', type: 'address', visible: false },
    { def: 'parentGuardianName', label: 'Encargado', type: 'text', visible: true },
    { def: 'parentGuardianMobile', label: 'Tel. Encargado', type: 'text', visible: true },
    { def: 'fatherName', label: 'Padre', type: 'text', visible: false },
    { def: 'fatherMobile', label: 'Tel. Padre', type: 'text', visible: false },
    { def: 'motherName', label: 'Madre', type: 'text', visible: false },
    { def: 'motherMobile', label: 'Tel. Madre', type: 'text', visible: false },
    { def: 'status', label: 'Status', type: 'text', visible: false },
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<Students>([]);
  selection = new SelectionModel<Students>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  breadscrums = [
    {
      title: 'Todos los estudiantes',
      items: ['Student'],
      active: 'Todos los estudiantes',
    },
  ];

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public studentsService: StudentsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.loadData();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  loadData() {
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (data: Students, filter: string) =>
          Object.values(data).some((value) =>
            value != null && value.toString().toLowerCase().includes(filter)
          );
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
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: Students) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: Students) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(StudentsFormComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { student: data, action },
      direction: varDirection,
      autoFocus: false,
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
          `${action === 'add' ? 'Add' : 'Edit'} Record Successfully...!!!`,
          'bottom',
          'center'
        );
      }
    });
  }

  private updateRecord(updatedRecord: Students) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: Students) {
    const dialogRef = this.dialog.open(StudentsDeleteComponent, {
      data: row,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(
          (record) => record.id !== row.id
        );
        this.refreshTable();
        this.showNotification(
          'snackbar-danger',
          'Delete Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  openBulkImport() {
    const STUDENT_BULK_COLUMNS: BulkImportColumn[] = [
      { key: 'name',                label: 'Nombre',           required: true,  example: 'Juan Pérez' },
      { key: 'dni',                 label: 'Cédula',           required: true,  example: '1234567890' },
      { key: 'email',               label: 'Email',            required: false, example: 'juan@email.com' },
      { key: 'mobile',              label: 'Celular',          required: false, example: '0991234567' },
      { key: 'gender',              label: 'Sexo',             required: false, example: 'Male' },
      { key: 'birthdate',           label: 'Fecha Nacimiento', required: false, example: '2005-03-15' },
      { key: 'address',             label: 'Dirección',        required: false, example: 'Av. Principal 123' },
      { key: 'residenceZone',       label: 'Zona Residencia',  required: false, example: 'URBANA' },
      { key: 'parentGuardianName',  label: 'Nombre Encargado', required: false, example: 'María Pérez' },
      { key: 'parentGuardianMobile',label: 'Tel. Encargado',   required: false, example: '0987654321' },
      { key: 'status',              label: 'Estado',           required: false, example: 'active' },
    ];
    const dialogRef = this.dialog.open(BulkImportDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        entityName: 'Estudiantes',
        columns: STUDENT_BULK_COLUMNS,
        submitFn: (rows: Record<string, any>[]) => this.studentsService.bulkCreate(rows),
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.successCount > 0) this.loadData();
    });
  }

  exportExcel() {
    const exportData = this.dataSource.filteredData.map((x) => ({
      DNI: x.dni,
      Name: x.name,
      Celular: x.mobile,
      Email: x.email,
      Gender: x.gender,
      'Zona de Residencia': x.residenceZone,
      'Fecha de Nacimiento': x.birthdate ? formatDate(new Date(x.birthdate), 'yyyy-MM-dd', 'en') : '',
      Address: x.address,
      Encargado: x.parentGuardianName,
      'Tel. Encargado': x.parentGuardianMobile,
      Padre: x.fatherName,
      'Tel. Padre': x.fatherMobile,
      Madre: x.motherName,
      'Tel. Madre': x.motherMobile,
      Status: x.status,
    }));

    TableExportUtil.exportToExcel(exportData, 'student_export');
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    this.dataSource.data = this.dataSource.data.filter(
      (item) => !this.selection.selected.includes(item)
    );
    this.selection.clear();
    this.showNotification(
      'snackbar-danger',
      `${totalSelect} Record(s) Deleted Successfully...!!!`,
      'bottom',
      'center'
    );
  }
  onContextMenu(event: MouseEvent, item: Students) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
