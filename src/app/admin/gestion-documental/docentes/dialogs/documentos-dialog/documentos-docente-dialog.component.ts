import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA, MatDialogRef,
  MatDialogContent, MatDialogActions, MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DocumentalDocenteService,
  DocumentalDocente,
  DocumentoItem,
} from '../../documental-docente.service';

export interface DocumentosDialogData {
  record: DocumentalDocente;
  teacherId: string;
  teacherName: string;
}

@Component({
  selector: 'app-documentos-docente-dialog',
  templateUrl: './documentos-docente-dialog.component.html',
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatProgressBarModule, MatDividerModule,
    MatChipsModule, MatDialogContent, MatDialogActions, MatDialogTitle,
    MatSnackBarModule, MatTabsModule, MatTooltipModule,
  ],
})
export class DocumentosDocenteDialogComponent implements OnInit {
  documentos: DocumentoItem[] = [];
  uploading = false;
  deletingId: string | null = null;

  // Upload form
  selectedFile: File | null = null;
  uploadNombre = '';
  uploadCategoria: 'profesional' | 'planificacion' = 'profesional';
  uploadDescripcion = '';

  get profesionales(): DocumentoItem[] {
    return this.documentos.filter(d => d.categoria === 'profesional');
  }

  get planificaciones(): DocumentoItem[] {
    return this.documentos.filter(d => d.categoria === 'planificacion');
  }

  constructor(
    public dialogRef: MatDialogRef<DocumentosDocenteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentosDialogData,
    private svc: DocumentalDocenteService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.documentos = [...(this.data.record.documentos ?? [])];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    if (this.selectedFile && !this.uploadNombre) {
      this.uploadNombre = this.selectedFile.name.replace(/\.[^/.]+$/, '');
    }
  }

  upload() {
    if (!this.selectedFile || !this.uploadNombre.trim()) {
      this.snackBar.open('Seleccione un archivo y complete el nombre', '', {
        duration: 3000, panelClass: 'snackbar-danger',
      });
      return;
    }

    const fd = new FormData();
    fd.append('file', this.selectedFile);
    fd.append('nombre', this.uploadNombre.trim());
    fd.append('categoria', this.uploadCategoria);
    if (this.uploadDescripcion.trim()) fd.append('descripcion', this.uploadDescripcion.trim());

    this.uploading = true;
    this.svc.uploadDocumento(this.data.teacherId, fd).subscribe({
      next: updated => {
        this.documentos = updated.documentos ?? [];
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

  deleteDoc(docId: string) {
    if (!confirm('¿Eliminar este documento?')) return;
    this.deletingId = docId;
    this.svc.deleteDocumento(this.data.teacherId, docId).subscribe({
      next: updated => {
        this.documentos = updated.documentos ?? [];
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

  close() { this.dialogRef.close(); }
}
