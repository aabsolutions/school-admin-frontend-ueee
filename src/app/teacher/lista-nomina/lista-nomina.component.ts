import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TableExportUtil } from '@shared';
import { environment } from '@environments/environment';

interface StudentRow {
  dni: string;
  name: string;
  email: string;
  gender: string;
  birthdate: string | null;
  mobile: string;
}

@Component({
  selector: 'app-lista-nomina-teacher',
  templateUrl: './lista-nomina.component.html',
  styleUrls: ['./lista-nomina.component.scss'],
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent, TableShowHideColumnComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule, MatInputModule, MatFormFieldModule,
  ],
})
export class ListaNominaTeacherComponent implements OnInit {
  breadscrums = [{ title: 'Nómina de mi Curso', items: ['Docente'], active: 'Nómina de mi Curso' }];

  loading = true;
  esTutor = false;
  cursoLabel = '';

  columnDefinitions = [
    { def: 'dni',       label: 'Cédula',              type: 'text',   visible: true  },
    { def: 'name',      label: 'Apellidos y Nombres', type: 'text',   visible: true  },
    { def: 'email',     label: 'Email',               type: 'text',   visible: false },
    { def: 'gender',    label: 'Género',              type: 'gender', visible: true  },
    { def: 'birthdate', label: 'Fecha de Nac.',       type: 'date',   visible: true  },
    { def: 'mobile',    label: 'Contacto',            type: 'text',   visible: true  },
  ];

  dataSource = new MatTableDataSource<StudentRow>([]);

  @ViewChild(MatSort)      set matSort(s: MatSort)      { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/curso-lectivo/mi-tutor-alumnos`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        const cl   = data.cursoLectivo;

        if (!cl) {
          this.esTutor = false;
          this.loading = false;
          return;
        }

        this.esTutor = true;
        const c = cl.cursoId ?? {};
        const nivel        = c.nivel        ?? '';
        const especialidad = c.especialidad ? ` — ${c.especialidad}` : '';
        const paralelo     = c.paralelo     ? ` — Paralelo ${c.paralelo}` : '';
        const jornada      = c.jornada      ? ` | ${c.jornada}` : '';
        const year         = cl.academicYear ? ` · ${cl.academicYear}` : '';
        this.cursoLabel = `${nivel}${especialidad}${paralelo}${jornada}${year}`;

        this.dataSource.data = (data.estudiantes ?? []).map((s: StudentRow) => ({ ...s }));
        this.dataSource.filterPredicate = (row: StudentRow, filter: string) =>
          Object.values(row).some(v => v != null && v.toString().toLowerCase().includes(filter));

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(c => c.visible).map(c => c.def);
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  exportXls() {
    if (!this.dataSource.filteredData.length) return;
    const visibleCols = this.columnDefinitions.filter(c => c.visible);
    const data = this.dataSource.filteredData.map(s => {
      const row: Record<string, string> = {};
      visibleCols.forEach(col => {
        const val = (s as any)[col.def];
        row[col.label] = col.type === 'date' && val
          ? new Date(val).toLocaleDateString('es-EC')
          : (val ?? '');
      });
      return row;
    });
    const fileName = `nomina_${this.cursoLabel}`.replace(/[\s|·—]+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    TableExportUtil.exportToExcel(data, fileName);
  }

  exportPdf() { window.print(); }
}
