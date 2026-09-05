import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { read, utils, writeFileXLSX } from 'xlsx';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface BulkUpdateFieldDef {
  key: string;
  label: string;
  type: 'string' | 'enum' | 'date' | 'boolean' | 'number';
  enum?: string[];
  example: string;
}

export interface BulkUpdatePreviewRow {
  dni: string;
  found: boolean;
  id?: string;
  name?: string;
  changes: { field: string; label: string; oldValue: any; newValue: any }[];
  hasChanges: boolean;
  error?: string;
}

export interface BulkUpdateResult {
  total: number;
  successCount: number;
  failureCount: number;
  updated: any[];
  failed: { row: number; data: any; error: string }[];
}

export interface BulkUpdateConfig {
  entityName: string;
  fieldCatalog: BulkUpdateFieldDef[];
  previewFn: (fields: string[], records: { dni: string; values: Record<string, any> }[]) => Observable<BulkUpdatePreviewRow[]>;
  applyFn: (records: { id: string; changes: Record<string, any> }[]) => Observable<BulkUpdateResult>;
}

@Component({
  selector: 'app-bulk-update-dialog',
  templateUrl: './bulk-update-dialog.component.html',
  styleUrls: ['./bulk-update-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class BulkUpdateDialogComponent {
  step: 'select-fields' | 'upload' | 'preview' | 'result' = 'select-fields';

  selectedKeys = new Set<string>();
  fileName = '';
  parseError = '';
  parsedRows: { dni: string; values: Record<string, any> }[] = [];
  previewRows: BulkUpdatePreviewRow[] = [];
  isLoadingPreview = false;
  isSubmitting = false;
  result: BulkUpdateResult | null = null;

  constructor(
    public dialogRef: MatDialogRef<BulkUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: BulkUpdateConfig,
  ) {}

  get selectedFieldDefs(): BulkUpdateFieldDef[] {
    return this.config.fieldCatalog.filter((f) => this.selectedKeys.has(f.key));
  }

  get canProceedToUpload(): boolean {
    return this.selectedKeys.size > 0;
  }

  get applicableRows(): BulkUpdatePreviewRow[] {
    return this.previewRows.filter((r) => r.found && r.hasChanges && !r.error);
  }

  get excludedCount(): number {
    return this.previewRows.length - this.applicableRows.length;
  }

  toggleField(key: string): void {
    if (this.selectedKeys.has(key)) this.selectedKeys.delete(key);
    else this.selectedKeys.add(key);
  }

  isFieldSelected(key: string): boolean {
    return this.selectedKeys.has(key);
  }

  goToUpload(): void {
    if (this.canProceedToUpload) this.step = 'upload';
  }

  downloadTemplate(): void {
    const headers = ['Cédula', ...this.selectedFieldDefs.map((f) => f.label)];
    const example = ['1234567890', ...this.selectedFieldDefs.map((f) => f.example)];
    const ws = utils.aoa_to_sheet([headers, example]);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Plantilla');
    writeFileXLSX(wb, `plantilla_actualizacion_${this.config.entityName.toLowerCase().replace(/\s/g, '_')}.xlsx`);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.fileName = file.name;
    this.parseError = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[][] = utils.sheet_to_json(sheet, { header: 1, raw: false });

        if (rawRows.length < 2) {
          this.parseError = 'El archivo no contiene datos. Verifica que haya al menos una fila de datos.';
          return;
        }

        const headerRow = (rawRows[0] as string[]).map((h) => String(h).trim());
        const dniIdx = headerRow.findIndex((h) => h === 'Cédula');
        if (dniIdx < 0) {
          this.parseError = 'La plantilla debe incluir la columna "Cédula".';
          return;
        }

        const dataRows = rawRows.slice(1).filter((r) => r.some((c) => c !== '' && c != null));

        this.parsedRows = dataRows
          .map((row) => {
            const values: Record<string, any> = {};
            this.selectedFieldDefs.forEach((f) => {
              const idx = headerRow.findIndex((h) => h === f.label);
              if (idx >= 0 && row[idx] !== '' && row[idx] != null) values[f.key] = row[idx];
            });
            return { dni: String(row[dniIdx] ?? '').trim(), values };
          })
          .filter((r) => r.dni);

        if (!this.parsedRows.length) {
          this.parseError = 'No se encontraron filas con Cédula.';
          return;
        }

        this.requestPreview();
      } catch {
        this.parseError = 'Error al leer el archivo. Asegurate de que sea un .xlsx válido.';
      }
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  }

  requestPreview(): void {
    this.step = 'preview';
    this.isLoadingPreview = true;
    this.previewRows = [];
    const fields = this.selectedFieldDefs.map((f) => f.key);
    this.config.previewFn(fields, this.parsedRows).subscribe({
      next: (rows) => {
        this.previewRows = rows;
        this.isLoadingPreview = false;
      },
      error: (err) => {
        this.isLoadingPreview = false;
        this.parseError = err?.error?.message ?? 'Error al generar la previsualización.';
        this.step = 'upload';
      },
    });
  }

  rowStatusLabel(row: BulkUpdatePreviewRow): string {
    if (row.error) return row.error;
    if (!row.found) return 'DNI no encontrado';
    if (!row.hasChanges) return 'Sin cambios';
    return 'Se actualizará';
  }

  submitUpdate(): void {
    const records = this.applicableRows.map((row) => ({
      id: row.id!,
      changes: Object.fromEntries(row.changes.map((c) => [c.field, c.newValue])),
    }));
    this.isSubmitting = true;
    this.config.applyFn(records).subscribe({
      next: (result) => {
        this.result = result;
        this.step = 'result';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.parseError = err?.error?.message ?? 'Error al actualizar. Intenta de nuevo.';
        this.isSubmitting = false;
      },
    });
  }

  downloadErrorReport(): void {
    if (!this.result?.failed?.length) return;
    const rows = this.result.failed.map((f) => ({
      Fila: f.row,
      ...f.data,
      Error: f.error,
    }));
    const ws = utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 20 }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Errores');
    writeFileXLSX(wb, `errores_actualizacion_${this.config.entityName.toLowerCase().replace(/\s/g, '_')}.xlsx`);
  }

  goBackToFields(): void {
    this.step = 'select-fields';
    this.fileName = '';
    this.parsedRows = [];
    this.previewRows = [];
    this.parseError = '';
  }

  goBackToUpload(): void {
    this.step = 'upload';
    this.fileName = '';
    this.parsedRows = [];
    this.previewRows = [];
    this.parseError = '';
  }

  close(): void {
    this.dialogRef.close(this.result);
  }
}
