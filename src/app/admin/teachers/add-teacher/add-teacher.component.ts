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
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TeachersService } from '../all-teachers/teachers.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-add-teacher',
  templateUrl: './add-teacher.component.html',
  styleUrls: ['./add-teacher.component.scss'],
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
  ],
})
export class AddTeacherComponent {
  proForm: UntypedFormGroup;
  isSaving = false;
  areasEstudio: { id: string; nombre: string }[] = [];

  readonly salarialCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  breadscrums = [
    { title: 'Add Teacher', items: ['Teacher'], active: 'Add Teacher' },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private teachersService: TeachersService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.proForm = this.fb.group({
      name:              ['', [Validators.required]],
      email:             ['', [Validators.required, Validators.email]],
      dni:               [''],
      gender:            [''],
      mobile:            [''],
      areaEstudioId:     [''],
      laboralDependency: [''],
      salarialCategory:  [''],
      emergencyName:     [''],
      emergencyMobile:   [''],
      address:           [''],
      subject_specialization: [''],
      experience_years:  [0],
      status:            ['active'],
      birthdate:         [''],
      bio:               [''],
    });

    this.http
      .get<any>(`${environment.apiUrl}/area-estudio`)
      .subscribe({
        next: (r) => {
          const list = r.data?.data ?? r.data ?? r;
          this.areasEstudio = list.map((a: any) => ({
            id: a._id ?? a.id,
            nombre: a.nombre,
          }));
        },
      });
  }

  onSubmit() {
    if (this.proForm.invalid || this.isSaving) return;
    this.isSaving = true;

    this.teachersService.addTeacher(this.proForm.value).subscribe({
      next: () => {
        this.snackBar.open('Teacher registered successfully', '', {
          duration: 3000,
          panelClass: 'snackbar-success',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.router.navigate(['/admin/teachers/all-teachers']);
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
