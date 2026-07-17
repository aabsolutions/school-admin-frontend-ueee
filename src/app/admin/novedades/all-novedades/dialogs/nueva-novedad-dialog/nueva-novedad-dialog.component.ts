import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from '@core/service/auth.service';
import { NovedadesService } from '../../../novedades.service';
import { Novedad, NOVEDAD_TIPO_OPTIONS, novedadRequiresStudents } from '../../../novedad.model';

interface StudentPick {
  _id: string;
  name: string;
  dni?: string;
  mobile?: string;
}

interface CursoLectivoOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-nueva-novedad-dialog',
  templateUrl: './nueva-novedad-dialog.component.html',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatDialogContent, MatDialogClose,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatDatepickerModule, MatNativeDateModule, MatTableModule, MatCheckboxModule,
    MatProgressBarModule, MatChipsModule,
  ],
})
export class NuevaNovedadDialogComponent implements OnInit {
  form: UntypedFormGroup;
  readonly tipoOptions = NOVEDAD_TIPO_OPTIONS;

  cursosLectivos: CursoLectivoOption[] = [];

  studentSearchTerm = '';
  studentSearchResults: StudentPick[] = [];
  searchingStudents = false;
  private studentSearch$ = new Subject<string>();

  selection = new SelectionModel<string>(true, []);
  private selectedDetails = new Map<string, StudentPick>();

  selectedFiles: File[] = [];
  saving = false;

  displayedStudentColumns = ['select', 'name', 'dni', 'mobile'];

  get selectedStudents(): StudentPick[] {
    return Array.from(this.selectedDetails.values());
  }

  get requiresStudents(): boolean {
    return novedadRequiresStudents(this.form?.get('tipo')?.value ?? '');
  }

  get requiresCursoLectivo(): boolean {
    return this.form?.get('tipo')?.value === 'ProblemaAula';
  }

  get isValid(): boolean {
    if (!this.form.valid) return false;
    if (this.requiresStudents) return this.selection.selected.length > 0;
    if (this.requiresCursoLectivo) return !!this.form.get('cursoLectivoId')?.value;
    return false;
  }

  constructor(
    public dialogRef: MatDialogRef<NuevaNovedadDialogComponent>,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private svc: NovedadesService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
  ) {
    const currentUserName = this.auth.currentUserValue?.name ?? '';
    this.form = this.fb.group({
      tipo:           ['', Validators.required],
      fecha:          [new Date(), Validators.required],
      descripcion:    ['', Validators.required],
      cursoLectivoId: [''],
      creadoPor:      [{ value: currentUserName, disabled: true }, Validators.required],
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

    this.studentSearch$.pipe(debounceTime(350), distinctUntilChanged()).subscribe((term) => {
      this.runStudentSearch(term);
    });

    this.form.get('tipo')!.valueChanges.subscribe(() => {
      // Reset the fields that don't apply to the newly selected tipo
      this.form.patchValue({ cursoLectivoId: '' }, { emitEvent: false });
      this.selection.clear();
      this.selectedDetails.clear();
      this.studentSearchResults = [];
      this.studentSearchTerm = '';
    });
  }

  onStudentSearch(term: string) {
    this.studentSearchTerm = term;
    this.studentSearch$.next(term);
  }

  private runStudentSearch(term: string) {
    if (!term || term.trim().length < 2) {
      this.studentSearchResults = [];
      return;
    }
    this.searchingStudents = true;
    const params = new HttpParams().set('search', term.trim()).set('limit', '20').set('status', 'active');
    this.http.get<any>(`${environment.apiUrl}/students`, { params }).subscribe({
      next: (r) => {
        this.studentSearchResults = (r.data?.data ?? []).map((s: any) => ({
          _id: s._id ?? s.id,
          name: s.name,
          dni: s.dni,
          mobile: s.mobile,
        }));
        this.searchingStudents = false;
      },
      error: () => { this.searchingStudents = false; this.studentSearchResults = []; },
    });
  }

  isAllVisibleSelected(): boolean {
    return this.studentSearchResults.length > 0 &&
      this.studentSearchResults.every((s) => this.selection.isSelected(s._id));
  }

  isSomeVisibleSelected(): boolean {
    return this.studentSearchResults.some((s) => this.selection.isSelected(s._id)) && !this.isAllVisibleSelected();
  }

  toggleAllVisible() {
    if (this.isAllVisibleSelected()) {
      this.studentSearchResults.forEach((s) => this.toggleStudent(s, false));
    } else {
      this.studentSearchResults.forEach((s) => this.toggleStudent(s, true));
    }
  }

  toggleStudent(student: StudentPick, forceState?: boolean) {
    const shouldSelect = forceState ?? !this.selection.isSelected(student._id);
    if (shouldSelect) {
      this.selection.select(student._id);
      this.selectedDetails.set(student._id, student);
    } else {
      this.selection.deselect(student._id);
      this.selectedDetails.delete(student._id);
    }
  }

  removeSelected(id: string) {
    this.selection.deselect(id);
    this.selectedDetails.delete(id);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.selectedFiles = [...this.selectedFiles, ...Array.from(input.files)];
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  submit() {
    if (!this.isValid) return;
    this.saving = true;
    const { tipo, fecha, descripcion, cursoLectivoId, creadoPor } = this.form.getRawValue();

    this.svc.create({
      tipo,
      fecha: (fecha as Date).toISOString(),
      descripcion,
      creadoPor,
      studentIds: this.requiresStudents ? this.selection.selected : undefined,
      cursoLectivoId: this.requiresCursoLectivo ? cursoLectivoId : undefined,
      files: this.selectedFiles,
    }).subscribe({
      next: (res: Novedad) => { this.saving = false; this.dialogRef.close(res); },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.message || 'Error al guardar la novedad', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onNoClick() { this.dialogRef.close(); }
}
