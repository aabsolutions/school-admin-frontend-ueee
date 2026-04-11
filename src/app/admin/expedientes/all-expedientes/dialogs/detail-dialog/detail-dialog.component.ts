import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Expediente, ExpedienteRegistro, StudentInfo, TIPO_CONFIG } from '../../expediente.model';
import { ExpedientesService } from '../../expedientes.service';
import { RegistroDialogComponent } from '../registro-dialog/registro-dialog.component';
import { LocalStorageService } from '@shared/services';

export interface DetailDialogData { expediente: Expediente }

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.scss'],
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule, MatChipsModule,
  ],
})
export class DetailDialogComponent implements OnInit {
  registros: ExpedienteRegistro[] = [];
  loading = true;
  isSuperAdmin = false;
  readonly tipoConfig = TIPO_CONFIG;

  get studentInfo(): StudentInfo | undefined {
    const exp = this.data.expediente;
    if (exp.student) return exp.student;
    if (typeof exp.studentId === 'object') return exp.studentId as StudentInfo;
    return undefined;
  }

  constructor(
    public dialogRef: MatDialogRef<DetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailDialogData,
    private svc: ExpedientesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: LocalStorageService,
  ) {}

  ngOnInit() {
    const roleNames: string[] = JSON.parse(this.store.get('roleNames') ?? '[]');
    this.isSuperAdmin = roleNames.includes('SUPERADMIN');
    this.loadRegistros();
    this.dialogRef.backdropClick().subscribe(() => this.close());
    this.dialogRef.keydownEvents().subscribe(e => { if (e.key === 'Escape') this.close(); });
  }

  close() {
    this.dialogRef.close({
      count: this.registros.length,
      ultimoRegistro: this.registros[0]?.fecha,
    });
  }

  loadRegistros() {
    this.loading = true;
    this.svc.getRegistros(this.data.expediente._id).subscribe({
      next: (rs) => { this.registros = rs; this.loading = false; },
      error: (err) => {
        console.error('[Expedientes] Error al cargar registros:', err);
        this.loading = false;
        this.snackBar.open(err?.message || 'Error al cargar los registros', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  openRegistroDialog(registro?: ExpedienteRegistro) {
    const ref = this.dialog.open(RegistroDialogComponent, {
      width: '600px', maxWidth: '100vw', autoFocus: false,
      data: {
        expedienteId: this.data.expediente._id,
        studentName:  this.studentInfo?.name ?? '',
        registro,
      },
    });
    ref.afterClosed().subscribe(res => {
      if (!res) return;
      if (registro) {
        // Edit mode — replace in the list
        const idx = this.registros.findIndex(r => r._id === res._id);
        if (idx !== -1) this.registros[idx] = res;
        else this.registros = this.registros.map(r => r._id === res._id ? res : r);
        this.snackBar.open('Registro actualizado', '', {
          duration: 2500, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      } else {
        this.registros = [res, ...this.registros];
        this.snackBar.open('Registro agregado', '', {
          duration: 2500, panelClass: 'snackbar-success',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      }
    });
  }

  deleteRegistro(reg: ExpedienteRegistro) {
    this.svc.deleteRegistro(this.data.expediente._id, reg._id).subscribe({
      next: () => {
        this.registros = this.registros.filter(r => r._id !== reg._id);
        this.snackBar.open('Registro eliminado', '', {
          duration: 2000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
      error: (err) => this.snackBar.open(err.message || 'Error', '', { duration: 3000 }),
    });
  }

  getFileUrl(path: string): string { return this.svc.getFileUrl(path); }
  isImage(path: string): boolean    { return this.svc.isImage(path); }

  getFileName(path: string): string {
    // Works for both Cloudinary URLs and legacy local paths
    return decodeURIComponent(path.split('/').pop() ?? path);
  }

  deleteEvidencia(reg: ExpedienteRegistro, url: string) {
    if (!confirm('¿Eliminar esta evidencia? Esta acción no se puede deshacer.')) return;
    this.svc.deleteEvidencia(this.data.expediente._id, reg._id, url).subscribe({
      next: (updated) => {
        reg.evidencias = updated.evidencias;
        this.snackBar.open('Evidencia eliminada', '', {
          duration: 2000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
      error: (err) => this.snackBar.open(err.message || 'Error al eliminar', '', { duration: 3000 }),
    });
  }

  getTipoClass(tipo: string): string {
    return this.tipoConfig[tipo]?.color ?? 'badge-solid-default';
  }

  getTipoIcon(tipo: string): string {
    return this.tipoConfig[tipo]?.icon ?? 'info';
  }
}
