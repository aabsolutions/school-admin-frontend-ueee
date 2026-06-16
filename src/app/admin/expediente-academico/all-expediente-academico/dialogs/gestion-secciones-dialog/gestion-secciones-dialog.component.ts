import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpedienteAcademicoService } from '../../expediente-academico.service';

@Component({
  selector: 'app-gestion-secciones-dialog',
  templateUrl: './gestion-secciones-dialog.component.html',
  styleUrls: ['./gestion-secciones-dialog.component.scss'],
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
})
export class GestionSeccionesDialogComponent implements OnInit {
  secciones: { nombre: string; count: number }[] = [];
  loading = true;
  deleting: Set<string> = new Set();

  constructor(
    public dialogRef: MatDialogRef<GestionSeccionesDialogComponent>,
    private svc: ExpedienteAcademicoService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getSeccionesStats().subscribe({
      next: (data) => { this.secciones = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  deleteSeccion(nombre: string, count: number) {
    const msg = count > 0
      ? `¿Eliminar la sección "${nombre}"? Se borrarán ${count} documento(s) de todos los expedientes.`
      : `¿Eliminar la sección "${nombre}"?`;
    if (!confirm(msg)) return;

    this.deleting.add(nombre);
    this.svc.deleteSeccionGlobal(nombre).subscribe({
      next: (res) => {
        this.deleting.delete(nombre);
        this.secciones = this.secciones.filter(s => s.nombre !== nombre);
        this.snackBar.open(
          `Sección "${nombre}" eliminada (${res?.deleted ?? count} doc(s))`,
          '', { duration: 3000, panelClass: 'snackbar-danger', verticalPosition: 'bottom', horizontalPosition: 'center' },
        );
      },
      error: (err) => {
        this.deleting.delete(nombre);
        this.snackBar.open(err.message || 'Error', '', { duration: 3000 });
      },
    });
  }
}
