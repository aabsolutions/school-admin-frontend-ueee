import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditLogEntry } from '../../../audit.model';

export interface AuditDetailDialogData {
  entry: AuditLogEntry;
}

@Component({
  selector: 'app-audit-detail-dialog',
  standalone: true,
  templateUrl: './audit-detail-dialog.component.html',
  styleUrls: ['./audit-detail-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ],
})
export class AuditDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AuditDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AuditDetailDialogData,
  ) {}

  close() {
    this.dialogRef.close();
  }

  get hasChanges(): boolean {
    return !!this.data.entry.changes && Object.keys(this.data.entry.changes).length > 0;
  }
}
