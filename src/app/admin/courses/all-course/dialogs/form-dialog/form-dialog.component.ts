import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CourseService } from '../../course.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Course } from '../../course.model';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TitleCasePipe } from '@angular/common';

export interface DialogData {
  id: number;
  action: string;
  course: Course;
}

@Component({
  selector: 'app-course-form',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    TitleCasePipe,
  ],
})
export class CourseFormComponent {
  action: string;
  dialogTitle: string;
  courseForm: UntypedFormGroup;
  course: Course;

  statusOptions = ['active', 'inactive', 'archived'];
  departmentOptions = [
    { id: '001', name: 'Mechanical' },
    { id: '002', name: 'Civil' },
    { id: '003', name: 'Science' },
    { id: '004', name: 'Mathematics' },
    { id: '005', name: 'Computer Science' },
    { id: '006', name: 'Arts' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CourseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public courseService: CourseService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit' ? data.course.courseName : 'New Course';
    this.course = this.action === 'edit' ? data.course : new Course({});
    this.courseForm = this.createCourseForm();
  }

  createCourseForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.course.id],
      courseCode: [this.course.courseCode, [Validators.required]],
      courseName: [this.course.courseName, [Validators.required]],
      description: [this.course.description],
      department: [this.course.department, [Validators.required]],
      departmentId: [this.course.departmentId],
      credits: [this.course.credits, [Validators.required, Validators.min(1), Validators.max(6)]],
      durationWeeks: [this.course.durationWeeks],
      isElective: [this.course.isElective],
      status: [this.course.status],
    });
  }

  onDepartmentChange(deptId: string) {
    const dept = this.departmentOptions.find((d) => d.id === deptId);
    if (dept) {
      this.courseForm.patchValue({ department: dept.name, departmentId: dept.id });
    }
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('min')) return 'Minimum value is 1';
    if (control.hasError('max')) return 'Maximum value is 6';
    return '';
  }

  submit() {
    if (this.courseForm.valid) {
      const formData = this.courseForm.getRawValue();
      if (this.action === 'edit') {
        this.courseService.updateCourse(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Update Error:', error),
        });
      } else {
        this.courseService.addCourse(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Add Error:', error),
        });
      }
    }
  }

  onNoClick(): void {
    this.courseForm.reset();
    this.dialogRef.close();
  }
}
