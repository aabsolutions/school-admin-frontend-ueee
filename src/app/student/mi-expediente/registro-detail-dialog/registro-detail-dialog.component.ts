import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TIPO_CONFIG } from '../../../admin/expedientes/all-expedientes/expediente.model';

export interface RegistroDetailData {
  tipo: string;
  fecha: string;
  descripcion: string;
  creadoPor: string;
  evidenciasUrls: string[];
}

@Component({
  selector: 'app-registro-detail-dialog',
  templateUrl: './registro-detail-dialog.component.html',
  styleUrls: ['./registro-detail-dialog.component.scss'],
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatTooltipModule,
  ],
})
export class RegistroDetailDialogComponent {
  readonly tipoConfig = TIPO_CONFIG;

  constructor(
    public dialogRef: MatDialogRef<RegistroDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RegistroDetailData,
  ) {}

  getTipoClass(tipo: string): string {
    return this.tipoConfig[tipo]?.color ?? 'badge-solid-default';
  }

  getTipoIcon(tipo: string): string {
    return this.tipoConfig[tipo]?.icon ?? 'info';
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  }

  getFileName(url: string): string {
    return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? url);
  }
}
