import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogContent, MatDialogActions, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentalEstudianteService, TipoDocumentoEspecial } from '../../documental-estudiante.service';

@Component({
  selector: 'app-gestion-tipos-documento-dialog',
  templateUrl: './gestion-tipos-documento-dialog.component.html',
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressBarModule, MatDialogContent, MatDialogActions, MatDialogTitle,
  ],
})
export class GestionTiposDocumentoDialogComponent implements OnInit {
  tipos: TipoDocumentoEspecial[] = [];
  loading = false;
  saving = false;

  nuevoNombre = '';
  editingId: string | null = null;
  editingNombre = '';

  constructor(
    public dialogRef: MatDialogRef<GestionTiposDocumentoDialogComponent>,
    private svc: DocumentalEstudianteService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getTiposDocumentoEspecial().subscribe({
      next: tipos => { this.tipos = tipos; this.loading = false; },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar los tipos de documento', '', { duration: 4000, panelClass: 'snackbar-danger' });
      },
    });
  }

  crear() {
    const nombre = this.nuevoNombre.trim();
    if (!nombre) return;
    this.saving = true;
    this.svc.createTipoDocumentoEspecial(nombre).subscribe({
      next: tipo => {
        this.tipos = [...this.tipos, tipo].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.nuevoNombre = '';
        this.saving = false;
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error al crear el tipo de documento', '', { duration: 4000, panelClass: 'snackbar-danger' });
      },
    });
  }

  startEdit(tipo: TipoDocumentoEspecial) {
    this.editingId = tipo._id;
    this.editingNombre = tipo.nombre;
  }

  cancelEdit() {
    this.editingId = null;
    this.editingNombre = '';
  }

  saveEdit(tipo: TipoDocumentoEspecial) {
    const nombre = this.editingNombre.trim();
    if (!nombre) return;
    this.saving = true;
    this.svc.updateTipoDocumentoEspecial(tipo._id, nombre).subscribe({
      next: updated => {
        this.tipos = this.tipos
          .map(t => t._id === updated._id ? updated : t)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.saving = false;
        this.cancelEdit();
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error al renombrar el tipo de documento', '', { duration: 4000, panelClass: 'snackbar-danger' });
      },
    });
  }

  eliminar(tipo: TipoDocumentoEspecial) {
    if (!confirm(`¿Eliminar "${tipo.nombre}" del catálogo?`)) return;
    this.saving = true;
    this.svc.deleteTipoDocumentoEspecial(tipo._id).subscribe({
      next: () => {
        this.tipos = this.tipos.filter(t => t._id !== tipo._id);
        this.saving = false;
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al eliminar el tipo de documento', '', { duration: 4000, panelClass: 'snackbar-danger' });
      },
    });
  }

  close() {
    this.dialogRef.close(this.tipos);
  }
}
