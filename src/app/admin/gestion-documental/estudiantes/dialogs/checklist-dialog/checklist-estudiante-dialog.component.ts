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
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { NgxPermissionsModule } from 'ngx-permissions';
import {
  DocumentalEstudianteService,
  DocumentalEstudiante,
  DocumentoEspecialItem,
  TipoDocumentoEspecial,
  NIVEL_BACH,
} from '../../documental-estudiante.service';
import { GestionTiposDocumentoDialogComponent } from '../gestion-tipos-dialog/gestion-tipos-documento-dialog.component';

export interface ChecklistDialogData {
  record: DocumentalEstudiante;
  studentId: string;
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
    MatTabsModule, MatButtonToggleModule, MatSelectModule, NgxPermissionsModule,
  ],
})
export class ChecklistEstudianteDialogComponent implements OnInit {
  saving = false;

  form: Partial<DocumentalEstudiante> = {};

  // Documentos especiales
  documentosEspeciales: DocumentoEspecialItem[] = [];
  tiposDocumento: TipoDocumentoEspecial[] = [];
  uploading = false;
  deletingId: string | null = null;
  uploadMode: 'file' | 'url' = 'file';
  selectedFile: File | null = null;
  uploadNombre = '';
  uploadDescripcion = '';
  uploadUrl = '';

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
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadTiposDocumento();
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
    this.documentosEspeciales = [...(r.documentosEspeciales ?? [])];
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

  // ─── Documentos especiales ────────────────────────────────────────────────

  loadTiposDocumento() {
    this.svc.getTiposDocumentoEspecial().subscribe({
      next: tipos => { this.tiposDocumento = tipos; },
      error: () => {
        this.snackBar.open('Error al cargar los tipos de documento', '', { duration: 4000, panelClass: 'snackbar-danger' });
      },
    });
  }

  gestionarTipos() {
    const ref = this.dialog.open(GestionTiposDocumentoDialogComponent, { width: '520px' });
    ref.afterClosed().subscribe((tipos?: TipoDocumentoEspecial[]) => {
      if (tipos) this.tiposDocumento = tipos;
    });
  }

  onModeChange() {
    this.selectedFile = null;
    this.uploadUrl = '';
    this.uploadNombre = '';
    this.uploadDescripcion = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadEspecial() {
    if (!this.selectedFile || !this.uploadNombre.trim()) {
      this.snackBar.open('Seleccione un archivo y complete el nombre', '', {
        duration: 3000, panelClass: 'snackbar-danger',
      });
      return;
    }

    const fd = new FormData();
    fd.append('file', this.selectedFile);
    fd.append('nombre', this.uploadNombre.trim());
    if (this.uploadDescripcion.trim()) fd.append('descripcion', this.uploadDescripcion.trim());

    this.uploading = true;
    this.svc.uploadDocumentoEspecial(this.data.studentId, fd).subscribe({
      next: updated => {
        this.documentosEspeciales = updated.documentosEspeciales ?? [];
        this.uploading = false;
        this.selectedFile = null;
        this.uploadNombre = '';
        this.uploadDescripcion = '';
        this.snackBar.open('Documento subido correctamente', '', {
          duration: 3000, panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Error al subir el documento', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  saveUrlEspecial() {
    if (!this.uploadUrl.trim() || !this.uploadNombre.trim()) {
      this.snackBar.open('Completá el nombre y la URL', '', { duration: 3000, panelClass: 'snackbar-danger' });
      return;
    }
    this.uploading = true;
    this.svc.addDocumentoEspecialUrl(this.data.studentId, {
      nombre: this.uploadNombre.trim(),
      url: this.uploadUrl.trim(),
      descripcion: this.uploadDescripcion.trim() || undefined,
    }).subscribe({
      next: updated => {
        this.documentosEspeciales = updated.documentosEspeciales ?? [];
        this.uploading = false;
        this.uploadUrl = '';
        this.uploadNombre = '';
        this.uploadDescripcion = '';
        this.snackBar.open('Documento registrado correctamente', '', { duration: 3000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Error al registrar el documento', '', { duration: 4000, panelClass: 'snackbar-danger' });
      },
    });
  }

  deleteDocEspecial(docId: string) {
    if (!confirm('¿Eliminar este documento?')) return;
    this.deletingId = docId;
    this.svc.deleteDocumentoEspecial(this.data.studentId, docId).subscribe({
      next: updated => {
        this.documentosEspeciales = updated.documentosEspeciales ?? [];
        this.deletingId = null;
        this.snackBar.open('Documento eliminado', '', {
          duration: 3000, panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.deletingId = null;
        this.snackBar.open('Error al eliminar el documento', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  openUrl(url: string) { window.open(url, '_blank'); }
}
