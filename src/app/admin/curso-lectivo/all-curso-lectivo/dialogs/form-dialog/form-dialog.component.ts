import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { CursoLectivoService } from '../../curso-lectivo.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CursoLectivo } from '../../curso-lectivo.model';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { environment } from '@environments/environment';

export interface DialogData { id: string | number; action: string; cursoLectivo: CursoLectivo; }

@Component({
  selector: 'app-curso-lectivo-form',
  templateUrl: './form-dialog.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogContent, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogClose],
})
export class CursoLectivoFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  clForm: UntypedFormGroup;
  cursoLectivo: CursoLectivo;

  cursos: { id: string; display: string }[] = [];
  teachers: { id: string; name: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<CursoLectivoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: CursoLectivoService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.cursoLectivo = this.action === 'edit' ? data.cursoLectivo : new CursoLectivo({});
    this.dialogTitle = this.action === 'edit'
      ? `${this.cursoLectivo.cursoDisplay} — ${this.cursoLectivo.academicYear}`
      : 'Nuevo Año Lectivo';
    this.clForm = this.fb.group({
      id:           [this.cursoLectivo.id],
      cursoId:      [this.cursoLectivo.cursoId, [Validators.required]],
      academicYear: [this.cursoLectivo.academicYear, [Validators.required]],
      tutorId:      [this.cursoLectivo.tutorId],
      inspectorId:  [this.cursoLectivo.inspectorId],
      psicologoId:  [this.cursoLectivo.psicologoId],
      status:       [this.cursoLectivo.status || 'active'],
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/cursos?limit=200`).subscribe({
      next: r => this.cursos = r.data.data.map((c: any) => ({
        id: c._id ?? c.id,
        display: `${c.nivel} - ${c.especialidad} - ${c.paralelo} - ${c.jornada}`,
      })),
    });
    this.http.get<any>(`${environment.apiUrl}/teachers?limit=200`).subscribe({
      next: r => this.teachers = r.data.data.map((t: any) => ({
        id: t._id ?? t.id,
        name: t.name,
      })),
    });
  }

  submit() {
    if (this.clForm.valid) {
      const formData = this.clForm.getRawValue();
      const op$ = this.action === 'edit'
        ? this.service.update(formData)
        : this.service.add(formData);
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
