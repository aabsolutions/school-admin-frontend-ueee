import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { read, utils, writeFileXLSX } from 'xlsx';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface BulkImportColumn {
  key: string;
  label: string;
  required: boolean;
  example: string;
}

export interface BulkImportConfig {
  entityName: string;
  columns: BulkImportColumn[];
  submitFn: (rows: Record<string, any>[]) => Observable<any>;
}

export interface BulkImportResult {
  total: number;
  successCount: number;
  failureCount: number;
  created: any[];
  failed: { row: number; data: any; error: string }[];
}

@Component({
  selector: 'app-bulk-import-dialog',
  templateUrl: './bulk-import-dialog.component.html',
  styleUrls: ['./bulk-import-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
  ],
})
export class BulkImportDialogComponent {
  step: 'upload' | 'preview' | 'result' = 'upload';
  parsedRows: Record<string, any>[] = [];
  invalidRowIndices: Set<number> = new Set();
  result: BulkImportResult | null = null;
  isSubmitting = false;
  fileName = '';
  parseError = '';

  previewColumns: string[] = [];
  get displayedColumns(): string[] { return [...this.previewColumns, '_status']; }

  constructor(
    public dialogRef: MatDialogRef<BulkImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: BulkImportConfig,
  ) {
    this.previewColumns = this.config.columns.map(c => c.key);
  }

  downloadTemplate(): void {
    const headers = this.config.columns.map(c =>
      c.required ? `${c.label} *` : c.label
    );
    const example = this.config.columns.map(c => c.example);
    const ws = utils.aoa_to_sheet([headers, example]);
    ws['!cols'] = this.config.columns.map(() => ({ wch: 20 }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Plantilla');
    writeFileXLSX(wb, `plantilla_${this.config.entityName.toLowerCase().replace(/\s/g, '_')}.xlsx`);
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

        const headerRow = (rawRows[0] as string[]).map(h =>
          String(h).replace(' *', '').trim()
        );
        const dataRows = rawRows.slice(1).filter(r =>
          r.some(c => c !== '' && c != null)
        );

        this.parsedRows = dataRows.map(row => {
          const obj: Record<string, any> = {};
          this.config.columns.forEach(col => {
            const idx = headerRow.findIndex(h => h === col.label);
            obj[col.key] = idx >= 0 ? (row[idx] ?? '') : '';
          });
          return obj;
        });

        this.invalidRowIndices = new Set(
          this.parsedRows
            .map((row, i) => {
              const missing = this.config.columns.filter(c => c.required && !String(row[c.key] ?? '').trim());
              return missing.length > 0 ? i : -1;
            })
            .filter(i => i >= 0)
        );

        this.step = 'preview';
      } catch {
        this.parseError = 'Error al leer el archivo. Asegurate de que sea un .xlsx válido.';
      }
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  }

  getColumnLabel(key: string): string {
    return this.config.columns.find(c => c.key === key)?.label ?? key;
  }

  isRowInvalid(index: number): boolean {
    return this.invalidRowIndices.has(index);
  }

  get validRows(): Record<string, any>[] {
    return this.parsedRows.filter((_, i) => !this.invalidRowIndices.has(i));
  }

  submitImport(): void {
    this.isSubmitting = true;
    const cleaned = this.validRows.map(row => {
      const obj: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        if (v !== '' && v != null) obj[k] = v;
      }
      return obj;
    });
    this.config.submitFn(cleaned).subscribe({
      next: (result) => {
        this.result = result;
        this.step = 'result';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.parseError = err?.message ?? 'Error al importar. Intenta de nuevo.';
        this.isSubmitting = false;
      },
    });
  }

  downloadErrorReport(): void {
    if (!this.result?.failed?.length) return;
    const rows = this.result.failed.map(f => ({
      Fila: f.row,
      ...f.data,
      Error: f.error,
    }));
    const ws = utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 20 }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Errores');
    writeFileXLSX(wb, `errores_importacion_${this.config.entityName.toLowerCase().replace(/\s/g, '_')}.xlsx`);
  }

  goBack(): void {
    this.step = 'upload';
    this.parsedRows = [];
    this.invalidRowIndices.clear();
    this.fileName = '';
    this.parseError = '';
  }

  close(): void {
    this.dialogRef.close(this.result);
  }
}
