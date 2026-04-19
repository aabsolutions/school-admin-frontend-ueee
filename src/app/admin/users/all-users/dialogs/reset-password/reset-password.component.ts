import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-user-reset-password',
  template: `
    <h4 mat-dialog-title>Reset Password</h4>
    <mat-dialog-content>
      The password for <strong>{{ data.name }}</strong> will be reset to
      their username: <strong>{{ data.username }}</strong>.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="primary" (click)="confirm()">Reset Password</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
})
export class UserResetPasswordComponent {
  constructor(
    public dialogRef: MatDialogRef<UserResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string | number; name: string; username: string },
    private userService: UserService
  ) {}

  confirm() {
    this.userService.resetPasswordToUsername(this.data.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(err),
    });
  }
}
