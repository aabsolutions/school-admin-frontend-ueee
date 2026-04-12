import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentalEstudianteService, DocumentalEstudiante, NIVEL_BACH } from '../../documental-estudiante.service';

export interface ChecklistDialogData {
  record: DocumentalEstudiante;
  studentName: string;
}

@Component({
  selector: 'app-checklist-estudiante-dialog',
  templateUrl: './checklist-estudiante-dialog.component.html',
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatChipsModule,
    MatDialogContent, MatDialogActions, MatDialogTitle, MatSnackBarModule,
  ],
})
export class ChecklistEstudianteDialogComponent implements OnInit {
  saving = false;

  form: Partial<DocumentalEstudiante> = {};

  get isBach(): boolean {
    return !!this.data.record.nivelActual && NIVEL_BACH.includes(this.data.record.nivelActual);
  }

  get pendientesObligatorios(): number {
    const fields: (keyof DocumentalEstudiante)[] = [
      'boleta5to', 'boleta6to', 'boleta7mo', 'boleta8vo',
      'boleta9no', 'boleta10mo', 'boleta1roBach', 'boleta2doBach',
      'copiaCedulaEstudiante', 'copiaCedulaRepresentante',
    ];
    const count = fields.filter(f => !this.form[f]).length;
    return this.isBach ? count + (this.form.certificadoParticipacion ? 0 : 1) : count;
  }

  constructor(
    public dialogRef: MatDialogRef<ChecklistEstudianteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistDialogData,
    private svc: DocumentalEstudianteService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const r = this.data.record;
    this.form = {
      boleta2do: r.boleta2do,
      boleta3ro: r.boleta3ro,
      boleta4to: r.boleta4to,
      boleta5to: r.boleta5to,
      boleta6to: r.boleta6to,
      boleta7mo: r.boleta7mo,
      boleta8vo: r.boleta8vo,
      boleta9no: r.boleta9no,
      boleta10mo: r.boleta10mo,
      boleta1roBach: r.boleta1roBach,
      boleta2doBach: r.boleta2doBach,
      copiaCedulaEstudiante: r.copiaCedulaEstudiante,
      copiaCedulaRepresentante: r.copiaCedulaRepresentante,
      certificadoParticipacion: r.certificadoParticipacion,
      notas: r.notas,
    };
  }

  save() {
    this.saving = true;
    this.svc.update(this.data.record._id, this.form).subscribe({
      next: updated => {
        this.saving = false;
        this.snackBar.open('Documentos actualizados correctamente', '', {
          duration: 3000, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
        this.dialogRef.close(updated);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al guardar los cambios', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  cancel() { this.dialogRef.close(); }
}
