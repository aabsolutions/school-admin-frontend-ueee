import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Direction } from '@angular/cdk/bidi';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ViewChild } from '@angular/core';

import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CargaHorariaService, TeacherItem, AsignacionItem } from './carga-horaria.service';
import { CursoLectivoService } from '../curso-lectivo/all-curso-lectivo/curso-lectivo.service';
import { CursoLectivo } from '../curso-lectivo/all-curso-lectivo/curso-lectivo.model';
import { AsignarDialogComponent } from './dialogs/asignar-dialog/asignar-dialog.component';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';

@Component({
  selector: 'app-carga-horaria',
  templateUrl: './carga-horaria.component.html',
  styleUrls: ['./carga-horaria.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatAutocompleteModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTooltipModule, MatCardModule, MatChipsModule, MatDividerModule,
    BreadcrumbComponent, FeatherIconsComponent,
  ],
})
export class CargaHorariaComponent implements OnInit, OnDestroy {
  breadscrums = [{ title: 'Carga Horaria', items: ['Oferta Educativa'], active: 'Carga Horaria' }];

  // ── Docente selector ──────────────────────────────────────────────────────
  docenteCtrl      = new FormControl('');
  docenteOptions:  TeacherItem[] = [];
  selectedDocente: TeacherItem | null = null;
  isSearching      = false;

  // ── Tabla cursos lectivos ─────────────────────────────────────────────────
  displayedColumns = ['cursoDisplay', 'academicYear', 'status', 'materias', 'actions'];
  dataSource       = new MatTableDataSource<CursoLectivo>([]);
  isLoadingCursos  = true;

  // Mapa: cursoLectivoId → asignaciones cargadas
  asignacionesMap  = new Map<string, AsignacionItem[]>();
  loadingMapIds    = new Set<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(
    private cargaService: CargaHorariaService,
    private cursoLectivoService: CursoLectivoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCursosLectivos();
    this.setupDocenteSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCursosLectivos(): void {
    this.cursoLectivoService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoadingCursos = false;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => { this.isLoadingCursos = false; },
    });
  }

  private setupDocenteSearch(): void {
    this.docenteCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.length < 2 || this.selectedDocente?.name === value) {
          return of([]);
        }
        this.isSearching = true;
        return this.cargaService.searchDocentes(value as string);
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: (teachers) => {
        this.docenteOptions = teachers;
        this.isSearching = false;
      },
      error: () => { this.isSearching = false; },
    });
  }

  selectDocente(teacher: TeacherItem): void {
    this.selectedDocente = teacher;
    this.docenteCtrl.setValue(teacher.name, { emitEvent: false });
    this.docenteOptions = [];
    // Cargar asignaciones existentes para todos los cursos lectivos
    this.asignacionesMap.clear();
    this.dataSource.data.forEach(cl => this.loadAsignaciones(cl.id as string));
  }

  clearDocente(): void {
    this.selectedDocente = null;
    this.docenteCtrl.setValue('');
    this.asignacionesMap.clear();
  }

  private loadAsignaciones(cursoLectivoId: string): void {
    this.loadingMapIds.add(cursoLectivoId);
    this.cargaService.findByCursoLectivo(cursoLectivoId).subscribe({
      next: (items) => {
        this.asignacionesMap.set(cursoLectivoId, items);
        this.loadingMapIds.delete(cursoLectivoId);
      },
      error: () => { this.loadingMapIds.delete(cursoLectivoId); },
    });
  }

  getMateriasDelDocente(cursoLectivoId: string): string {
    const items = this.asignacionesMap.get(cursoLectivoId) ?? [];
    const propias = items.filter(a => {
      const did = (a.docenteId as any)?._id ?? (a.docenteId as any)?.id ?? a.docenteId;
      return did?.toString() === this.selectedDocente?._id?.toString()
          || did?.toString() === this.selectedDocente?.id?.toString();
    });
    if (propias.length === 0) return '—';
    return propias.map(a => (a.materiaId as any)?.nombre ?? '?').join(', ');
  }

  openAsignar(row: CursoLectivo): void {
    if (!this.selectedDocente) return;
    const varDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(AsignarDialogComponent, {
      width: '55vw', maxWidth: '680px',
      data: {
        cursoLectivoId: row.id as string,
        cursoDisplay:   row.cursoDisplay,
        academicYear:   row.academicYear,
        docenteId:      this.selectedDocente._id ?? this.selectedDocente.id,
        docenteName:    this.selectedDocente.name,
      },
      direction: varDirection, autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(saved => {
      if (saved) {
        this.loadAsignaciones(row.id as string);
        this.snackBar.open('Carga horaria actualizada', '', {
          duration: 3000, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  displayFn(t: TeacherItem | string): string {
    return typeof t === 'string' ? t : (t?.name ?? '');
  }
}
