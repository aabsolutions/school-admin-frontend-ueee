import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CourseService } from '../../course.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: string | number;
  courseName: string;
  courseCode: string;
}

@Component({
  selector: 'app-course-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule],
})
export class CourseDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<CourseDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public courseService: CourseService
  ) {}

  confirmDelete(): void {
    this.courseService.deleteCourse(this.data.id).subscribe({
      next: (response) => {
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Delete Error:', error);
      },
    });
  }
}
