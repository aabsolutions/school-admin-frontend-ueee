import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { AppUser } from '../../user.model';
import { UserService } from '../../user.service';
import { RolesService } from '../../../../roles/roles.service';
import { RoleConfig } from '@core/models/role-config.model';

export interface UserDialogData {
  action: 'add' | 'edit';
  user: AppUser;
}

// Roles gestionados fuera de este formulario (se asignan desde alta de estudiante/docente)
const NON_ASSIGNABLE_ROLES = new Set(['STUDENT', 'TEACHER', 'PARENT']);

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './form-dialog.component.html',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogClose,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
  ],
})
export class UserFormDialogComponent implements OnInit {
  action: 'add' | 'edit';
  dialogTitle: string;
  userForm: UntypedFormGroup;
  hide = true;
  availableRoles: RoleConfig[] = [];

  get isReservedRole(): boolean {
    return this.action === 'edit' && NON_ASSIGNABLE_ROLES.has(this.data.user?.role);
  }

  constructor(
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    private fb: UntypedFormBuilder,
    public userService: UserService,
    private rolesService: RolesService,
  ) {
    this.action = data.action;
    this.dialogTitle = data.action === 'edit' ? data.user.name : 'New User';
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.rolesService.getAll().subscribe({
      next: (roles) => {
        // Si el usuario tiene un rol no-asignable (STUDENT/TEACHER/PARENT), mostrar solo ese
        if (this.isReservedRole) {
          this.availableRoles = [{ name: this.data.user.role, displayName: this.data.user.role } as RoleConfig];
        } else {
          this.availableRoles = roles.filter((r) => !NON_ASSIGNABLE_ROLES.has(r.name));
        }
      },
    });
  }

  createForm(): UntypedFormGroup {
    const user = this.data.user ?? new AppUser();
    const isEdit = this.action === 'edit';
    const form = this.fb.group({
      id: [user.id],
      username: [user.username, [Validators.required, Validators.minLength(3)]],
      name: [user.name, [Validators.required]],
      email: [user.email, [Validators.required, Validators.email]],
      password: ['', isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      role: [user.role, [Validators.required]],
      isActive: [user.isActive ?? true],
    });
    // Bloquear el rol si es STUDENT/TEACHER/PARENT — se asigna solo desde su propio flujo
    if (isEdit && NON_ASSIGNABLE_ROLES.has(user.role)) {
      form.get('role')?.disable();
    }
    return form;
  }

  submit() {
    if (this.userForm.invalid) return;
    const formData = this.userForm.getRawValue();
    if (this.action === 'edit') {
      if (!formData.password) delete formData.password;
      this.userService.updateUser(formData).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => console.error(err),
      });
    } else {
      delete formData.id;
      this.userService.addUser(formData).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => console.error(err),
      });
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
