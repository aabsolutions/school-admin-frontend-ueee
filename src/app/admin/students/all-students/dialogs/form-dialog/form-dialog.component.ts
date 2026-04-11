import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentsService } from '../../students.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Students } from '../../students.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: string | number;
  action: string;
  student: Students;
}

@Component({
  selector: 'app-students-form',
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
    MatDialogClose,
  ],
})
export class StudentsFormComponent {
  action: string;
  dialogTitle: string;
  stdForm: UntypedFormGroup;
  student: Students;
  constructor(
    public dialogRef: MatDialogRef<StudentsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public studentsService: StudentsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? data.student.name : 'New Student';
    this.student = this.action === 'edit' ? data.student : new Students({});
    this.stdForm = this.createStudentForm();
  }

  private safeDate(value: any): string {
    if (!value) return '';
    try { return new Date(value).toISOString().split('T')[0]; } catch { return ''; }
  }

  createStudentForm(): UntypedFormGroup {
    const isAdd = this.action === 'add';
    return this.fb.group({
      id:                   [this.student.id],
      img:                  [this.student.img],
      name:                 [this.student.name, [Validators.required]],
      email:                [this.student.email, [Validators.required, Validators.email]],
      dni:                  [this.student.dni, [Validators.required]],
      mobile:               [this.student.mobile],
      gender:               [this.student.gender],
      residenceZone:        [this.student.residenceZone ?? ''],
      birthdate:            [this.safeDate(this.student.birthdate)],
      address:              [this.student.address],
      parentGuardianName:   [this.student.parentGuardianName],
      parentGuardianMobile: [this.student.parentGuardianMobile],
      fatherName:           [this.student.fatherName],
      fatherMobile:         [this.student.fatherMobile],
      motherName:           [this.student.motherName],
      motherMobile:         [this.student.motherMobile],
      status:               [this.student.status || 'active'],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    if (control.hasError('minlength')) return `Minimum ${control.errors?.['minlength']?.requiredLength} characters`;
    return '';
  }

  submit() {
    if (this.stdForm.valid) {
      const formData = this.stdForm.getRawValue();
      if (this.action === 'edit') {
        this.studentsService.updateStudent(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (err) => this.showError(err.message),
        });
      } else {
        this.studentsService.addStudent(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (err) => this.showError(err.message),
        });
      }
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message || 'Operation failed', '', {
      duration: 4000,
      panelClass: 'snackbar-danger',
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
