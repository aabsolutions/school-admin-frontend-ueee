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
import { TeachersFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { TeachersDeleteComponent } from './dialogs/delete/delete.component';
import { BulkImportDialogComponent, BulkImportColumn } from '@shared/components/bulk-import/bulk-import-dialog.component';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { TeachersService } from './teachers.service';
import { Teachers } from './teachers.model';
import { rowsAnimation, TableExportUtil } from '@shared';
import { formatDate, DatePipe, CommonModule, NgClass } from '@angular/common';
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

function calcAge(birthdate: string | undefined): number | null {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) age--;
  return age;
}

@Component({
  selector: 'app-all-teachers',
  templateUrl: './all-teachers.component.html',
  styleUrls: ['./all-teachers.component.scss'],
  animations: [rowsAnimation],
  imports: [
    BreadcrumbComponent,
    FeatherIconsComponent,
    CommonModule,
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
export class AllTeachersComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: true },
    { def: 'id', label: 'ID', type: 'text', visible: false },
    { def: 'name', label: 'Name', type: 'text', visible: true },
    { def: 'areaEstudio', label: 'Área de Estudio', type: 'text', visible: true },
    { def: 'email', label: 'Email', type: 'email', visible: true },
    { def: 'dni', label: 'DNI', type: 'text', visible: true },
    { def: 'gender', label: 'Gender', type: 'text', visible: true },
    { def: 'mobile', label: 'Mobile', type: 'phone', visible: true },
    { def: 'laboralDependency',   label: 'Dep. Laboral',    type: 'text',  visible: true },
    { def: 'jornadaLaboral',      label: 'Jornada',         type: 'text',  visible: true },
    { def: 'correoInstitucional', label: 'Correo Inst.',    type: 'email', visible: false },
    { def: 'salarialCategory',    label: 'Cat. Salarial',   type: 'text',  visible: true },
    { def: 'emergencyName', label: 'Contacto Emergencia', type: 'text', visible: false },
    { def: 'emergencyMobile', label: 'Tel. Emergencia', type: 'text', visible: false },
    { def: 'address', label: 'Address', type: 'address', visible: false },
    { def: 'subject_specialization', label: 'Specialization', type: 'text', visible: false },
    { def: 'experience_years', label: 'Experience (Years)', type: 'number', visible: false },
    { def: 'status', label: 'Status', type: 'text', visible: false },
    { def: 'birthdate', label: 'Birthdate', type: 'date', visible: false },
    { def: 'edad',      label: 'Edad',      type: 'number', visible: true },
    { def: 'bio', label: 'Bio', type: 'text', visible: false },
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<Teachers>([]);
  selection = new SelectionModel<Teachers>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;

  filterSearch          = '';
  filterLaboralDep      = '';
  filterJornada         = '';
  filterGender          = '';
  filterAreaEstudio     = '';
  filterEdadRango       = '';

  readonly laboralOptions = ['CONTRATO', 'NOMBRAMIENTO DEFINITIVO', 'NOMBRAMIENTO PROVISIONAL'];
  readonly jornadaOptions = ['MATUTINA', 'VESPERTINA', 'NOCTURNA'];
  readonly genderOptions  = ['Male', 'Female', 'Other'];
  readonly edadRangos = [
    { label: '< 30 años', value: '<30'   },
    { label: '30 – 39',   value: '30-39' },
    { label: '40 – 49',   value: '40-49' },
    { label: '50 – 59',   value: '50-59' },
    { label: '60+',       value: '60+'   },
  ];
  areaEstudioOptions: string[] = [];

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  breadscrums = [
    {
      title: 'All Teacher',
      items: ['Teacher'],
      active: 'All Teacher',
    },
  ];

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public teachersService: TeachersService,
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
    this.teachersService.getAllTeachers().subscribe({
      next: (data) => {
        this.dataSource.data = data.map(t => { t.edad = calcAge(t.birthdate); return t; });
        this.isLoading = false;
        this.areaEstudioOptions = [...new Set(data.map(t => t.areaEstudio).filter(Boolean))].sort();
        this.refreshTable();
        this.dataSource.filterPredicate = (row: Teachers, filterStr: string) => {
          if (!filterStr) return true;
          let f: any;
          try { f = JSON.parse(filterStr); } catch { return true; }
          if (f.laboralDep  && row.laboralDependency !== f.laboralDep)  return false;
          if (f.jornada     && row.jornadaLaboral     !== f.jornada)     return false;
          if (f.gender      && row.gender             !== f.gender)      return false;
          if (f.areaEstudio && row.areaEstudio        !== f.areaEstudio) return false;
          if (f.edadRango) {
            const age = (row as any).edad as number | null;
            if (age == null) return false;
            if (f.edadRango === '<30'   && age >= 30)                return false;
            if (f.edadRango === '30-39' && (age < 30 || age > 39))  return false;
            if (f.edadRango === '40-49' && (age < 40 || age > 49))  return false;
            if (f.edadRango === '50-59' && (age < 50 || age > 59))  return false;
            if (f.edadRango === '60+'   && age < 60)                 return false;
          }
          if (f.search) {
            const s = f.search.toLowerCase();
            const vals = Object.entries(row)
              .filter(([k]) => !['medicalInfo', 'familyInfo'].includes(k))
              .map(([, v]) => v);
            if (!vals.some(v => v != null && v.toString().toLowerCase().includes(s))) return false;
          }
          return true;
        };
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
    this.filterSearch = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      search:      this.filterSearch,
      laboralDep:  this.filterLaboralDep,
      jornada:     this.filterJornada,
      gender:      this.filterGender,
      areaEstudio: this.filterAreaEstudio,
      edadRango:   this.filterEdadRango,
    });
  }

  clearFilters() {
    this.filterSearch      = '';
    this.filterLaboralDep  = '';
    this.filterJornada     = '';
    this.filterGender      = '';
    this.filterAreaEstudio = '';
    this.filterEdadRango   = '';
    if (this.filter?.nativeElement) this.filter.nativeElement.value = '';
    this.applyFilters();
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: Teachers) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: Teachers) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(TeachersFormComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { teachers: data, action },
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

  private updateRecord(updatedRecord: Teachers) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: Teachers) {
    const dialogRef = this.dialog.open(TeachersDeleteComponent, {
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
    const TEACHER_BULK_COLUMNS: BulkImportColumn[] = [
      // ── Datos básicos ──────────────────────────────────────────────
      { key: 'name',                  label: 'Nombre',              required: true,  example: 'Ana González' },
      { key: 'dni',                   label: 'Cédula',              required: true,  example: '0987654321' },
      { key: 'email',                 label: 'Email',               required: false, example: 'ana@email.com' },
      { key: 'mobile',                label: 'Celular',             required: false, example: '0991234567' },
      { key: 'gender',                label: 'Sexo',                required: false, example: 'Female' },
      { key: 'birthdate',             label: 'Fecha Nacimiento',    required: false, example: '1985-06-20' },
      { key: 'address',               label: 'Dirección',           required: false, example: 'Calle 5 de Agosto' },
      { key: 'subjectSpecialization', label: 'Especialización',     required: false, example: 'Matemáticas' },
      { key: 'experienceYears',       label: 'Años Experiencia',    required: false, example: '5' },
      { key: 'laboralDependency',     label: 'Dependencia Laboral', required: false, example: 'CONTRATO' },
      { key: 'jornadaLaboral',        label: 'Jornada Laboral',     required: false, example: 'MATUTINA' },
      { key: 'correoInstitucional',   label: 'Correo Institucional',required: false, example: 'docente@institucion.edu.ec' },
      { key: 'salarialCategory',      label: 'Categoría Salarial',  required: false, example: 'C' },
      { key: 'status',                label: 'Estado',              required: false, example: 'active' },
      { key: 'peso',                  label: 'Peso (kg)',            required: false, example: '70' },
      { key: 'talla',                 label: 'Talla (cm)',           required: false, example: '165' },
      // ── Información médica ─────────────────────────────────────────
      { key: 'bloodType',             label: 'Tipo de Sangre',      required: false, example: 'O+' },
      { key: 'healthInsurance',       label: 'Seguro Médico',       required: false, example: 'IESS' },
      { key: 'policyNumber',          label: 'N° Póliza',           required: false, example: '123456' },
      { key: 'currentMedications',    label: 'Medicamentos',        required: false, example: 'Metformina' },
      { key: 'hasAllergies',          label: 'Tiene Alergias',      required: false, example: 'false' },
      { key: 'allergiesDetail',       label: 'Detalle Alergias',    required: false, example: 'Polen' },
      { key: 'hasChronicCondition',   label: 'Enfermedad Crónica',  required: false, example: 'false' },
      { key: 'chronicConditionDetail',label: 'Detalle Crónica',     required: false, example: 'Diabetes' },
      { key: 'hasDisability',         label: 'Discapacidad',        required: false, example: 'false' },
      { key: 'disabilityDetail',      label: 'Detalle Discapacidad',required: false, example: 'Visual' },
      { key: 'hasConadis',            label: 'Carnet CONADIS',      required: false, example: 'false' },
      { key: 'conadisNumber',         label: 'N° CONADIS',          required: false, example: 'CON-001' },
      // ── Información familiar ───────────────────────────────────────
      { key: 'maritalStatus',         label: 'Estado Civil',        required: false, example: 'Casado/a' },
      { key: 'housingType',           label: 'Tipo Vivienda',       required: false, example: 'Propia' },
      { key: 'spouseName',            label: 'Cónyuge',             required: false, example: 'Carlos Pérez' },
      { key: 'spouseMobile',          label: 'Tel. Cónyuge',        required: false, example: '0991234000' },
      { key: 'spouseOccupation',      label: 'Ocupación Cónyuge',   required: false, example: 'Ingeniero' },
      { key: 'numberOfChildren',      label: 'N° Hijos',            required: false, example: '2' },
      { key: 'childrenAges',          label: 'Edades Hijos',        required: false, example: '5, 8' },
    ];
    const dialogRef = this.dialog.open(BulkImportDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        entityName: 'Docentes',
        columns: TEACHER_BULK_COLUMNS,
        submitFn: (rows: Record<string, any>[]) => this.teachersService.bulkCreate(rows),
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.successCount > 0) this.loadData();
    });
  }

  exportExcel() {
    const exportData = this.dataSource.filteredData.map((x) => ({
      Name: x.name,
      Email: x.email,
      DNI: x.dni,
      Gender: x.gender,
      Mobile: x.mobile,
      'Área de Estudio': x.areaEstudio,
      'Dep. Laboral': x.laboralDependency,
      'Cat. Salarial': x.salarialCategory,
      'Contacto Emergencia': x.emergencyName,
      'Tel. Emergencia': x.emergencyMobile,
      Address: x.address,
      Specialization: x.subject_specialization,
      'Experience (Years)': x.experience_years,
      Status: x.status,
      Birthdate: x.birthdate ? formatDate(new Date(x.birthdate), 'yyyy-MM-dd', 'en') : '',
      Bio: x.bio,
    }));

    TableExportUtil.exportToExcel(exportData, 'staff_export');
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
    const selected = this.selection.selected;
    const ids = selected.map((t) => t.id as string);
    const dialogRef = this.dialog.open(TeachersDeleteComponent, {
      data: { ids },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const idSet = new Set(ids);
        this.dataSource.data = this.dataSource.data.filter((item) => !idSet.has(item.id as string));
        this.selection.clear();
        this.refreshTable();
        this.showNotification(
          'snackbar-danger',
          `${result.deleted ?? ids.length} registro(s) eliminado(s) correctamente`,
          'bottom',
          'center'
        );
      }
    });
  }
  onContextMenu(event: MouseEvent, item: Teachers) {
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
