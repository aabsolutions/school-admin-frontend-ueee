import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { InstitucionService } from './institucion.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-institucion',
  templateUrl: './institucion.component.html',
  imports: [
    CommonModule, ReactiveFormsModule, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatAutocompleteModule, MatDividerModule, FormsModule, MatTooltipModule,
  ],
})
export class InstitucionComponent implements OnInit {
  breadscrums = [{ title: 'Configuración Institucional', items: ['Administración'], active: 'Institución' }];

  form: FormGroup;
  loading = false;
  saving = false;
  uploadingLogo = false;
  logoPreview: string | null = null;

  docentes: { id: string; name: string; email: string }[] = [];
  periodosOptions: string[] = [];
  docenteSearch = '';
  autoridadNombre = '';

  constructor(
    private fb: FormBuilder,
    private service: InstitucionService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: [''],
      codigoAMIE: [''],
      distrito: [''],
      provincia: [''],
      canton: [''],
      contacto: [''],
      email: ['', [Validators.email]],
      direccion: [''],
      autoridad: [''],
      periodoLectivoFuncional: ['', [Validators.pattern(/^\d{4}-\d{4}$/)]],
    });
    this.generatePeriodosOptions();
  }

  ngOnInit(): void {
    this.loading = true;
    this.service.get().subscribe({
      next: (data) => {
        const autoridad = data.autoridad && typeof data.autoridad === 'object'
          ? (data.autoridad as any)._id ?? (data.autoridad as any).id
          : data.autoridad;
        this.form.patchValue({ ...data, autoridad: autoridad ?? '' });
        this.logoPreview = data.logotipo ?? null;
        this.loading = false;
        if (data.autoridad && typeof data.autoridad === 'object') {
          const d = data.autoridad as any;
          this.docentes = [{ id: autoridad, name: d.name, email: d.email }];
          this.autoridadNombre = d.name;
        }
      },
      error: () => { this.loading = false; },
    });

  }

  searchDocentes(term: string): void {
    if (!term || term.length < 2) { this.docentes = []; return; }
    this.http.get<any>(`${environment.apiUrl}/teachers?search=${term}&limit=10`).subscribe({
      next: (res) => {
        const list = res?.data?.data ?? [];
        this.docentes = list.map((t: any) => ({ id: t._id ?? t.id, name: t.name, email: t.email }));
      },
    });
  }

  onDocenteSelected(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value;
    const found = this.docentes.find((d) => d.id === id);
    this.form.get('autoridad')!.setValue(id);
    this.autoridadNombre = found?.name ?? '';
    this.docenteSearch = '';
  }

  clearAutoridad(): void {
    this.form.get('autoridad')!.setValue('');
    this.autoridadNombre = '';
  }

  getDocenteName(id: string): string {
    return this.docentes.find((d) => d.id === id)?.name ?? id ?? '';
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingLogo = true;
    this.service.uploadLogo(file).subscribe({
      next: (res) => {
        this.logoPreview = res.logotipo ?? null;
        this.uploadingLogo = false;
        this.snackBar.open('Logo actualizado', '', { duration: 3000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.uploadingLogo = false;
        this.snackBar.open('Error al subir el logo', '', { duration: 3000, panelClass: 'snackbar-danger' });
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.service.update(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Configuración guardada', '', {
          duration: 3000, panelClass: 'snackbar-success', verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al guardar', '', { duration: 3000, panelClass: 'snackbar-danger' });
      },
    });
  }

  private generatePeriodosOptions(): void {
    const current = new Date().getFullYear();
    this.periodosOptions = [];
    for (let y = current - 1; y <= current + 3; y++) {
      this.periodosOptions.push(`${y}-${y + 1}`);
    }
  }
}
