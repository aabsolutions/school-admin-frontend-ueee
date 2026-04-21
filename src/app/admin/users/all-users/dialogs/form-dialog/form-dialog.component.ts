import { Component, Inject } from '@angular/core';
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
import { AppUser } from '../../user.model';
import { UserService } from '../../user.service';

export interface UserDialogData {
  action: 'add' | 'edit';
  user: AppUser;
}

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './form-dialog.component.html',
  imports: [
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
export class UserFormDialogComponent {
  action: 'add' | 'edit';
  dialogTitle: string;
  userForm: UntypedFormGroup;
  hide = true;

  readonly editableRoles = ['SUPERADMIN', 'ADMIN'];
  readonly reservedRoles = ['STUDENT', 'TEACHER'];

  get roles(): string[] {
    // En edición de usuario con rol reservado: mostrar ese rol pero sin opciones editables
    if (this.action === 'edit' && this.isReservedRole) {
      return [this.data.user.role];
    }
    return this.editableRoles;
  }

  get isReservedRole(): boolean {
    return this.action === 'edit' && this.reservedRoles.includes(this.data.user?.role);
  }

  constructor(
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    private fb: UntypedFormBuilder,
    public userService: UserService
  ) {
    this.action = data.action;
    this.dialogTitle = data.action === 'edit' ? data.user.name : 'New User';
    this.userForm = this.createForm();
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
    // Bloquear el rol si es STUDENT o TEACHER — se asigna solo desde el alta de estudiante/docente
    if (isEdit && this.reservedRoles.includes(user.role)) {
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
