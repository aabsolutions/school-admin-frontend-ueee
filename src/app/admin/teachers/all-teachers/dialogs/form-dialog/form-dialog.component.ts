import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeachersService } from '../../teachers.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Teachers } from '../../teachers.model';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { environment } from '@environments/environment';

export interface DialogData {
  id: string | number;
  action: string;
  teachers: Teachers;
}

@Component({
  selector: 'app-teachers-form',
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
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
  ],
})
export class TeachersFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  teacherForm: UntypedFormGroup;
  teachers: Teachers;
  departments: { id: string; name: string }[] = [];

  readonly salarialCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  constructor(
    public dialogRef: MatDialogRef<TeachersFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public teachersService: TeachersService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? data.teachers.name : 'New Teacher';
    this.teachers = this.action === 'edit' ? data.teachers : new Teachers({});
    this.teacherForm = this.createTeacherForm();
  }

  ngOnInit() {
    this.http
      .get<{ data: any[] }>(`${environment.apiUrl}/departments`)
      .subscribe({ next: (r) => {
        this.departments = r.data.map((d) => ({
          id: d._id ?? d.id,
          name: d.departmentName ?? d.department_name,
        }));
      }});
  }

  private safeDate(value: any): string {
    if (!value) return '';
    try { return formatDate(value, 'yyyy-MM-dd', 'en'); } catch { return ''; }
  }

  createTeacherForm(): UntypedFormGroup {
    const isAdd = this.action === 'add';
    return this.fb.group({
      id:                    [this.teachers.id],
      img:                   [this.teachers.img],
      name:                  [this.teachers.name, [Validators.required]],
      email:                 [this.teachers.email, [Validators.required, Validators.email]],
      dni:                   [this.teachers.dni, [Validators.required]],
      gender:                [this.teachers.gender],
      mobile:                [this.teachers.mobile],
      departmentId:          [this.teachers.departmentId],
      department:            [this.teachers.department],
      laboralDependency:     [this.teachers.laboralDependency],
      salarialCategory:      [this.teachers.salarialCategory],
      emergencyName:         [this.teachers.emergencyName],
      emergencyMobile:       [this.teachers.emergencyMobile],
      address:               [this.teachers.address],
      subject_specialization:[this.teachers.subject_specialization],
      experience_years:      [this.teachers.experience_years, [Validators.min(0)]],
      status:                [this.teachers.status],
      birthdate:             [this.safeDate(this.teachers.birthdate)],
      bio:                   [this.teachers.bio],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    if (control.hasError('minlength')) return `Minimum ${control.errors?.['minlength']?.requiredLength} characters`;
    return '';
  }

  submit() {
    if (this.teacherForm.valid) {
      const formData = this.teacherForm.getRawValue();
      if (this.action === 'edit') {
        this.teachersService.updateTeacher(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (err) => this.showError(err.message),
        });
      } else {
        this.teachersService.addTeacher(formData).subscribe({
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
