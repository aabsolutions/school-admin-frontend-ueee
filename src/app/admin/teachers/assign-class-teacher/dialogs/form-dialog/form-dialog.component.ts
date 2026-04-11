import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { AssignClassTeacherService } from '../../assign-class-teacher.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AssignClassTeacher } from '../../assign-class-teacher.model';
import { formatDate } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: number;
  action: string;
  assignClassTeacher: AssignClassTeacher;
}

@Component({
    selector: 'app-assignClassTeacher-form',
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
        MatDatepickerModule,
        MatDialogClose
    ]
})
export class AssignClassTeacherFormComponent {
  action: string;
  dialogTitle: string;
  stdForm: UntypedFormGroup;
  assignClassTeacher: AssignClassTeacher;

  constructor(
    public dialogRef: MatDialogRef<AssignClassTeacherFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public assignClassTeacherService: AssignClassTeacherService,
    private fb: UntypedFormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit'
        ? data.assignClassTeacher.teacherName
        : 'New Teacher';
    this.assignClassTeacher =
      this.action === 'edit'
        ? data.assignClassTeacher
        : new AssignClassTeacher({});
    this.stdForm = this.createAssignClassTeacherForm();
  }

  createAssignClassTeacherForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.assignClassTeacher.id],
      teacherId: [this.assignClassTeacher.teacherId, [Validators.required]],
      img: [this.assignClassTeacher.img],
      teacherName: [this.assignClassTeacher.teacherName, [Validators.required]],
      classId: [this.assignClassTeacher.classId, [Validators.required]],
      className: [this.assignClassTeacher.className, [Validators.required]],
      subject: [this.assignClassTeacher.subject, [Validators.required]],
      startDate: [
        formatDate(this.assignClassTeacher.startDate, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      endDate: [
        formatDate(this.assignClassTeacher.endDate, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      assignedBy: [this.assignClassTeacher.assignedBy, [Validators.required]],
      assignmentStatus: [
        this.assignClassTeacher.assignmentStatus,
        [Validators.required],
      ],
      academicYear: [
        this.assignClassTeacher.academicYear,
        [Validators.required],
      ],
      classTiming: [this.assignClassTeacher.classTiming, [Validators.required]],
      roomNumber: [this.assignClassTeacher.roomNumber, [Validators.required]],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) {
      return 'This field is required';
    } else if (control.hasError('email')) {
      return 'Please enter a valid email';
    } else if (control.hasError('pattern')) {
      return 'Invalid mobile number';
    }
    return '';
  }

  submit() {
    if (this.stdForm.valid) {
      const formData = this.stdForm.getRawValue();
      if (this.action === 'edit') {
        this.assignClassTeacherService
          .updateClassTeacherAssignment(formData)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Update Error:', error);
              // Optionally display an error message to the user
            },
          });
      } else {
        this.assignClassTeacherService
          .addClassTeacherAssignment(formData)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Add Error:', error);
              // Optionally display an error message to the user
            },
          });
      }
    }
  }

  onNoClick(): void {
    this.stdForm.reset(); // Reset the form
    this.dialogRef.close();
  }
}
