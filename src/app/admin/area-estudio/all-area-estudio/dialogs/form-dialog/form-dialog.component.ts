import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AreaEstudio } from '../../area-estudio.model';
import { AreaEstudioService } from '../../area-estudio.service';

export interface DialogData { action: string; area: AreaEstudio; }

@Component({
  selector: 'app-area-estudio-form',
  templateUrl: './form-dialog.component.html',
  imports: [
    MatButtonModule, MatIconModule, MatDialogContent, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogClose,
  ],
})
export class AreaEstudioFormComponent {
  action: string;
  dialogTitle: string;
  form: UntypedFormGroup;
  area: AreaEstudio;

  constructor(
    public dialogRef: MatDialogRef<AreaEstudioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private service: AreaEstudioService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.action = data.action;
    this.area = this.action === 'edit' ? data.area : new AreaEstudio();
    this.dialogTitle = this.action === 'edit' ? `Editar: ${this.area.nombre}` : 'Nueva Área de Estudio';
    this.form = this.fb.group({
      id:          [this.area.id],
      nombre:      [this.area.nombre, [Validators.required]],
      descripcion: [this.area.descripcion],
      isActive:    [this.area.isActive],
    });
  }

  submit(): void {
    if (this.form.valid) {
      const data = this.form.getRawValue();
      const op$ = this.action === 'edit' ? this.service.update(data) : this.service.add(data);
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
