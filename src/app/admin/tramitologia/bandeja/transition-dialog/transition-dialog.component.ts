import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { Tramite, TramiteState, Plantilla, VariableConfig } from '@shared/services/tramitologia.model';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { VariablePickerComponent } from '@shared/components/tramitologia/variable-picker/variable-picker.component';
import { VARIABLE_LABELS } from '@shared/components/tramitologia/variable-picker/variable-labels';

const TRANSITIONS: Record<TramiteState, TramiteState[]> = {
  pendiente:  ['en_proceso'] as TramiteState[],
  en_proceso: ['aprobado', 'rechazado'] as TramiteState[],
  aprobado:   ['finalizado'] as TramiteState[],
  rechazado:  [],
  finalizado: [],
};

const STATE_LABELS: Record<string, string> = {
  en_proceso: 'En Proceso',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  finalizado: 'Finalizado',
};

@Component({
  selector: 'app-transition-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule, MatProgressSpinnerModule,
    MatExpansionModule, MatSnackBarModule,
    NgxEditorModule,
    DynamicFormComponent,
    VariablePickerComponent,
  ],
  templateUrl: './transition-dialog.component.html',
})
export class TransitionDialogComponent implements OnInit, OnDestroy {
  @ViewChild(DynamicFormComponent) respuestaFormComp?: DynamicFormComponent;

  form: FormGroup;
  bodyOverride = new FormControl('');
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

  respuestaForm: FormGroup | null = null;
  respuestaVariables: VariableConfig[] = [];
  plantillaRespuesta: Plantilla | null = null;
  saving = false;
  showBodyEditor = false;

  get availableStates(): TramiteState[] {
    return TRANSITIONS[this.data.tramite.state as TramiteState] ?? [];
  }

  get isRechazado(): boolean {
    return this.form.value.newState === 'rechazado';
  }

  get isResolution(): boolean {
    const s = this.form.value.newState;
    return s === 'aprobado' || s === 'finalizado';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { tramite: Tramite },
    private dialogRef: MatDialogRef<TransitionDialogComponent>,
    private fb: FormBuilder,
    private tramitologiaService: TramitologiaService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      newState: [this.availableStates[0] ?? '', Validators.required],
      observation: [''],
    });

    this.form.get('newState')!.valueChanges.subscribe((v) => {
      const ctrl = this.form.get('observation')!;
      if (v === 'rechazado') ctrl.setValidators(Validators.required);
      else ctrl.clearValidators();
      ctrl.updateValueAndValidity();
      this.loadRespuestaPlantilla(v);
      if (v !== 'aprobado' && v !== 'finalizado') {
        this.showBodyEditor = false;
      }
    });
  }

  ngOnInit() {
    this.editor = new Editor();
    this.loadRespuestaPlantilla(this.form.value.newState);
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private readonly SYSTEM_KEYS = new Set(Object.keys(VARIABLE_LABELS));

  private loadRespuestaPlantilla(newState: string) {
    const isResol = newState === 'aprobado' || newState === 'finalizado';
    const plantillaRespuestaId = this.data.tramite.plantilla.plantillaRespuestaId;
    if (isResol && plantillaRespuestaId) {
      this.tramitologiaService.getPlantilla(plantillaRespuestaId).subscribe({
        next: (p) => {
          this.plantillaRespuesta = p;
          const configured = p.variables ?? [];
          const configuredKeys = new Set(configured.map((v) => v.key));
          const detected = this.detectCustomVars(p.bodyHtml ?? '');
          // Merge: configured primero (con labels/tipos del admin), luego detectadas que falten
          this.respuestaVariables = [
            ...configured,
            ...detected.filter((v) => !configuredKeys.has(v.key)),
          ];
          this.bodyOverride.setValue(p.bodyHtml ?? '');
        },
        error: () => { this.plantillaRespuesta = null; this.respuestaVariables = []; },
      });
    } else {
      this.plantillaRespuesta = null;
      this.respuestaVariables = [];
      this.bodyOverride.setValue('');
    }
  }

  private detectCustomVars(html: string): VariableConfig[] {
    const seen = new Set<string>();
    const result: VariableConfig[] = [];
    for (const m of html.matchAll(/\[([A-Z][A-Z0-9_]{0,49})\]/g)) {
      const key = m[1];
      if (!this.SYSTEM_KEYS.has(key) && !seen.has(key)) {
        seen.add(key);
        result.push({ key, label: key.replace(/_/g, ' '), fieldType: 'text', required: false, options: [], order: result.length });
      }
    }
    return result;
  }

  insertVariable(key: string): void {
    const { state } = this.editor.view;
    this.editor.view.dispatch(state.tr.insertText(`[${key}]`));
    this.editor.view.focus();
  }

  onRespuestaFormChange(form: FormGroup) { this.respuestaForm = form; }

  stateLabel(s: string) { return STATE_LABELS[s] ?? s; }

  confirm() {
    if (this.form.invalid) return;
    this.saving = true;
    const { newState, observation } = this.form.value;

    const respuestaValues = this.respuestaFormComp?.getValues()
      ?? (this.respuestaForm ? Object.entries(this.respuestaForm.value).map(([key, value]) => ({ key, value })) : undefined);

    const bodyOverrideVal = this.showBodyEditor && this.isResolution
      ? (this.bodyOverride.value ?? undefined)
      : undefined;

    this.tramitologiaService.transition(
      this.data.tramite._id, newState, observation || undefined, respuestaValues, bodyOverrideVal,
    ).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Estado actualizado', 'OK', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err?.error?.message ?? 'Error al transicionar', 'OK', { duration: 4000 });
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
