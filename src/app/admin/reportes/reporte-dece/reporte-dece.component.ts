import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { environment } from '@environments/environment';
import { DECE_TIPO_OPTIONS } from '../../dece/all-dece/dece.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

interface ReporteRow {
  studentName: string;
  studentDni: string;
  studentMobile: string;
  studentAddress: string;
  parentGuardianName: string;
  parentGuardianMobile: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  creadoPor: string;
  evidencias: number;
}

interface StudentOption {
  _id: string;
  name: string;
  dni: string;
}

@Component({
  selector: 'app-reporte-dece',
  templateUrl: './reporte-dece.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule,
    MatAutocompleteModule, TableShowHideColumnComponent,
  ],
})
export class ReporteDeceComponent implements OnInit, OnDestroy {
  breadscrums = [{ title: 'Reporte DECE', items: ['Reportes'], active: 'Atención Psicológica DECE' }];

  readonly tipoOptions = DECE_TIPO_OPTIONS;

  filterTipo = '';
  filterCreadoPor = '';
  filterDesde: Date | null = null;
  filterHasta: Date | null = null;
  filterStudent = '';
  selectedStudentId = '';
  filteredStudents: StudentOption[] = [];
  searchingStudents = false;

  private studentSearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  allData: ReporteRow[] = [];
  dataSource = new MatTableDataSource<ReporteRow>([]);

  columnDefinitions = [
    { def: 'studentName',          label: 'Estudiante',            visible: true },
    { def: 'studentDni',           label: 'Cédula',                visible: true },
    { def: 'studentMobile',        label: 'Celular',               visible: true },
    { def: 'tipo',                 label: 'Tipo',                  visible: true },
    { def: 'fecha',                label: 'Fecha',                 visible: true },
    { def: 'descripcion',          label: 'Descripción',           visible: true },
    { def: 'creadoPor',            label: 'Registrado por',        visible: true },
    { def: 'evidencias',           label: 'Evidencias',            visible: true },
    { def: 'studentAddress',       label: 'Dirección',             visible: false },
    { def: 'parentGuardianName',   label: 'Representante',         visible: false },
    { def: 'parentGuardianMobile', label: 'Celular Representante', visible: false },
  ];

  loading = false;
  hasSearched = false;

  @ViewChild(MatSort) set matSort(s: MatSort) { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.studentSearch$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        if (!term || term.length < 2) {
          this.filteredStudents = [];
          this.searchingStudents = false;
          return [];
        }
        this.searchingStudents = true;
        const params = new HttpParams().set('search', term).set('limit', '15');
        return this.http.get<any>(`${environment.apiUrl}/students`, { params });
      }),
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.filteredStudents = (res.data?.data ?? []).map((s: any) => ({
          _id: s._id,
          name: s.name,
          dni: s.dni ?? '',
        }));
        this.searchingStudents = false;
      },
      error: () => { this.searchingStudents = false; },
    });

    this.generar();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  }

  onStudentInput(term: string | StudentOption) {
    if (typeof term !== 'string') return; // autocomplete selection triggers this with the object
    this.selectedStudentId = '';
    this.studentSearch$.next(term);
    this.filtrar();
  }

  onStudentSelected(student: StudentOption) {
    this.selectedStudentId = student._id;
    this.filterStudent = student.name;
    this.filteredStudents = [];
    this.filtrar();
  }

  onStudentCleared() {
    this.selectedStudentId = '';
    this.filterStudent = '';
    this.filteredStudents = [];
    this.filtrar();
  }

  displayStudent(student: StudentOption): string {
    return student ? `${student.name} — ${student.dni}` : '';
  }

  generar() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/dece/reporte`).subscribe({
      next: (res) => {
        this.allData = (res.data ?? []).map((r: any) => ({
          studentName:          r.studentName          ?? '—',
          studentDni:           r.studentDni           ?? '—',
          studentMobile:        r.studentMobile        ?? '—',
          studentAddress:       r.studentAddress       ?? '—',
          parentGuardianName:   r.parentGuardianName   ?? '—',
          parentGuardianMobile: r.parentGuardianMobile ?? '—',
          tipo:                 r.tipo                 ?? '—',
          fecha:                r.fecha                ?? '',
          descripcion:          r.descripcion          ?? '—',
          creadoPor:            r.creadoPor            ?? '—',
          evidencias:           (r.evidencias ?? []).length,
        }));
        this.loading = false;
        this.hasSearched = true;
        this.filtrar();
      },
      error: () => { this.loading = false; },
    });
  }

  filtrar() {
    this.dataSource.data = this.allData.filter(r => {
      if (this.filterTipo && r.tipo !== this.filterTipo) return false;
      if (this.filterCreadoPor && !r.creadoPor.toLowerCase().includes(this.filterCreadoPor.toLowerCase())) return false;
      if (this.filterStudent) {
        const term = (typeof this.filterStudent === 'string' ? this.filterStudent : (this.filterStudent as any).name ?? '').toLowerCase();
        if (term && !r.studentName.toLowerCase().includes(term) && !r.studentDni.toLowerCase().includes(term)) return false;
      }
      if (this.filterDesde) {
        const fecha = new Date(r.fecha);
        if (fecha < this.filterDesde) return false;
      }
      if (this.filterHasta) {
        const fecha = new Date(r.fecha);
        const hasta = new Date(this.filterHasta);
        hasta.setHours(23, 59, 59);
        if (fecha > hasta) return false;
      }
      return true;
    });
  }

  limpiar() {
    this.filterTipo = '';
    this.filterCreadoPor = '';
    this.filterDesde = null;
    this.filterHasta = null;
    this.filterStudent = '';
    this.selectedStudentId = '';
    this.filteredStudents = [];
    this.filtrar();
  }

  exportXls() {
    const visibleCols = this.columnDefinitions.filter(cd => cd.visible);
    const headers = visibleCols.map(cd => cd.label);
    const rows = this.dataSource.filteredData.map(row =>
      visibleCols.map(cd => {
        const val = (row as any)[cd.def];
        if (cd.def === 'fecha' && val) {
          return new Date(val).toLocaleDateString('es-EC');
        }
        return val ?? '';
      })
    );

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DECE');
    XLSX.writeFile(wb, `reporte-dece-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  exportPdf() { window.print(); }
}
