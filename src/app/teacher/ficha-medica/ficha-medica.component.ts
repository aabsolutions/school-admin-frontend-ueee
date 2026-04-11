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
  selector: 'app-ficha-medica-teacher',
  templateUrl: './ficha-medica.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatCheckboxModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
})
export class FichaMedicaTeacherComponent implements OnInit {
  breadscrums = [{ title: 'Ficha Médica', items: ['Docente'], active: 'Ficha Médica y Familiar' }];

  loading = false;
  saving = false;

  medicalInfo: any = {};
  familyInfo: any = {};

  readonly bloodTypeOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly maritalStatusOptions = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/teachers/me`).subscribe({
      next: (res) => {
        const teacher = res.data ?? res;
        this.medicalInfo = { ...(teacher.medicalInfo ?? {}) };
        this.familyInfo = { ...(teacher.familyInfo ?? {}) };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  saveMedical() {
    this.saving = true;
    this.http.patch<any>(`${environment.apiUrl}/teachers/me/medical`, this.medicalInfo).subscribe({
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
    this.http.patch<any>(`${environment.apiUrl}/teachers/me/family`, this.familyInfo).subscribe({
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
