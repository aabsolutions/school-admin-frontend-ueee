import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-ficha-medica-student',
  templateUrl: './ficha-medica.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatCheckboxModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
})
export class FichaMedicaStudentComponent implements OnInit {
  breadscrums = [{ title: 'Ficha Médica', items: ['Estudiante'], active: 'Ficha Médica y Familiar' }];

  loading = false;
  saving = false;

  medicalInfo: any = {};
  familyInfo: any = {};

  readonly bloodTypeOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly educationOptions = ['Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado'];
  readonly familySituationOptions = ['Biparental', 'Monoparental madre', 'Monoparental padre', 'Tutela legal', 'Otra'];
  readonly socioeconomicOptions = ['Bajo', 'Medio bajo', 'Medio', 'Medio alto', 'Alto'];
  readonly housingOptions = ['Propia', 'Arrendada', 'Prestada', 'Otra'];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/students/me`).subscribe({
      next: (res) => {
        const student = res.data ?? res;
        this.medicalInfo = { ...(student.medicalInfo ?? {}) };
        this.familyInfo = { ...(student.familyInfo ?? {}) };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  saveMedical() {
    this.saving = true;
    this.http.patch<any>(`${environment.apiUrl}/students/me/medical`, this.medicalInfo).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Información médica guardada', '', { duration: 3000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al guardar', '', { duration: 3000, panelClass: 'snackbar-danger' });
      },
    });
  }

  saveFamily() {
    this.saving = true;
    this.http.patch<any>(`${environment.apiUrl}/students/me/family`, this.familyInfo).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Información familiar guardada', '', { duration: 3000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al guardar', '', { duration: 3000, panelClass: 'snackbar-danger' });
      },
    });
  }
}
