import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef, MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParentsApiService } from '../../../admin/parents/parents-api.service';

@Component({
  selector: 'app-add-parent-inline-dialog',
  template: `
    <h2 mat-dialog-title>Dar de alta padre / representante</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="mt-2">
        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Nombre completo *</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Email *</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>DNI / Cédula</mat-label>
          <input matInput formControlName="dni">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Celular</mat-label>
          <input matInput formControlName="mobile">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid || isSaving"
        (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AddParentInlineDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(ParentsApiService);
  private dialogRef = inject(MatDialogRef<AddParentInlineDialogComponent>);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    name:   ['', Validators.required],
    email:  ['', [Validators.required, Validators.email]],
    dni:    [''],
    mobile: [''],
  });
  isSaving = false;

  save() {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;
    this.api.create(this.form.value).subscribe({
      next: (p) => {
        this.dialogRef.close({ _id: p._id, name: p.name, email: p.email, dni: p.dni });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Error al registrar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }
}
