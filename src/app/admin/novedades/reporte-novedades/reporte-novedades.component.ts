import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '@environments/environment';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { NovedadesService } from '../novedades.service';
import { Novedad, NOVEDAD_TIPO_OPTIONS, getTipoConfig, cursoLectivoDisplay } from '../novedad.model';
import { NovedadDetailDialogComponent } from '../all-novedades/dialogs/detail-dialog/novedad-detail-dialog.component';

interface CursoLectivoOption { id: string; label: string; }
interface StudentOption { id: string; label: string; }

@Component({
  selector: 'app-reporte-novedades',
  templateUrl: './reporte-novedades.component.html',
  styleUrls: ['./reporte-novedades.component.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatNativeDateModule, MatDatepickerModule,
    MatAutocompleteModule, MatTableModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class ReporteNovedadesComponent implements OnInit {
  breadscrums = [{ title: 'Novedades', items: ['Reporte'], active: 'Reporte' }];

  readonly tipoOptions = NOVEDAD_TIPO_OPTIONS;
  readonly getTipoConfig = getTipoConfig;
  readonly cursoDisplay = cursoLectivoDisplay;

  filterForm: UntypedFormGroup;
  cursosLectivos: CursoLectivoOption[] = [];

  studentSearch = new UntypedFormControl('');
  studentOptions: StudentOption[] = [];
  selectedStudentId: string | null = null;

  displayedColumns = ['tipo', 'involucrados', 'fecha', 'descripcion', 'creadoPor', 'actions'];
  results: Novedad[] = [];
  loading = false;
  searched = false;

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private svc: NovedadesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.filterForm = this.fb.group({
      tipo: [''],
      fechaDesde: [null],
      fechaHasta: [null],
      cursoLectivoId: [''],
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/curso-lectivo?limit=500&status=active`).subscribe({
      next: (r) => {
        this.cursosLectivos = r.data.data.map((cl: any) => {
          const c = cl.cursoId;
          const display = c
            ? [c.nivel, c.subnivel, c.especialidad, c.paralelo, c.jornada].filter(Boolean).join(' - ')
            : cl._id;
          return { id: cl._id ?? cl.id, label: `${display} (${cl.academicYear})` };
        }).sort((a: CursoLectivoOption, b: CursoLectivoOption) => a.label.localeCompare(b.label));
      },
    });

    this.studentSearch.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe((val) => {
      // Clear a previously selected student when the user edits the free-text search again
      this.selectedStudentId = null;
      if (typeof val !== 'string' || val.trim().length < 2) {
        this.studentOptions = [];
        return;
      }
      const params = new HttpParams().set('search', val.trim()).set('limit', '20').set('status', 'active');
      this.http.get<any>(`${environment.apiUrl}/students`, { params }).subscribe({
        next: (r) => {
          this.studentOptions = (r.data?.data ?? []).map((s: any) => ({
            id: s._id ?? s.id,
            label: `${s.name}${s.dni ? ' — ' + s.dni : ''}`,
          }));
        },
        error: () => { this.studentOptions = []; },
      });
    });
  }

  selectStudent(option: StudentOption) {
    this.selectedStudentId = option.id;
    this.studentSearch.setValue(option.label, { emitEvent: false });
  }

  clearStudent() {
    this.selectedStudentId = null;
    this.studentSearch.setValue('', { emitEvent: false });
    this.studentOptions = [];
  }

  buscar() {
    const { tipo, fechaDesde, fechaHasta, cursoLectivoId } = this.filterForm.value;
    this.loading = true;
    this.searched = true;
    this.svc.getReporte({
      tipo: tipo || undefined,
      fechaDesde: fechaDesde ? (fechaDesde as Date).toISOString() : undefined,
      fechaHasta: fechaHasta ? (fechaHasta as Date).toISOString() : undefined,
      cursoLectivoId: cursoLectivoId || undefined,
      studentId: this.selectedStudentId || undefined,
    }).subscribe({
      next: (data) => { this.results = data; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err?.message || 'Error al generar el reporte', '', {
          duration: 5000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  limpiarFiltros() {
    this.filterForm.reset({ tipo: '', fechaDesde: null, fechaHasta: null, cursoLectivoId: '' });
    this.clearStudent();
    this.results = [];
    this.searched = false;
  }

  involucradosLabel(n: Novedad): string {
    if (n.tipo === 'ProblemaAula') return this.cursoDisplay(n.cursoLectivoId);
    return n.studentIds?.length ? n.studentIds.map((s) => s.name).join(', ') : '—';
  }

  verDetalle(novedad: Novedad) {
    this.dialog.open(NovedadDetailDialogComponent, {
      width: '700px', maxWidth: '95vw', maxHeight: '90vh', autoFocus: false,
      data: { novedad },
    });
  }
}
