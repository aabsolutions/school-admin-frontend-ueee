import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { environment } from '@environments/environment';

interface TeacherRow {
  _departmentId: string;
  dni: string;
  name: string;
  email: string;
  gender: string;
  birthdate: string;
  age: number;
  mobile: string;
  address: string;
  department: string;
  subjectSpecialization: string;
  experienceYears: number;
  laboralDependency: string;
  salarialCategory: string;
  status: string;
}

@Component({
  selector: 'app-directorio-docentes',
  templateUrl: './directorio-docentes.component.html',
  styleUrls: ['./directorio-docentes.component.scss'],
  imports: [
    CommonModule, FormsModule, DatePipe, BreadcrumbComponent, TableShowHideColumnComponent,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
})
export class DirectorioDocentesComponent implements OnInit {
  breadscrums = [{ title: 'Directorio de Docentes', items: ['Reportes'], active: 'Directorio de Docentes' }];

  // Filtros
  filterName              = '';
  filterGender            = '';
  filterStatus            = '';
  filterDepartment        = '';
  filterLaboralDependency = '';
  filterSalarialCategory  = '';
  filterAgeMin: number | null = null;
  filterAgeMax: number | null = null;
  filterExpMin: number | null = null;
  filterExpMax: number | null = null;

  readonly genderOptions   = ['Male', 'Female', 'Other'];
  readonly statusOptions   = ['active', 'inactive', 'on-leave'];
  readonly laboralOptions  = ['Contrato', 'Nomb. Definitivo', 'Nomb. Provisional'];
  readonly categoryOptions = ['A','B','C','D','E','F','G','H','I','J'];

  departments: { id: string; name: string }[] = [];
  private allTeachers: TeacherRow[] = [];
  loading     = true;
  hasSearched = false;
  today       = new Date();

  columnDefinitions = [
    { def: 'dni',                   label: 'Cédula',              type: 'text',   visible: true  },
    { def: 'name',                  label: 'Nombre',              type: 'text',   visible: true  },
    { def: 'email',                 label: 'Email',               type: 'text',   visible: false },
    { def: 'gender',                label: 'Género',              type: 'gender', visible: true  },
    { def: 'age',                   label: 'Edad',                type: 'number', visible: true  },
    { def: 'birthdate',             label: 'Fecha de Nac.',       type: 'date',   visible: false },
    { def: 'mobile',                label: 'Teléfono',            type: 'text',   visible: true  },
    { def: 'address',               label: 'Dirección',           type: 'text',   visible: false },
    { def: 'department',            label: 'Departamento',        type: 'text',   visible: true  },
    { def: 'subjectSpecialization', label: 'Especialización',     type: 'text',   visible: true  },
    { def: 'experienceYears',       label: 'Años de Exp.',        type: 'number', visible: true  },
    { def: 'laboralDependency',     label: 'Dependencia Laboral', type: 'text',   visible: false },
    { def: 'salarialCategory',      label: 'Cat. Salarial',       type: 'text',   visible: false },
    { def: 'status',                label: 'Estado',              type: 'status', visible: true  },
  ];

  dataSource = new MatTableDataSource<TeacherRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)      { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    forkJoin({
      teachers:    this.http.get<any>(`${environment.apiUrl}/teachers?limit=500`),
      departments: this.http.get<any>(`${environment.apiUrl}/departments?limit=100`),
    }).subscribe({
      next: ({ teachers, departments }) => {
        this.departments = (departments.data?.data ?? []).map((d: any) => ({
          id:   (d._id ?? d.id).toString(),
          name: d.departmentName,
        }));

        this.allTeachers = (teachers.data?.data ?? []).map((t: any) => ({
          _departmentId:        (t.departmentId?._id ?? t.departmentId?.id ?? '').toString(),
          dni:                  t.dni                    ?? '—',
          name:                 t.name                   ?? '—',
          email:                t.email                  ?? '—',
          gender:               t.gender                 ?? '—',
          birthdate:            t.birthdate              ?? '',
          age:                  t.birthdate ? this.calcAge(t.birthdate) : 0,
          mobile:               t.mobile                 ?? '—',
          address:              t.address                ?? '—',
          department:           t.departmentId?.departmentName ?? '—',
          subjectSpecialization:t.subjectSpecialization  ?? '—',
          experienceYears:      t.experienceYears        ?? 0,
          laboralDependency:    t.laboralDependency      ?? '—',
          salarialCategory:     t.salarialCategory       ?? '—',
          status:               t.status                 ?? '—',
        }));

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  buscar() {
    const name = this.filterName.trim().toLowerCase();

    this.dataSource.data = this.allTeachers.filter(t => {
      if (name && !t.name.toLowerCase().includes(name) && !t.email.toLowerCase().includes(name) && !t.dni.toLowerCase().includes(name)) return false;
      if (this.filterGender && t.gender !== this.filterGender) return false;
      if (this.filterStatus && t.status !== this.filterStatus) return false;
      if (this.filterDepartment && t._departmentId !== this.filterDepartment) return false;
      if (this.filterLaboralDependency && t.laboralDependency !== this.filterLaboralDependency) return false;
      if (this.filterSalarialCategory && t.salarialCategory !== this.filterSalarialCategory) return false;
      if (this.filterAgeMin !== null && t.age < this.filterAgeMin) return false;
      if (this.filterAgeMax !== null && t.age > this.filterAgeMax) return false;
      if (this.filterExpMin !== null && t.experienceYears < this.filterExpMin) return false;
      if (this.filterExpMax !== null && t.experienceYears > this.filterExpMax) return false;
      return true;
    });

    this.dataSource.data.sort((a, b) => a.name.localeCompare(b.name));
    this.hasSearched = true;
  }

  limpiar() {
    this.filterName              = '';
    this.filterGender            = '';
    this.filterStatus            = '';
    this.filterDepartment        = '';
    this.filterLaboralDependency = '';
    this.filterSalarialCategory  = '';
    this.filterAgeMin            = null;
    this.filterAgeMax            = null;
    this.filterExpMin            = null;
    this.filterExpMax            = null;
    this.dataSource.data         = [];
    this.hasSearched             = false;
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (row: TeacherRow, filter: string) =>
      Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
  }

  exportXls() {
    if (!this.dataSource.filteredData.length) return;
    const visibleCols = this.columnDefinitions.filter(c => c.visible);
    const data = this.dataSource.filteredData.map(t => {
      const row: Record<string, string> = {};
      visibleCols.forEach(col => {
        const val = (t as any)[col.def];
        row[col.label] = col.type === 'date' && val
          ? new Date(val).toLocaleDateString('es-EC')
          : (val ?? '');
      });
      return row;
    });
    TableExportUtil.exportToExcel(data, `directorio_docentes_${new Date().toISOString().slice(0, 10)}`);
  }

  exportPdf() { window.print(); }

  private calcAge(birthdate: string | Date): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
}
