import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface StudentAttendanceDialogData {
  studentName: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

@Component({
  selector: 'app-student-attendance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './student-attendance-dialog.component.html',
  styleUrl: './student-attendance-dialog.component.scss',
})
export class StudentAttendanceDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StudentAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentAttendanceDialogData,
  ) {}
}
