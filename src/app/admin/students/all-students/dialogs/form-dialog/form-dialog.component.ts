import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
  MatDialog,
} from '@angular/material/dialog';
import { AddParentInlineDialogComponent } from '@shared/components/parent-selector/add-parent-inline-dialog.component';
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
import { ParentSingleSelectComponent } from '@shared/components/parent-selector/parent-single-select.component';

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
    ParentSingleSelectComponent,
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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
      fatherId:             [this._extractId(this.student.fatherId)],
      motherId:             [this._extractId(this.student.motherId)],
      guardianId:           [this._extractId(this.student.guardianId)],
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

  openAddParentDialog() {
    this.dialog.open(AddParentInlineDialogComponent, { width: '500px' });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  /** Si el campo viene populado ({_id,name,email}) lo pasa tal cual; si es string ID, lo pasa como string */
  private _extractId(value: any): any {
    if (!value) return null;
    return value;
  }
}
