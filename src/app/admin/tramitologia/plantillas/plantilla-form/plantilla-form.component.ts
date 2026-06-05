import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { VariablePickerComponent } from '@shared/components/tramitologia/variable-picker/variable-picker.component';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { VariableConfig, RequiredAttachment, Plantilla } from '@shared/services/tramitologia.model';

@Component({
  selector: 'app-plantilla-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatCheckboxModule, MatButtonToggleModule, MatSnackBarModule, MatProgressSpinnerModule,
    NgxEditorModule,
    BreadcrumbComponent,
    VariablePickerComponent,
  ],
  templateUrl: './plantilla-form.component.html',
})
export class PlantillaFormComponent implements OnInit, OnDestroy {
  breadscrums = [{ title: 'Nueva Plantilla', items: ['Tramitología', 'Plantillas'], active: 'Nueva' }];
  form!: FormGroup;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['text_color', 'background_color'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['bullet_list', 'ordered_list'],
    ['blockquote', 'horizontal_rule'],
    ['link'],
    ['subscript', 'superscript'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['indent', 'outdent'],
    ['format_clear', 'undo', 'redo'],
  ];
  variables: Array<VariableConfig & { optionsStr?: string }> = [];
  attachments: Partial<RequiredAttachment>[] = [];
  isEdit = false;
  plantillaId: string | null = null;
  saving = false;
  detectingVars = false;
  respuestaPlantillas: Plantilla[] = [];

  constructor(
    private fb: FormBuilder,
    readonly route: ActivatedRoute,
    readonly router: Router,
    private tramitologiaService: TramitologiaService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.editor = new Editor();
    this.form = this.fb.group({
      tipo: ['solicitud', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      categoria: ['', Validators.required],
      solicitanteRoles: [['STUDENT', 'TEACHER', 'PARENT']],
      bodyHtml: ['', Validators.required],
      plantillaRespuestaId: [null],
    });

    this.tramitologiaService.getPlantillas(1, 100, undefined, 'respuesta').subscribe({
      next: (result) => { this.respuestaPlantillas = result.data; },
      error: () => {},
    });

    this.plantillaId = this.route.snapshot.paramMap.get('id');
    if (this.plantillaId) {
      this.isEdit = true;
      this.breadscrums = [{ title: 'Editar Plantilla', items: ['Tramitología', 'Plantillas'], active: 'Editar' }];
      this.tramitologiaService.getPlantilla(this.plantillaId).subscribe((p) => {
        this.form.patchValue({
          ...p,
          tipo: p.tipo ?? 'solicitud',
          plantillaRespuestaId: typeof p.plantillaRespuestaId === 'object'
            ? (p.plantillaRespuestaId as any)?._id ?? null
            : p.plantillaRespuestaId ?? null,
        });
        this.variables = p.variables.map((v) => ({ ...v, optionsStr: v.options?.join(',') ?? '' }));
        this.attachments = [...(p.requiredAttachments ?? [])];
      });
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  get isRespuesta(): boolean { return this.form?.value.tipo === 'respuesta'; }

  get availableRespuestaPlantillas(): Plantilla[] {
    return this.respuestaPlantillas.filter((p) => p._id !== this.plantillaId);
  }

  insertVariable(key: string): void {
    const { state } = this.editor.view;
    this.editor.view.dispatch(state.tr.insertText(`[${key}]`));
    this.editor.view.focus();
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
    const formVal = this.form.value;
    const payload: any = {
      ...formVal,
      variables: this.variables.map((v) => ({
        key: v.key, label: v.label, fieldType: v.fieldType,
        required: v.required, options: v.options ?? [],
        defaultValue: v.defaultValue, placeholder: v.placeholder, order: v.order,
      })),
      requiredAttachments: this.attachments.filter((a) => a.name),
    };
    if (formVal.plantillaRespuestaId === null) payload.plantillaRespuestaId = null;

    const obs = this.isEdit
      ? this.tramitologiaService.updatePlantilla(this.plantillaId!, payload)
      : this.tramitologiaService.createPlantilla(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Plantilla actualizada' : 'Plantilla creada', 'OK', { duration: 2500 });
        this.router.navigate([this.isEdit ? '../../plantillas' : '../plantillas'], { relativeTo: this.route });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err?.error?.message ?? 'Error al guardar', 'OK', { duration: 4000 });
      },
    });
  }
}
