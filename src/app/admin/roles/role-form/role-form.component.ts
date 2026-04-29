import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RolesService } from '../roles.service';
import { RoleConfig } from '@core/models/role-config.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent implements OnInit {
  form!: FormGroup;
  isEdit: boolean;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RoleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: RoleConfig | null }
  ) {
    this.isEdit = !!data.role;
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [
        this.data.role?.name ?? '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z_]+$/),
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      displayName: [
        this.data.role?.displayName ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      description: [
        this.data.role?.description ?? '',
        Validators.maxLength(255),
      ],
    });

    if (this.isEdit && this.data.role?.isSystem) {
      this.form.get('name')?.disable();
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;

    const payload = this.form.getRawValue();

    const request = this.isEdit
      ? this.rolesService.update(this.data.role!._id, payload)
      : this.rolesService.create(payload);

    request.subscribe({
      next: (result) => {
        this.saving = false;
        this.dialogRef.close(result);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(
          err?.error?.message ?? 'Error al guardar',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }
}
