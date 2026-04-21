import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentsApiService } from '../parents-api.service';

@Component({
  selector: 'app-add-parent',
  templateUrl: './add-parent.component.html',
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
  ],
})
export class AddParentComponent {
  breadscrums = [{ title: 'Agregar Padre', items: ['Admin', 'Padres'], active: 'Agregar' }];
  form: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private api: ParentsApiService,
    private router: Router,
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
      username:       [''],
      password:       [''],
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;
    this.api.create(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Padre registrado correctamente', '', {
          duration: 3000, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
        this.router.navigate(['/admin/parents/all-parents']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Error al registrar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }
}
