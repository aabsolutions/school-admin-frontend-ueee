import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { StudentProfileService } from './profile.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BreadcrumbComponent,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
})
export class SettingsComponent implements OnInit {
  breadscrums = [{ title: 'Mi Perfil', items: ['Estudiante'], active: 'Mi Perfil' }];

  isLoading = true;
  isSavingGeneral = false;
  isSavingPassword = false;
  isSavingMedical = false;
  isSavingFamily = false;

  hideNewPwd = true;
  hideConfirmPwd = true;

  generalForm!: FormGroup;
  passwordForm!: FormGroup;
  medicalForm!: FormGroup;
  familyForm!: FormGroup;

  readonly genders = ['Male', 'Female', 'Other'];
  readonly residenceZones = ['URBANA', 'RURAL', 'FUERA DEL CANTÓN'];
  readonly bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly familySituations = ['Biparental', 'Monoparental madre', 'Monoparental padre', 'Tutela legal', 'Otra'];
  readonly educationLevels = ['Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado'];
  readonly socioeconomicLevels = ['Bajo', 'Medio bajo', 'Medio', 'Medio alto', 'Alto'];
  readonly housingTypes = ['Propia', 'Arrendada', 'Prestada', 'Otra'];

  constructor(
    private fb: FormBuilder,
    private profileService: StudentProfileService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.buildForms();
    this.profileService.getMe().subscribe({
      next: (data) => {
        this.patchAll(data);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  private buildForms() {
    this.generalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [''],
      address: [''],
      gender: [''],
      residenceZone: [''],
      birthdate: [''],
      peso: [null],
      talla: [null],
      parentGuardianName: [''],
      parentGuardianMobile: [''],
      fatherName: [''],
      fatherMobile: [''],
      motherName: [''],
      motherMobile: [''],
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', Validators.minLength(6)],
      confirmPassword: [''],
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

  private patchAll(data: any) {
    this.generalForm.patchValue({
      name: data.name ?? '',
      email: data.email ?? '',
      mobile: data.mobile ?? '',
      address: data.address ?? '',
      gender: data.gender ?? '',
      residenceZone: data.residenceZone ?? '',
      birthdate: data.birthdate ? data.birthdate.substring(0, 10) : '',
      peso: data.peso ?? null,
      talla: data.talla ?? null,
      parentGuardianName: data.parentGuardianName ?? '',
      parentGuardianMobile: data.parentGuardianMobile ?? '',
      fatherName: data.fatherName ?? '',
      fatherMobile: data.fatherMobile ?? '',
      motherName: data.motherName ?? '',
      motherMobile: data.motherMobile ?? '',
    });
    if (data.medicalInfo) this.medicalForm.patchValue(data.medicalInfo);
    if (data.familyInfo) this.familyForm.patchValue(data.familyInfo);
  }

  saveGeneral() {
    if (this.generalForm.invalid || this.isSavingGeneral) return;
    const { name, email, ...rest } = this.generalForm.value;
    this.isSavingGeneral = true;

    this.profileService.updateUserAccount({ name, email }).subscribe({
      next: () => {
        this.profileService.updateGeneral(rest).subscribe({
          next: () => {
            this.isSavingGeneral = false;
            this.notify('snackbar-success', 'Información general guardada');
          },
          error: (e) => { this.isSavingGeneral = false; this.notify('snackbar-danger', e.message); },
        });
      },
      error: (e) => { this.isSavingGeneral = false; this.notify('snackbar-danger', e.message); },
    });
  }

  savePassword() {
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      this.notify('snackbar-danger', 'Las contraseñas no coinciden');
      return;
    }
    this.isSavingPassword = true;
    this.profileService.updateUserAccount({ password: newPassword }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordForm.reset();
        this.notify('snackbar-success', 'Contraseña actualizada');
      },
      error: (e) => { this.isSavingPassword = false; this.notify('snackbar-danger', e.message); },
    });
  }

  saveMedical() {
    if (this.isSavingMedical) return;
    this.isSavingMedical = true;
    this.profileService.updateMedical(this.medicalForm.value).subscribe({
      next: () => { this.isSavingMedical = false; this.notify('snackbar-success', 'Información médica guardada'); },
      error: (e) => { this.isSavingMedical = false; this.notify('snackbar-danger', e.message); },
    });
  }

  saveFamily() {
    if (this.isSavingFamily) return;
    this.isSavingFamily = true;
    this.profileService.updateFamily(this.familyForm.value).subscribe({
      next: () => { this.isSavingFamily = false; this.notify('snackbar-success', 'Información familiar guardada'); },
      error: (e) => { this.isSavingFamily = false; this.notify('snackbar-danger', e.message); },
    });
  }

  private notify(cls: string, msg: string) {
    this.snackBar.open(msg, '', { duration: 3000, panelClass: cls, verticalPosition: 'bottom', horizontalPosition: 'center' });
  }
}
