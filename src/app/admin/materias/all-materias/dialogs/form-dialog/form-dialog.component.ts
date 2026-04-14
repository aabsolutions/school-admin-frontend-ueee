import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MateriasService } from '../../materias.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Materia } from '../../materia.model';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData { id: string | number; action: string; materia: Materia; }

@Component({
  selector: 'app-materia-form',
  templateUrl: './form-dialog.component.html',
  imports: [MatButtonModule, MatIconModule, MatDialogContent, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogClose],
})
export class MateriaFormComponent {
  action: string;
  dialogTitle: string;
  materiaForm: UntypedFormGroup;
  materia: Materia;

  constructor(
    public dialogRef: MatDialogRef<MateriaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public materiasService: MateriasService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.materia = this.action === 'edit' ? data.materia : new Materia({});
    this.dialogTitle = this.action === 'edit' ? `Editar: ${this.materia.nombre}` : 'Nueva Materia';
    this.materiaForm = this.fb.group({
      id:          [this.materia.id],
      nombre:      [this.materia.nombre, [Validators.required]],
      codigo:      [this.materia.codigo],
      descripcion: [this.materia.descripcion],
      status:      [this.materia.status || 'active'],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'Este campo es requerido';
    return '';
  }

  submit() {
    if (this.materiaForm.valid) {
      const formData = this.materiaForm.getRawValue();
      const op$ = this.action === 'edit'
        ? this.materiasService.update(formData)
        : this.materiasService.add(formData);
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
