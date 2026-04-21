import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  FormsModule, ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentsApiService, Parent } from '../parents-api.service';

@Component({
  selector: 'app-edit-parent',
  templateUrl: './edit-parent.component.html',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
})
export class EditParentComponent implements OnInit {
  breadscrums = [{ title: 'Editar Padre', items: ['Admin', 'Padres'], active: 'Editar' }];
  form: FormGroup;
  parent: Parent | null = null;
  isSaving = false;
  isLoading = true;
  parentId = '';

  constructor(
    private fb: FormBuilder,
    private api: ParentsApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name:           ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      dni:            [''],
      mobile:         [''],
      gender:         [''],
      address:        [''],
      occupation:     [''],
      educationLevel: [''],
      isActive:       [true],
    });
  }

  ngOnInit() {
    this.parentId = this.route.snapshot.paramMap.get('id') || '';
    this.api.getOne(this.parentId).subscribe({
      next: (p) => {
        this.parent = p;
        this.form.patchValue(p);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se encontró el padre', '', { duration: 3000, panelClass: 'snackbar-danger' });
        this.router.navigate(['/admin/parents/all-parents']);
      },
    });
  }

  unlinkStudent(studentId: string) {
    if (!confirm('¿Desvincular este estudiante?')) return;
    this.api.unlinkStudent(this.parentId, studentId).subscribe({
      next: (updated) => {
        this.parent = updated;
        this.snackBar.open('Estudiante desvinculado', '', { duration: 2000, panelClass: 'snackbar-success' });
      },
      error: () => this.snackBar.open('Error al desvincular', '', { duration: 3000, panelClass: 'snackbar-danger' }),
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;
    this.api.update(this.parentId, this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Padre actualizado', '', {
          duration: 3000, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
        this.router.navigate(['/admin/parents/all-parents']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Error al actualizar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }
}
