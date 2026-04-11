import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { EnrollmentService } from '../../enrollment.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Enrollment } from '../../enrollment.model';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { environment } from '@environments/environment';

export interface DialogData { id: number; action: string; enrollment: Enrollment; }

@Component({
  selector: 'app-enrollment-form',
  templateUrl: './form-dialog.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogContent, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatOptionModule, MatAutocompleteModule, MatDialogClose],
})
export class EnrollmentFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  enrollmentForm: UntypedFormGroup;
  enrollment: Enrollment;

  // Autocomplete de estudiantes
  studentSearch = new UntypedFormControl('');
  private allStudents: { id: string; label: string }[] = [];
  filteredStudents: { id: string; label: string }[] = [];

  cursosLectivos: { id: string; label: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<EnrollmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public enrollmentService: EnrollmentService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.enrollment = this.action === 'edit' ? data.enrollment : new Enrollment({});
    this.dialogTitle = this.action === 'edit'
      ? `${this.enrollment.studentName} — ${this.enrollment.cursoDisplay}`
      : 'Nueva Matrícula';
    this.enrollmentForm = this.fb.group({
      id:             [this.enrollment.id],
      studentId:      [this.enrollment.studentId, this.action === 'add' ? [Validators.required] : []],
      cursoLectivoId: [this.enrollment.cursoLectivoId, this.action === 'add' ? [Validators.required] : []],
      status:         [this.enrollment.status || 'enrolled'],
      notes:          [this.enrollment.notes],
    });
  }

  ngOnInit() {
    if (this.action === 'add') {
      this.http.get<any>(`${environment.apiUrl}/students?limit=500`).subscribe({
        next: r => {
          this.allStudents = r.data.data.map((s: any) => ({
            id: s._id ?? s.id,
            label: `${s.name}${s.dni ? ' — ' + s.dni : ''}`,
          }));
          this.filteredStudents = this.allStudents;
        },
      });

      this.http.get<any>(`${environment.apiUrl}/curso-lectivo?limit=200&status=active`).subscribe({
        next: r => this.cursosLectivos = r.data.data.map((cl: any) => {
          const c = cl.cursoId;
          const display = c ? `${c.nivel} - ${c.especialidad} - ${c.paralelo} - ${c.jornada}` : cl._id;
          return { id: cl._id ?? cl.id, label: `${display} (${cl.academicYear})` };
        }),
      });

      // Filtrar lista a medida que el usuario tipea
      this.studentSearch.valueChanges.subscribe(val => {
        const term = (val ?? '').toLowerCase();
        this.filteredStudents = term
          ? this.allStudents.filter(s => s.label.toLowerCase().includes(term))
          : this.allStudents;
        // Si el usuario borra el texto, limpiar el id seleccionado
        if (!val) this.enrollmentForm.patchValue({ studentId: '' });
      });
    }
  }

  selectStudent(student: { id: string; label: string }) {
    this.enrollmentForm.patchValue({ studentId: student.id });
    this.studentSearch.setValue(student.label, { emitEvent: false });
  }

  submit() {
    if (this.enrollmentForm.valid) {
      const formData = this.enrollmentForm.getRawValue();
      const op$ = this.action === 'edit'
        ? this.enrollmentService.update(formData)
        : this.enrollmentService.add(formData);
      op$.subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.snackBar.open(err.message || 'Error al guardar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        }),
      });
    }
  }

  onNoClick(): void { this.dialogRef.close(); }
}
