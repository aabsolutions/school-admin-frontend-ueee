import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DriveDocumento } from '../../expediente-academico.model';
import { ExpedienteAcademicoService } from '../../expediente-academico.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/service/auth.service';

export interface DocumentoDialogData {
  expedienteId: string;
  studentName: string;
  documento?: DriveDocumento;
  secciones: string[];
}

@Component({
  selector: 'app-documento-dialog',
  templateUrl: './documento-dialog.component.html',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatDialogContent, MatDialogClose,
    MatFormFieldModule, MatInputModule, MatOptionModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressBarModule,
    MatAutocompleteModule,
  ],
})
export class DocumentoDialogComponent {
  form: UntypedFormGroup;
  saving = false;
  newSeccion = '';

  get isEditMode() { return !!this.data.documento; }

  constructor(
    public dialogRef: MatDialogRef<DocumentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentoDialogData,
    private fb: UntypedFormBuilder,
    private svc: ExpedienteAcademicoService,
    private snackBar: MatSnackBar,
    authService: AuthService,
  ) {
    const doc = data.documento;
    const currentUser = authService.currentUserValue;
    const userName = currentUser?.name ?? 'Usuario';
    const roleName = currentUser?.roles?.[0]?.name ?? '';
    const userDisplay = roleName ? `${userName} (${roleName})` : userName;

    this.form = this.fb.group({
      seccion:     [doc?.seccion     ?? '', Validators.required],
      nombre:      [doc?.nombre      ?? '', Validators.required],
      url:         [doc?.url         ?? '', Validators.required],
      descripcion: [doc?.descripcion ?? ''],
      creadoPor:   [{ value: doc?.creadoPor ?? userDisplay, disabled: true }, Validators.required],
      fecha:       [doc?.fecha ? new Date(doc.fecha) : new Date(), Validators.required],
    });
  }

  submit() {
    if (!this.form.valid) return;
    this.saving = true;
    const { seccion, nombre, url, descripcion, creadoPor, fecha } = this.form.getRawValue();
    const payload = {
      seccion: seccion.trim(),
      nombre:  nombre.trim(),
      url:     url.trim(),
      descripcion: descripcion?.trim() ?? '',
      creadoPor,
      fecha: (fecha as Date).toISOString(),
    };

    const request$ = this.isEditMode
      ? this.svc.updateDocumento(this.data.expedienteId, this.data.documento!._id, payload)
      : this.svc.addDocumento(this.data.expedienteId, payload);

    request$.subscribe({
      next: (res) => { this.saving = false; this.dialogRef.close(res); },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.message || 'Error al guardar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onNoClick() { this.dialogRef.close(); }
}
