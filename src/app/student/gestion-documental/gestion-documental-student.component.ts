import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';

interface ApiOne<T> { data: T }

interface DocumentalEstudiante {
  _id: string;
  nivelActual: string | null;
  boleta2do: boolean;
  boleta3ro: boolean;
  boleta4to: boolean;
  boleta5to: boolean;
  boleta6to: boolean;
  boleta7mo: boolean;
  boleta8vo: boolean;
  boleta9no: boolean;
  boleta10mo: boolean;
  boleta1roBach: boolean;
  boleta2doBach: boolean;
  copiaCedulaEstudiante: boolean;
  copiaCedulaRepresentante: boolean;
  certificadoParticipacion: boolean;
  notas?: string;
}

interface DocRow {
  label: string;
  campo: keyof DocumentalEstudiante;
  opcional: boolean;
  solobach: boolean;
}

const NIVEL_BACH = ['1RO BACH', '2DO BACH', '3RO BACH'];
const API = `${environment.apiUrl}/documental-estudiante`;

const DOCS: DocRow[] = [
  { label: '2do Grado',  campo: 'boleta2do', opcional: true,  solobach: false },
  { label: '3ro Grado',  campo: 'boleta3ro', opcional: true,  solobach: false },
  { label: '4to Grado',  campo: 'boleta4to', opcional: true,  solobach: false },
  { label: '5to Grado',  campo: 'boleta5to', opcional: false, solobach: false },
  { label: '6to Grado',  campo: 'boleta6to', opcional: false, solobach: false },
  { label: '7mo Grado',  campo: 'boleta7mo', opcional: false, solobach: false },
  { label: '8vo Año EGB', campo: 'boleta8vo', opcional: false, solobach: false },
  { label: '9no Año EGB', campo: 'boleta9no', opcional: false, solobach: false },
  { label: '10mo Año EGB', campo: 'boleta10mo', opcional: false, solobach: false },
  { label: '1ro Bachillerato', campo: 'boleta1roBach', opcional: false, solobach: false },
  { label: '2do Bachillerato', campo: 'boleta2doBach', opcional: false, solobach: false },
  { label: 'Copia de cédula del estudiante', campo: 'copiaCedulaEstudiante', opcional: false, solobach: false },
  { label: 'Copia de cédula del representante', campo: 'copiaCedulaRepresentante', opcional: false, solobach: false },
  { label: 'Certificado de participación estudiantil', campo: 'certificadoParticipacion', opcional: false, solobach: true },
];

export interface TableRow {
  label: string;
  tipo: string;
  entregado: boolean;
}

@Component({
  selector: 'app-gestion-documental-student',
  templateUrl: './gestion-documental-student.component.html',
  imports: [
    CommonModule, BreadcrumbComponent,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatChipsModule, MatDividerModule, MatSnackBarModule,
  ],
})
export class GestionDocumentalStudentComponent implements OnInit {
  breadscrums = [{ title: 'Mis Documentos', items: ['Estudiante'], active: 'Expediente Académico' }];

  loading = false;
  record: DocumentalEstudiante | null = null;
  displayedColumns = ['label', 'tipo', 'estado'];
  dataSource = new MatTableDataSource<TableRow>([]);

  get isBach(): boolean {
    return !!this.record?.nivelActual && NIVEL_BACH.includes(this.record.nivelActual);
  }

  get entregados(): number {
    return this.dataSource.data.filter(r => r.entregado).length;
  }

  get totalObligatorios(): number {
    return this.dataSource.data.filter(r => r.tipo !== 'Opcional').length;
  }

  get pendientesObligatorios(): number {
    return this.dataSource.data.filter(r => r.tipo !== 'Opcional' && !r.entregado).length;
  }

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<ApiOne<DocumentalEstudiante>>(`${API}/me`).pipe(map(r => r.data)).subscribe({
      next: record => {
        this.record = record;
        this.buildTable(record);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar tu expediente documental', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  private buildTable(record: DocumentalEstudiante) {
    const rows: TableRow[] = [];
    for (const doc of DOCS) {
      if (doc.solobach && !NIVEL_BACH.includes(record.nivelActual ?? '')) continue;
      rows.push({
        label: doc.label,
        tipo: doc.opcional ? 'Opcional' : 'Obligatorio',
        entregado: !!(record[doc.campo]),
      });
    }
    this.dataSource.data = rows;
  }
}
