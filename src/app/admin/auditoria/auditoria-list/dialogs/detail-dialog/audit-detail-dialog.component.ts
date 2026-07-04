import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  ],
})
export class AuditDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AuditDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AuditDetailDialogData,
  ) {}

  get hasChanges(): boolean {
    return !!this.data.entry.changes && Object.keys(this.data.entry.changes).length > 0;
  }
}
