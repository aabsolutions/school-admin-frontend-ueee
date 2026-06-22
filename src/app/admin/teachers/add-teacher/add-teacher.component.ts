import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TeachersService } from '../all-teachers/teachers.service';
import { UppercaseDirective } from '@shared/directives/uppercase.directive';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

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
    MatButtonModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    UppercaseDirective,
  ],
})
export class AddTeacherComponent implements OnInit {
  generalForm: FormGroup;
  medicalForm: FormGroup;
  familyForm: FormGroup;
  isSaving = false;
  areasEstudio: { id: string; nombre: string }[] = [];

  readonly salarialCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  readonly bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly maritalStatuses = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  readonly housingTypes = ['Propia', 'Arrendada', 'Prestada', 'Otra'];

  breadscrums = [
    { title: 'Agregar Docente', items: ['Docentes'], active: 'Agregar Docente' },
  ];

  constructor(
    private fb: FormBuilder,
    private teachersService: TeachersService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.generalForm = this.fb.group({
      name:              ['', [Validators.required]],
      email:             ['', [Validators.email]],
      dni:               ['', [Validators.required]],
      gender:            [''],
      mobile:            [''],
      areaEstudioId:     [''],
      laboralDependency:    [''],
      jornadaLaboral:       [''],
      correoInstitucional:  [''],
      salarialCategory:     [''],
      emergencyName:     [''],
      emergencyMobile:   [''],
      address:           [''],
      subject_specialization: [''],
      experience_years:  [0],
      status:            ['active'],
      birthdate:         [''],
      bio:               [''],
      peso:              [null],
      talla:             [null],
    });

    this.medicalForm = this.fb.group({
      bloodType:               [''],
      hasAllergies:            [false],
      allergiesDetail:         [''],
      hasChronicCondition:     [false],
      chronicConditionDetail:  [''],
      currentMedications:      [''],
      hasDisability:           [false],
      disabilityDetail:        [''],
      hasConadis:              [false],
      conadisNumber:           [''],
      healthInsurance:         [''],
      policyNumber:            [''],
      emergencyContactName:    [''],
      emergencyContactPhone:   [''],
      emergencyContactRelation:[''],
      medicalNotes:            [''],
    });

    this.familyForm = this.fb.group({
      maritalStatus:   [''],
      spouseName:      [''],
      spouseOccupation:[''],
      spouseMobile:    [''],
      numberOfChildren:[0],
      childrenAges:    [''],
      housingType:     [''],
      familyNotes:     [''],
    });
  }

  ngOnInit() {
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
    if (this.generalForm.invalid || this.isSaving) return;
    this.isSaving = true;

    this.teachersService.addTeacher(this.generalForm.value).pipe(
      switchMap((teacher) =>
        forkJoin([
          this.teachersService.updateTeacherMedical(teacher.id as string, this.medicalForm.value),
          this.teachersService.updateTeacherFamily(teacher.id as string, this.familyForm.value),
        ]).pipe(map(() => teacher))
      )
    ).subscribe({
      next: () => {
        this.snackBar.open('Docente registrado correctamente', '', {
          duration: 3000,
          panelClass: 'snackbar-success',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.router.navigate(['/admin/teachers/all-teachers']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.message || 'Error al registrar', '', {
          duration: 3000,
          panelClass: 'snackbar-danger',
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      },
    });
  }
}
