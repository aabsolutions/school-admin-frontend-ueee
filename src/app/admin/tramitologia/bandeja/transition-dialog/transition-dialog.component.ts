import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { Tramite, TramiteState } from '@shared/services/tramitologia.model';

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
    MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './transition-dialog.component.html',
})
export class TransitionDialogComponent {
  form: FormGroup;
  saving = false;

  get availableStates(): TramiteState[] {
    return TRANSITIONS[this.data.tramite.state as TramiteState] ?? [];
  }

  get isRechazado(): boolean {
    return this.form.value.newState === 'rechazado';
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
    });
  }

  stateLabel(s: string) { return STATE_LABELS[s] ?? s; }

  confirm() {
    if (this.form.invalid) return;
    this.saving = true;
    const { newState, observation } = this.form.value;
    this.tramitologiaService.transition(this.data.tramite._id, newState, observation || undefined).subscribe({
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
