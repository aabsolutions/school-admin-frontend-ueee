import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { UserService } from '../all-users/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  imports: [
    BreadcrumbComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
  ],
})
export class AddUserComponent {
  userForm: UntypedFormGroup;
  hide = true;
  isSubmitting = false;

  breadscrums = [{ title: 'Add User', items: ['User Management'], active: 'Add User' }];
  readonly roles = ['SUPERADMIN', 'ADMIN'];

  constructor(
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.createForm();
  }

  createForm(): UntypedFormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ADMIN', [Validators.required]],
      isActive: [true],
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.isSubmitting = true;
    this.userService.addUser(this.userForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('User created successfully', '', {
          duration: 3000,
          panelClass: 'snackbar-success',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.router.navigate(['/admin/users/all-users']);
      },
      error: (err) => {
        this.snackBar.open(err?.message || 'Error creating user', '', {
          duration: 3000,
          panelClass: 'snackbar-danger',
        });
        this.isSubmitting = false;
      },
    });
  }

  onReset() {
    this.userForm.reset({ role: 'ADMIN', isActive: true });
  }
}
