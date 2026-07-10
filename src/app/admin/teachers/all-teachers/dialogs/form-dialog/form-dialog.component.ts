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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { environment } from '@environments/environment';
import { UppercaseDirective } from '@shared/directives/uppercase.directive';
import { forkJoin, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

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
    MatTabsModule,
    MatSlideToggleModule,
    UppercaseDirective,
  ],
})
export class TeachersFormComponent implements OnInit {
  action: string;
  readOnly: boolean;
  dialogTitle: string;
  teacherForm: UntypedFormGroup;
  medicalForm: UntypedFormGroup;
  familyForm: UntypedFormGroup;
  teachers: Teachers;
  areasEstudio: { id: string; nombre: string }[] = [];

  readonly salarialCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  readonly bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly maritalStatuses = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  readonly housingTypes = ['Propia', 'Arrendada', 'Prestada', 'Otra'];

  constructor(
    public dialogRef: MatDialogRef<TeachersFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public teachersService: TeachersService,
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.readOnly = this.action === 'view';
    this.dialogTitle = this.action !== 'add' ? data.teachers.name : 'Nuevo Docente';
    this.teachers = this.action !== 'add' ? data.teachers : new Teachers({});
    this.teacherForm = this.createTeacherForm();
    this.medicalForm = this.createMedicalForm();
    this.familyForm = this.createFamilyForm();
    if (this.readOnly) {
      this.teacherForm.disable();
      this.medicalForm.disable();
      this.familyForm.disable();
    }
  }

  ngOnInit() {
    this.http
      .get<any>(`${environment.apiUrl}/area-estudio`)
      .subscribe({ next: (r) => {
        const list = r.data?.data ?? r.data ?? r;
        this.areasEstudio = list.map((a: any) => ({
          id: a._id ?? a.id,
          nombre: a.nombre,
        }));
      }});
  }

  private safeDate(value: any): string {
    if (!value) return '';
    try { return formatDate(value, 'yyyy-MM-dd', 'en'); } catch { return ''; }
  }

  createTeacherForm(): UntypedFormGroup {
    return this.fb.group({
      id:                    [this.teachers.id],
      img:                   [this.teachers.img],
      name:                  [this.teachers.name, [Validators.required]],
      email:                 [this.teachers.email, [Validators.email]],
      dni:                   [this.teachers.dni, [Validators.required]],
      gender:                [this.teachers.gender],
      mobile:                [this.teachers.mobile],
      areaEstudioId:         [this.teachers.areaEstudioId],
      laboralDependency:     [this.teachers.laboralDependency],
      jornadaLaboral:        [this.teachers.jornadaLaboral],
      correoInstitucional:   [this.teachers.correoInstitucional],
      salarialCategory:      [this.teachers.salarialCategory],
      emergencyName:         [this.teachers.emergencyName],
      emergencyMobile:       [this.teachers.emergencyMobile],
      address:               [this.teachers.address],
      subject_specialization:[this.teachers.subject_specialization],
      experience_years:      [this.teachers.experience_years, [Validators.min(0)]],
      status:                [this.teachers.status],
      birthdate:             [this.safeDate(this.teachers.birthdate)],
      bio:                   [this.teachers.bio],
      peso:                  [this.teachers.peso ?? null],
      talla:                 [this.teachers.talla ?? null],
    });
  }

  private createMedicalForm(): UntypedFormGroup {
    const m = (this.teachers as any).medicalInfo ?? {};
    return this.fb.group({
      bloodType:               [m.bloodType ?? ''],
      hasAllergies:            [m.hasAllergies ?? false],
      allergiesDetail:         [m.allergiesDetail ?? ''],
      hasChronicCondition:     [m.hasChronicCondition ?? false],
      chronicConditionDetail:  [m.chronicConditionDetail ?? ''],
      currentMedications:      [m.currentMedications ?? ''],
      hasDisability:           [m.hasDisability ?? false],
      disabilityDetail:        [m.disabilityDetail ?? ''],
      hasConadis:              [m.hasConadis ?? false],
      conadisNumber:           [m.conadisNumber ?? ''],
      healthInsurance:         [m.healthInsurance ?? ''],
      policyNumber:            [m.policyNumber ?? ''],
      emergencyContactName:    [m.emergencyContactName ?? ''],
      emergencyContactPhone:   [m.emergencyContactPhone ?? ''],
      emergencyContactRelation:[m.emergencyContactRelation ?? ''],
      medicalNotes:            [m.medicalNotes ?? ''],
    });
  }

  private createFamilyForm(): UntypedFormGroup {
    const f = (this.teachers as any).familyInfo ?? {};
    return this.fb.group({
      maritalStatus:   [f.maritalStatus ?? ''],
      spouseName:      [f.spouseName ?? ''],
      spouseOccupation:[f.spouseOccupation ?? ''],
      spouseMobile:    [f.spouseMobile ?? ''],
      numberOfChildren:[f.numberOfChildren ?? 0],
      childrenAges:    [f.childrenAges ?? ''],
      housingType:     [f.housingType ?? ''],
      familyNotes:     [f.familyNotes ?? ''],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    if (control.hasError('minlength')) return `Minimum ${control.errors?.['minlength']?.requiredLength} characters`;
    return '';
  }

  submit() {
    if (!this.teacherForm.valid) return;
    const formData = this.teacherForm.getRawValue();
    const medical = this.medicalForm.value;
    const family = this.familyForm.value;

    if (this.action === 'edit') {
      forkJoin([
        this.teachersService.updateTeacher(formData),
        this.teachersService.updateTeacherMedical(formData.id, medical),
        this.teachersService.updateTeacherFamily(formData.id, family),
      ]).subscribe({
        next: ([teacher]) => this.dialogRef.close(teacher),
        error: (err) => this.showError(err.message),
      });
    } else {
      this.teachersService.addTeacher(formData).pipe(
        switchMap((teacher) =>
          forkJoin([
            this.teachersService.updateTeacherMedical(teacher.id as string, medical),
            this.teachersService.updateTeacherFamily(teacher.id as string, family),
          ]).pipe(map(() => teacher))
        )
      ).subscribe({
        next: (teacher) => this.dialogRef.close(teacher),
        error: (err) => this.showError(err.message),
      });
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
