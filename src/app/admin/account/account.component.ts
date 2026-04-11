import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '@core';
import { UserService } from '../users/all-users/user.service';
import { LocalStorageService } from '@shared/services';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class AccountComponent implements OnInit {
  profileForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  userImg = './assets/images/user/user1.jpg';
  hideNew = true;
  hideConfirm = true;
  isLoading = true;
  isSaving = false;

  breadscrums = [
    { title: 'My Account', items: ['Admin'], active: 'Account' },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private store: LocalStorageService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name:  ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      newPassword:     ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    });
  }

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          name:  user.name  ?? '',
          email: user.email ?? '',
        });
        if (user.avatar) {
          this.userImg = './assets/images/user/' + user.avatar;
        }
        // Keep localStorage in sync
        const current = this.authService.currentUserValue;
        const merged = { ...current, ...user };
        this.store.set('currentUser', merged);
        this.authService.user$.next(merged);
        this.isLoading = false;
      },
      error: () => {
        // Fallback to cached data if API fails
        const cached = this.authService.currentUserValue;
        this.profileForm.patchValue({
          name:  cached.name  ?? '',
          email: cached.email ?? '',
        });
        if (cached.avatar) {
          this.userImg = './assets/images/user/' + cached.avatar;
        }
        this.isLoading = false;
      },
    });
  }

  saveProfile() {
    if (this.profileForm.invalid || this.isSaving) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword && newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match', '', {
        duration: 3000,
        panelClass: 'snackbar-danger',
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
      return;
    }

    const payload: any = { ...this.profileForm.value };
    if (newPassword) payload.password = newPassword;

    this.isSaving = true;
    this.userService.updateProfile(payload).subscribe({
      next: (updated) => {
        const current = this.authService.currentUserValue;
        const merged = { ...current, ...updated };
        this.store.set('currentUser', merged);
        this.authService.user$.next(merged);
        this.passwordForm.reset();
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully', '', {
          duration: 3000,
          panelClass: 'snackbar-success',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.message || 'Update failed', '', {
          duration: 3000,
          panelClass: 'snackbar-danger',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      },
    });
  }
}
