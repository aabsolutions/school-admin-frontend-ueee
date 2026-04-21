import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { StudentsService } from '../all-students/students.service';
import { ParentSingleSelectComponent } from '@shared/components/parent-selector/parent-single-select.component';
import { AddParentInlineDialogComponent } from '@shared/components/parent-selector/add-parent-inline-dialog.component';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss'],
  imports: [
    BreadcrumbComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatButtonModule,
    ParentSingleSelectComponent,
  ],
})
export class AddStudentComponent {
  stdForm: UntypedFormGroup;
  isSaving = false;

  breadscrums = [
    { title: 'Agregar estudiante', items: ['Student'], active: 'Agregar estudiante' },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private studentsService: StudentsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.stdForm = this.fb.group({
      name:                 ['', [Validators.required]],
      email:                ['', [Validators.required, Validators.email]],
      dni:                  [''],
      mobile:               [''],
      gender:               [''],
      residenceZone:        [''],
      birthdate:            [''],
      address:              [''],
      fatherId:             [null],
      motherId:             [null],
      guardianId:           [null],
      status:               ['active'],
    });
  }

  openAddParentDialog() {
    this.dialog.open(AddParentInlineDialogComponent, { width: '500px' });
  }

  onSubmit() {
    if (this.stdForm.invalid || this.isSaving) return;
    this.isSaving = true;

    this.studentsService.addStudent(this.stdForm.value).subscribe({
      next: () => {
        this.snackBar.open('Student registered successfully', '', {
          duration: 3000,
          panelClass: 'snackbar-success',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.router.navigate(['/admin/students/all-students']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.message || 'Registration failed', '', {
          duration: 3000,
          panelClass: 'snackbar-danger',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      },
    });
  }
}
