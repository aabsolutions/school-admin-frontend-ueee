import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { NovedadesService } from '../../../novedades.service';
import { Novedad, getTipoConfig, cursoLectivoDisplay } from '../../../novedad.model';

export interface NovedadDetailDialogData {
  novedad: Novedad;
}

@Component({
  selector: 'app-novedad-detail-dialog',
  templateUrl: './novedad-detail-dialog.component.html',
  styleUrls: ['./novedad-detail-dialog.component.scss'],
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDividerModule,
  ],
})
export class NovedadDetailDialogComponent {
  readonly getTipoConfig = getTipoConfig;
  readonly cursoDisplay = cursoLectivoDisplay;

  get novedad(): Novedad { return this.data.novedad; }

  constructor(
    public dialogRef: MatDialogRef<NovedadDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NovedadDetailDialogData,
    private svc: NovedadesService,
  ) {}

  getFileUrl(path: string): string { return this.svc.getFileUrl(path); }
  isImage(path: string): boolean { return this.svc.isImage(path); }

  getFileName(path: string): string {
    return decodeURIComponent(path.split('/').pop() ?? path);
  }

  close() { this.dialogRef.close(); }
}
