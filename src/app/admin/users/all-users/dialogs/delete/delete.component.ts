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
  selector: 'app-user-delete',
  template: `
    <h4 mat-dialog-title>Delete User</h4>
    <mat-dialog-content>
      Are you sure you want to delete <strong>{{ data.name }}</strong>
      ({{ data.username }})? This action cannot be undone.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" (click)="confirmDelete()">Delete</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
})
export class UserDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string | number; name: string; username: string },
    private userService: UserService
  ) {}

  confirmDelete() {
    this.userService.deleteUser(this.data.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(err),
    });
  }
}
