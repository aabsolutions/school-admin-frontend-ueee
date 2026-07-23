import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ParentSingleSelectComponent } from '@shared/components/parent-selector/parent-single-select.component';
import { UppercaseDirective } from '@shared/directives/uppercase.directive';
import { AuthService } from '@core/service/auth.service';
import { StudentsService } from '../all-students/students.service';

export interface StudentProfileDialogData {
  studentId: string;
}

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatDialogModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatCheckboxModule, MatSlideToggleModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    ParentSingleSelectComponent, UppercaseDirective,
  ],
})
export class StudentProfileComponent implements OnInit {
  readOnly: boolean;
  studentName = '';

  isLoading = true;
  isSavingGeneral = false;
  isSavingMedical = false;
  isSavingFamily = false;

  generalForm!: FormGroup;
  medicalForm!: FormGroup;
  familyForm!: FormGroup;

  readonly genders = ['Male', 'Female', 'Other'];
  readonly residenceZones = ['URBANA', 'RURAL', 'FUERA DEL CANTÓN'];
  readonly statusOptions = ['active', 'inactive', 'graduated', 'suspended'];
  readonly bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly familySituations = ['Biparental', 'Monoparental madre', 'Monoparental padre', 'Tutela legal', 'Otra'];
  readonly educationLevels = ['Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado'];
  readonly socioeconomicLevels = ['Bajo', 'Medio bajo', 'Medio', 'Medio alto', 'Alto'];
  readonly housingTypes = ['Propia', 'Arrendada', 'Prestada', 'Otra'];

  constructor(
    public dialogRef: MatDialogRef<StudentProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentProfileDialogData,
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.readOnly = !this.authService.hasSidebarPermission('students:edit');
  }

  ngOnInit() {
    this.buildForms();
    this.studentsService.getStudentWithSiblings(this.data.studentId).subscribe({
      next: (student) => {
        this.studentName = student.name ?? '';
        this.patchAll(student);
        if (this.readOnly) {
          this.generalForm.disable();
          this.medicalForm.disable();
          this.familyForm.disable();
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  private buildForms() {
    this.generalForm = this.fb.group({
      name: ['', Validators.required],
      dni: [''],
      email: ['', Validators.email],
      mobile: [''],
      gender: [''],
      residenceZone: [''],
      birthdate: [''],
      address: [''],
      peso: [null],
      talla: [null],
      status: ['active'],
      nee: [false],
      aulaEspecial: [false],
      guardianId: [null],
      fatherId: [null],
      motherId: [null],
      parentGuardianName: [''],
      parentGuardianMobile: [''],
      fatherName: [''],
      fatherMobile: [''],
      motherName: [''],
      motherMobile: [''],
    });

    this.medicalForm = this.fb.group({
      bloodType: [''],
      hasAllergies: [false],
      allergiesDetail: [''],
      hasChronicCondition: [false],
      chronicConditionDetail: [''],
      currentMedications: [''],
      hasDisability: [false],
      disabilityDetail: [''],
      hasConadis: [false],
      conadisNumber: [''],
      doctorName: [''],
      doctorPhone: [''],
      healthInsurance: [''],
      policyNumber: [''],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
      emergencyContactRelation: [''],
      medicalNotes: [''],
    });

    this.familyForm = this.fb.group({
      familySituation: [''],
      livesWithWhom: [''],
      fatherOccupation: [''],
      fatherEducationLevel: [''],
      motherOccupation: [''],
      motherEducationLevel: [''],
      numberOfSiblings: [0],
      studentBirthOrder: [1],
      socioeconomicLevel: [''],
      housingType: [''],
      familyNotes: [''],
    });
  }

  private patchAll(s: any) {
    this.generalForm.patchValue({
      name: s.name ?? '',
      dni: s.dni ?? '',
      email: s.email ?? '',
      mobile: s.mobile ?? '',
      gender: s.gender ?? '',
      residenceZone: s.residenceZone ?? '',
      birthdate: s.birthdate ? s.birthdate.substring(0, 10) : '',
      address: s.address ?? '',
      peso: s.peso ?? null,
      talla: s.talla ?? null,
      status: s.status ?? 'active',
      nee: s.nee ?? false,
      aulaEspecial: s.aulaEspecial ?? false,
      guardianId: s.guardianId ?? null,
      fatherId: s.fatherId ?? null,
      motherId: s.motherId ?? null,
      parentGuardianName: s.parentGuardianName ?? '',
      parentGuardianMobile: s.parentGuardianMobile ?? '',
      fatherName: s.fatherName ?? '',
      fatherMobile: s.fatherMobile ?? '',
      motherName: s.motherName ?? '',
      motherMobile: s.motherMobile ?? '',
    });
    if (s.medicalInfo) this.medicalForm.patchValue(s.medicalInfo);
    if (s.familyInfo) this.familyForm.patchValue(s.familyInfo);
  }

  private _toId(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value._id ?? value.id ?? null;
  }

  saveGeneral() {
    if (this.generalForm.invalid || this.isSavingGeneral) return;
    this.isSavingGeneral = true;
    const raw = this.generalForm.getRawValue();
    const payload = {
      ...raw,
      fatherId: this._toId(raw.fatherId),
      motherId: this._toId(raw.motherId),
      guardianId: this._toId(raw.guardianId),
    };
    this.studentsService.updateGeneralInfo(this.data.studentId, payload).subscribe({
      next: () => { this.isSavingGeneral = false; this.notify('snackbar-success', 'Información general guardada'); },
      error: (e) => { this.isSavingGeneral = false; this.notify('snackbar-danger', e.message); },
    });
  }

  saveMedical() {
    if (this.isSavingMedical) return;
    this.isSavingMedical = true;
    this.studentsService.updateMedicalInfo(this.data.studentId, this.medicalForm.getRawValue()).subscribe({
      next: () => { this.isSavingMedical = false; this.notify('snackbar-success', 'Información médica guardada'); },
      error: (e) => { this.isSavingMedical = false; this.notify('snackbar-danger', e.message); },
    });
  }

  saveFamily() {
    if (this.isSavingFamily) return;
    this.isSavingFamily = true;
    this.studentsService.updateFamilyInfo(this.data.studentId, this.familyForm.getRawValue()).subscribe({
      next: () => { this.isSavingFamily = false; this.notify('snackbar-success', 'Información familiar guardada'); },
      error: (e) => { this.isSavingFamily = false; this.notify('snackbar-danger', e.message); },
    });
  }

  private notify(cls: string, msg: string) {
    this.snackBar.open(msg, '', { duration: 3000, panelClass: cls, verticalPosition: 'bottom', horizontalPosition: 'center' });
  }

  close(): void {
    this.dialogRef.close();
  }
}
