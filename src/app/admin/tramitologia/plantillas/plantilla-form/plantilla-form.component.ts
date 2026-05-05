import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { VariableConfig, RequiredAttachment } from '@shared/services/tramitologia.model';

@Component({
  selector: 'app-plantilla-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatCheckboxModule, MatSnackBarModule, MatProgressSpinnerModule,
    BreadcrumbComponent,
  ],
  templateUrl: './plantilla-form.component.html',
})
export class PlantillaFormComponent implements OnInit {
  breadscrums = [{ title: 'Nueva Plantilla', items: ['Tramitología', 'Plantillas'], active: 'Nueva' }];
  form!: FormGroup;
  variables: Array<VariableConfig & { optionsStr?: string }> = [];
  attachments: Partial<RequiredAttachment>[] = [];
  isEdit = false;
  plantillaId: string | null = null;
  saving = false;
  detectingVars = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tramitologiaService: TramitologiaService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      categoria: ['', Validators.required],
      solicitanteRoles: [['STUDENT', 'TEACHER', 'PARENT']],
      bodyHtml: ['', Validators.required],
    });

    this.plantillaId = this.route.snapshot.paramMap.get('id');
    if (this.plantillaId) {
      this.isEdit = true;
      this.breadscrums = [{ title: 'Editar Plantilla', items: ['Tramitología', 'Plantillas'], active: 'Editar' }];
      this.tramitologiaService.getPlantilla(this.plantillaId).subscribe((p) => {
        this.form.patchValue(p);
        this.variables = p.variables.map((v) => ({ ...v, optionsStr: v.options?.join(',') ?? '' }));
        this.attachments = [...(p.requiredAttachments ?? [])];
      });
    }
  }

  detectVariables() {
    const html = this.form.value.bodyHtml;
    if (!html) return;
    this.detectingVars = true;
    this.tramitologiaService.parseVariables(html).subscribe({
      next: (parsed) => {
        this.detectingVars = false;
        const existingMap = new Map(this.variables.map((v) => [v.key, v]));
        this.variables = parsed.customVars.map((key, idx) =>
          existingMap.get(key) ?? { key, label: key.toLowerCase().replace(/_/g, ' '), fieldType: 'text' as const, required: true, options: [], order: idx, optionsStr: '' },
        );
      },
      error: () => { this.detectingVars = false; },
    });
  }

  updateOptions(v: VariableConfig & { optionsStr?: string }) {
    v.options = (v.optionsStr ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  }

  addAttachment() {
    this.attachments.push({ name: '', description: '', required: true, allowedMimes: [], maxSizeBytes: 10 * 1024 * 1024 });
  }

  removeAttachment(i: number) { this.attachments.splice(i, 1); }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = {
      ...this.form.value,
      variables: this.variables.map((v) => ({
        key: v.key, label: v.label, fieldType: v.fieldType,
        required: v.required, options: v.options ?? [],
        defaultValue: v.defaultValue, placeholder: v.placeholder, order: v.order,
      })),
      requiredAttachments: this.attachments.filter((a) => a.name),
    };

    const obs = this.isEdit
      ? this.tramitologiaService.updatePlantilla(this.plantillaId!, payload)
      : this.tramitologiaService.createPlantilla(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Plantilla actualizada' : 'Plantilla creada', 'OK', { duration: 2500 });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err?.error?.message ?? 'Error al guardar', 'OK', { duration: 4000 });
      },
    });
  }
}
