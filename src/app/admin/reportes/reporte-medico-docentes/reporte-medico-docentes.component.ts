import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
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
import { environment } from '@environments/environment';
import * as XLSX from 'xlsx';

interface ReporteRow {
  name: string;
  dni: string;
  mobile: string;
  bloodType: string;
  hasDisability: boolean;
  disabilityDetail: string;
  hasConadis: boolean;
  hasAllergies: boolean;
  allergiesDetail: string;
  hasChronicCondition: boolean;
  chronicConditionDetail: string;
  currentMedications: string;
  healthInsurance: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  maritalStatus: string;
  numberOfChildren: number;
  housingType: string;
}

@Component({
  selector: 'app-reporte-medico-docentes',
  templateUrl: './reporte-medico-docentes.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule,
    TableShowHideColumnComponent,
  ],
})
export class ReporteMedicoDocentesComponent implements OnInit {
  breadscrums = [{ title: 'Reporte Médico', items: ['Reportes'], active: 'Ficha Médica Docentes' }];

  // Filtros
  filterHasDisability = '';
  filterHasAllergies = '';
  filterHasChronicCondition = '';
  filterHasConadis = '';
  filterBloodType = '';
  filterMaritalStatus = '';
  filterNumberOfChildren = '';

  readonly bloodTypeOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly maritalStatusOptions = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  readonly boolOptions = [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }];

  columnDefinitions = [
    { def: 'name',                  label: 'Docente',             visible: true },
    { def: 'dni',                   label: 'Cédula',              visible: true },
    { def: 'mobile',                label: 'Celular',             visible: true },
    { def: 'bloodType',             label: 'Tipo de sangre',      visible: true },
    { def: 'hasDisability',         label: 'Discapacidad',        visible: true },
    { def: 'hasConadis',            label: 'CONADIS',             visible: true },
    { def: 'hasAllergies',          label: 'Alergias',            visible: true },
    { def: 'hasChronicCondition',   label: 'Enf. Crónica',        visible: true },
    { def: 'healthInsurance',       label: 'Seguro',              visible: true },
    { def: 'maritalStatus',         label: 'Estado Civil',        visible: true },
    { def: 'numberOfChildren',      label: 'Hijos',               visible: true },
    { def: 'housingType',           label: 'Vivienda',            visible: false },
    { def: 'disabilityDetail',      label: 'Det. Discapacidad',   visible: false },
    { def: 'allergiesDetail',       label: 'Det. Alergias',       visible: false },
    { def: 'chronicConditionDetail',label: 'Det. Enf. Crónica',   visible: false },
    { def: 'currentMedications',    label: 'Medicamentos',        visible: false },
    { def: 'emergencyContactName',  label: 'Contacto Emergencia', visible: false },
    { def: 'emergencyContactPhone', label: 'Tel. Emergencia',     visible: false },
  ];

  loading = false;
  hasSearched = false;
  dataSource = new MatTableDataSource<ReporteRow>([]);

  @ViewChild(MatSort) set matSort(s: MatSort) { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  }

  generar() {
    this.loading = true;
    let params = new HttpParams();
    if (this.filterHasDisability)       params = params.set('hasDisability', this.filterHasDisability);
    if (this.filterHasAllergies)        params = params.set('hasAllergies', this.filterHasAllergies);
    if (this.filterHasChronicCondition) params = params.set('hasChronicCondition', this.filterHasChronicCondition);
    if (this.filterHasConadis)          params = params.set('hasConadis', this.filterHasConadis);
    if (this.filterBloodType)           params = params.set('bloodType', this.filterBloodType);
    if (this.filterMaritalStatus)       params = params.set('maritalStatus', this.filterMaritalStatus);
    if (this.filterNumberOfChildren !== '') params = params.set('numberOfChildren', this.filterNumberOfChildren);

    this.http.get<any>(`${environment.apiUrl}/teachers/reporte-medico`, { params }).subscribe({
      next: (res) => {
        const list = res.data ?? res;
        this.dataSource.data = (Array.isArray(list) ? list : []).map((t: any) => ({
          name:                   t.name                        ?? '—',
          dni:                    t.dni                         ?? '—',
          mobile:                 t.mobile                      ?? '—',
          bloodType:              t.medicalInfo?.bloodType       ?? '—',
          hasDisability:          t.medicalInfo?.hasDisability   ?? false,
          disabilityDetail:       t.medicalInfo?.disabilityDetail ?? '—',
          hasConadis:             t.medicalInfo?.hasConadis      ?? false,
          hasAllergies:           t.medicalInfo?.hasAllergies    ?? false,
          allergiesDetail:        t.medicalInfo?.allergiesDetail ?? '—',
          hasChronicCondition:    t.medicalInfo?.hasChronicCondition ?? false,
          chronicConditionDetail: t.medicalInfo?.chronicConditionDetail ?? '—',
          currentMedications:     t.medicalInfo?.currentMedications ?? '—',
          healthInsurance:        t.medicalInfo?.healthInsurance  ?? '—',
          emergencyContactName:   t.medicalInfo?.emergencyContactName  ?? '—',
          emergencyContactPhone:  t.medicalInfo?.emergencyContactPhone ?? '—',
          maritalStatus:          t.familyInfo?.maritalStatus     ?? '—',
          numberOfChildren:       t.familyInfo?.numberOfChildren  ?? 0,
          housingType:            t.familyInfo?.housingType        ?? '—',
        }));
        this.loading = false;
        this.hasSearched = true;
      },
      error: () => { this.loading = false; },
    });
  }

  limpiar() {
    this.filterHasDisability = '';
    this.filterHasAllergies = '';
    this.filterHasChronicCondition = '';
    this.filterHasConadis = '';
    this.filterBloodType = '';
    this.filterMaritalStatus = '';
    this.filterNumberOfChildren = '';
    this.generar();
  }

  exportXls() {
    const visibleCols = this.columnDefinitions.filter(cd => cd.visible);
    const headers = visibleCols.map(cd => cd.label);
    const rows = this.dataSource.filteredData.map(row =>
      visibleCols.map(cd => {
        const val = (row as any)[cd.def];
        if (typeof val === 'boolean') return val ? 'Sí' : 'No';
        return val ?? '';
      })
    );
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Médico Docentes');
    XLSX.writeFile(wb, `reporte-medico-docentes-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  exportPdf() { window.print(); }
}
