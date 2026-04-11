import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CursosService } from '../../cursos.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Curso } from '../../curso.model';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData { id: string | number; action: string; curso: Curso; }

@Component({
  selector: 'app-curso-form',
  templateUrl: './form-dialog.component.html',
  imports: [MatButtonModule, MatIconModule, MatDialogContent, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogClose],
})
export class CursoFormComponent {
  action: string;
  dialogTitle: string;
  cursoForm: UntypedFormGroup;
  curso: Curso;

  readonly nivelOptions   = ['8VO', '9NO', '10MO', '1RO BACH', '2DO BACH', '3RO BACH'];
  readonly jornadaOptions = ['Matutina', 'Vespertina', 'Nocturna'];
  readonly subnivelOptions = ['EGB Superior', 'Bachillerato General', 'Bachillerato Tecnico'];

  constructor(
    public dialogRef: MatDialogRef<CursoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public cursosService: CursosService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.curso = this.action === 'edit' ? data.curso : new Curso({});
    this.dialogTitle = this.action === 'edit'
      ? `${this.curso.nivel} - ${this.curso.especialidad} - ${this.curso.paralelo}`
      : 'Nuevo Curso';
    this.cursoForm = this.fb.group({
      id:           [this.curso.id],
      nivel:        [this.curso.nivel, [Validators.required]],
      especialidad: [this.curso.especialidad],
      paralelo:     [this.curso.paralelo, [Validators.required]],
      jornada:      [this.curso.jornada, [Validators.required]],
      subnivel:     [this.curso.subnivel, [Validators.required]],
      status:       [this.curso.status || 'active'],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'Este campo es requerido';
    return '';
  }

  submit() {
    if (this.cursoForm.valid) {
      const formData = this.cursoForm.getRawValue();
      const op$ = this.action === 'edit'
        ? this.cursosService.update(formData)
        : this.cursosService.add(formData);
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
