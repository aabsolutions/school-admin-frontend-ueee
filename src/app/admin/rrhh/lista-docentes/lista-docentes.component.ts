import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { TeachersService } from '../../teachers/all-teachers/teachers.service';

interface TeacherRow {
  name: string;
  dni: string;
  gender: string;
  birthdate: string;
  age: number | string;
  laboralDependency: string;
  salarialCategory: string;
  mobile: string;
  department: string;
}

@Component({
  selector: 'app-lista-docentes',
  templateUrl: './lista-docentes.component.html',
  styleUrls: ['./lista-docentes.component.scss'],
  imports: [
    CommonModule, FormsModule, DatePipe, BreadcrumbComponent, TableShowHideColumnComponent,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class ListaDocentesComponent implements OnInit {
  breadscrums = [{ title: 'Lista de Docentes', items: ['Recursos Humanos'], active: 'Docentes' }];

  filterNombre        = '';
  filterGenero        = '';
  filterDependencia   = '';

  readonly generoOptions      = ['Male', 'Female', 'Other'];
  readonly dependenciaOptions = ['Contrato', 'Nomb. Definitivo', 'Nomb. Provisional'];

  private allTeachers: TeacherRow[] = [];
  isLoading = true;

  columnDefinitions = [
    { def: 'name',              label: 'Nombre',             type: 'text', visible: true  },
    { def: 'dni',               label: 'DNI',                type: 'text', visible: true  },
    { def: 'gender',            label: 'Género',             type: 'text', visible: true  },
    { def: 'birthdate',         label: 'Fecha de Nac.',      type: 'date', visible: true  },
    { def: 'age',               label: 'Edad',               type: 'text', visible: true  },
    { def: 'laboralDependency', label: 'Tipo Relación Lab.', type: 'text', visible: true  },
    { def: 'salarialCategory',  label: 'Cat. Salarial',      type: 'text', visible: true  },
    { def: 'mobile',            label: 'Celular',            type: 'text', visible: true  },
    { def: 'department',        label: 'Departamento',       type: 'text', visible: false },
  ];

  dataSource = new MatTableDataSource<TeacherRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)      { this.dataSource.sort      = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private teachersService: TeachersService) {}

  ngOnInit() {
    this.teachersService.getAllTeachers().subscribe({
      next: teachers => {
        this.allTeachers = teachers.map(t => ({
          name:              t.name              ?? '—',
          dni:               t.dni               ?? '—',
          gender:            t.gender            ?? '—',
          birthdate:         t.birthdate         ?? '',
          age:               this.calcAge(t.birthdate),
          laboralDependency: t.laboralDependency ?? '—',
          salarialCategory:  t.salarialCategory  ?? '—',
          mobile:            t.mobile            ?? '—',
          department:        t.department        ?? '—',
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  private calcAge(birthdate: any): number | string {
    if (!birthdate) return '—';
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  buscar() {
    this.applyFilters();
  }

  limpiar() {
    this.filterNombre      = '';
    this.filterGenero      = '';
    this.filterDependencia = '';
    this.applyFilters();
  }

  private applyFilters() {
    const nombre     = this.filterNombre.trim().toLowerCase();
    const genero     = this.filterGenero;
    const dependencia = this.filterDependencia;

    this.dataSource.data = this.allTeachers.filter(t =>
      (!nombre      || t.name.toLowerCase().includes(nombre))      &&
      (!genero      || t.gender === genero)                         &&
      (!dependencia || t.laboralDependency === dependencia)
    );

    this.dataSource.filterPredicate = (row: TeacherRow, filter: string) =>
      Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));
  }

  applySearch(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
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
    TableExportUtil.exportToExcel(data, 'rrhh_docentes');
  }

  exportPdf() { window.print(); }
}
