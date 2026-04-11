import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CourseService } from '../all-course/course.service';
import { Course } from '../all-course/course.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss'],
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    TitleCasePipe,
  ],
})
export class AddCourseComponent {
  courseForm: UntypedFormGroup;
  breadscrums = [{ title: 'Add Course', items: ['Courses'], active: 'Add Course' }];

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
    private fb: UntypedFormBuilder,
    private courseService: CourseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      courseCode: ['', [Validators.required]],
      courseName: ['', [Validators.required]],
      description: [''],
      departmentId: ['', [Validators.required]],
      department: [''],
      credits: [3, [Validators.required, Validators.min(1), Validators.max(6)]],
      durationWeeks: [16],
      isElective: [false],
      status: ['active'],
    });
  }

  onDepartmentChange(deptId: string) {
    const dept = this.departmentOptions.find((d) => d.id === deptId);
    if (dept) this.courseForm.patchValue({ department: dept.name });
  }

  onSubmit() {
    if (this.courseForm.valid) {
      const course = new Course(this.courseForm.getRawValue());
      this.courseService.addCourse(course).subscribe({
        next: () => {
          this.snackBar.open('Course added successfully!', '', {
            duration: 2000, panelClass: 'snackbar-success',
            verticalPosition: 'bottom', horizontalPosition: 'center',
          });
          this.router.navigate(['/admin/courses/all-course']);
        },
        error: (err) => console.error(err),
      });
    }
  }

  onCancel() {
    this.router.navigate(['/admin/courses/all-course']);
  }
}
