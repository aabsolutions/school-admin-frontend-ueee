import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DriveDocumento,
  ExpedienteAcademico,
  StudentInfo,
  SeccionGroup,
  groupBySecciones,
} from '../../expediente-academico.model';
import { ExpedienteAcademicoService } from '../../expediente-academico.service';
import { DocumentoDialogComponent } from '../documento-dialog/documento-dialog.component';

export interface DetailDialogData { expediente: ExpedienteAcademico }

@Component({
  selector: 'app-expediente-academico-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.scss'],
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
})
export class ExpedienteAcademicoDetailDialogComponent implements OnInit {
  documentos: DriveDocumento[] = [];
  secciones: SeccionGroup[] = [];
  globalSecciones: string[] = [];
  loading = true;

  get studentInfo(): StudentInfo | undefined {
    const exp = this.data.expediente;
    if (exp.student) return exp.student;
    if (typeof exp.studentId === 'object') return exp.studentId as StudentInfo;
    return undefined;
  }

  constructor(
    public dialogRef: MatDialogRef<ExpedienteAcademicoDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailDialogData,
    private svc: ExpedienteAcademicoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadDocumentos();
    this.loadGlobalSecciones();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  loadGlobalSecciones() {
    this.svc.getSecciones().subscribe({ next: (s) => { this.globalSecciones = s; } });
  }

  loadDocumentos() {
    this.loading = true;
    this.svc.getDocumentos(this.data.expediente._id).subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.secciones = groupBySecciones(docs);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openDocumentoDialog(documento?: DriveDocumento) {
    const ref = this.dialog.open(DocumentoDialogComponent, {
      width: '600px', maxWidth: '100vw', autoFocus: false,
      data: {
        expedienteId: this.data.expediente._id,
        studentName:  this.studentInfo?.name ?? '',
        documento,
        secciones:    this.globalSecciones,
      },
    });
    ref.afterClosed().subscribe((res: DriveDocumento | undefined) => {
      if (!res) return;
      if (documento) {
        this.documentos = this.documentos.map(d => d._id === res._id ? res : d);
        this.snackBar.open('Documento actualizado', '', { duration: 2500, panelClass: 'snackbar-success', verticalPosition: 'bottom', horizontalPosition: 'center' });
      } else {
        this.documentos = [...this.documentos, res];
        this.snackBar.open('Documento agregado', '', { duration: 2500, panelClass: 'snackbar-success', verticalPosition: 'bottom', horizontalPosition: 'center' });
      }
      this.secciones = groupBySecciones(this.documentos);
      this.loadGlobalSecciones();
    });
  }

  deleteDocumento(doc: DriveDocumento) {
    if (!confirm(`¿Eliminar "${doc.nombre}"?`)) return;
    this.svc.deleteDocumento(this.data.expediente._id, doc._id).subscribe({
      next: () => {
        this.documentos = this.documentos.filter(d => d._id !== doc._id);
        this.secciones = groupBySecciones(this.documentos);
        this.snackBar.open('Documento eliminado', '', { duration: 2000, panelClass: 'snackbar-danger', verticalPosition: 'bottom', horizontalPosition: 'center' });
      },
      error: (err) => this.snackBar.open(err.message || 'Error', '', { duration: 3000 }),
    });
  }

  deleteSeccion(nombre: string) {
    if (!confirm(`¿Eliminar la sección "${nombre}" y todos sus documentos en este expediente?`)) return;
    this.svc.deleteSeccion(this.data.expediente._id, nombre).subscribe({
      next: () => {
        this.documentos = this.documentos.filter(d => d.seccion !== nombre);
        this.secciones = groupBySecciones(this.documentos);
        this.snackBar.open(`Sección "${nombre}" eliminada`, '', { duration: 2500, panelClass: 'snackbar-danger', verticalPosition: 'bottom', horizontalPosition: 'center' });
      },
      error: (err) => this.snackBar.open(err.message || 'Error', '', { duration: 3000 }),
    });
  }

  deleteExpediente() {
    if (!confirm(`¿Eliminar el expediente académico de ${this.studentInfo?.name ?? 'este estudiante'}? Se eliminarán todos los documentos.`)) return;
    this.svc.deleteExpediente(this.data.expediente._id).subscribe({
      next: () => {
        this.snackBar.open('Expediente eliminado', '', { duration: 2500, panelClass: 'snackbar-danger', verticalPosition: 'bottom', horizontalPosition: 'center' });
        this.dialogRef.close('deleted');
      },
      error: (err) => this.snackBar.open(err.message || 'Error', '', { duration: 3000 }),
    });
  }
}
