import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { EnrollmentService } from '../../enrollment.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData { id: string | number; studentName: string; cursoDisplay: string; }

@Component({
  selector: 'app-enrollment-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatDialogClose],
})
export class EnrollmentDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<EnrollmentDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public enrollmentService: EnrollmentService
  ) {}

  confirmDelete(): void {
    this.enrollmentService.delete(this.data.id).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error(err),
    });
  }
}
