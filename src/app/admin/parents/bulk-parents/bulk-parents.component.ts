import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentsApiService, BulkParentResult } from '../parents-api.service';
import * as XLSX from 'xlsx';

export type RowStatus = 'ok' | 'dni-error' | 'duplicate';

interface PreviewRow {
  name: string;
  dni: string;
  email?: string;
  mobile?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  educationLevel?: string;
  status: RowStatus;
  statusMsg: string;
}

@Component({
  selector: 'app-bulk-parents',
  templateUrl: './bulk-parents.component.html',
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
})
export class BulkParentsComponent {
  breadscrums = [{ title: 'Importar Padres', items: ['Admin', 'Padres'], active: 'Importar masivo' }];

  preview: PreviewRow[] = [];
  result: BulkParentResult | null = null;
  isChecking = false;
  isSubmitting = false;
  parseError = '';

  displayedColumns = ['status', 'name', 'dni', 'email', 'mobile', 'gender'];
  resultFailedColumns = ['row', 'name', 'dni', 'error'];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  get okRows(): PreviewRow[]        { return this.preview.filter((r) => r.status === 'ok'); }
  get errorRows(): PreviewRow[]     { return this.preview.filter((r) => r.status === 'dni-error'); }
  get duplicateRows(): PreviewRow[] { return this.preview.filter((r) => r.status === 'duplicate'); }

  constructor(private api: ParentsApiService, private snackBar: MatSnackBar) {}

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.parseError = '';
    this.result = null;
    this.preview = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        this.parseSheet(rows);
      } catch {
        this.parseError = 'No se pudo leer el archivo. Asegurate de que sea un Excel válido (.xlsx/.xls).';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  private parseSheet(rows: any[][]) {
    if (!rows.length) { this.parseError = 'El archivo está vacío.'; return; }

    const firstCell = String(rows[0][0] ?? '').toLowerCase();
    const dataRows = (firstCell.includes('nombre') || firstCell.includes('name')) ? rows.slice(1) : rows;

    const parsed: PreviewRow[] = [];
    for (const cols of dataRows) {
      const name = String(cols[0] ?? '').trim();
      const rawDni = String(cols[1] ?? '').trim();
      if (!name && !rawDni) continue;

      const digits = rawDni.replace(/\D/g, '');
      let status: RowStatus = 'ok';
      let statusMsg = 'Listo para importar';

      if (!name) { status = 'dni-error'; statusMsg = 'Nombre vacío'; }
      else if (!rawDni) { status = 'dni-error'; statusMsg = 'Cédula vacía'; }
      else if (digits.length !== 10) { status = 'dni-error'; statusMsg = `Cédula inválida (${digits.length} dígitos, se requieren 10)`; }

      parsed.push({
        name: name || '(sin nombre)',
        dni: digits || rawDni,
        email: String(cols[2] ?? '').trim() || undefined,
        mobile: String(cols[3] ?? '').trim() || undefined,
        gender: this.mapGender(String(cols[4] ?? '').trim()),
        address: String(cols[5] ?? '').trim() || undefined,
        occupation: String(cols[6] ?? '').trim() || undefined,
        educationLevel: this.mapEducation(String(cols[7] ?? '').trim()),
        status,
        statusMsg,
      });
    }

    if (!parsed.length) {
      this.parseError = 'No se encontraron filas con datos.';
      return;
    }

    // Detect intra-file DNI duplicates
    const dniCount = new Map<string, number>();
    for (const r of parsed) {
      if (r.status === 'ok') dniCount.set(r.dni, (dniCount.get(r.dni) ?? 0) + 1);
    }
    for (const r of parsed) {
      if (r.status === 'ok' && (dniCount.get(r.dni) ?? 0) > 1) {
        r.status = 'dni-error';
        r.statusMsg = 'Cédula repetida dentro del archivo';
      }
    }

    this.preview = parsed;
    this.checkDbDuplicates();
  }

  private checkDbDuplicates() {
    const candidates = this.preview.filter((r) => r.status === 'ok');
    if (!candidates.length) return;

    const dnis = candidates.map((r) => r.dni);
    const emails = candidates.filter((r) => r.email).map((r) => r.email!);

    this.isChecking = true;
    this.api.checkBulkDuplicates(dnis, emails).subscribe({
      next: (res) => {
        const dniSet = new Set(res.duplicateDnis);
        const emailSet = new Set(res.duplicateEmails.map((e) => e.toLowerCase()));
        for (const row of this.preview) {
          if (row.status !== 'ok') continue;
          if (dniSet.has(row.dni)) {
            row.status = 'duplicate';
            row.statusMsg = 'Cédula ya registrada — se omitirá';
          } else if (row.email && emailSet.has(row.email.toLowerCase())) {
            row.status = 'duplicate';
            row.statusMsg = 'Email ya registrado — se omitirá';
          }
        }
        this.isChecking = false;
      },
      error: () => { this.isChecking = false; },
    });
  }

  private mapGender(val: string): string | undefined {
    if (!val) return undefined;
    const v = val.toLowerCase();
    if (v === 'masculino' || v === 'male' || v === 'm') return 'Male';
    if (v === 'femenino' || v === 'female' || v === 'f') return 'Female';
    if (v) return 'Other';
    return undefined;
  }

  private mapEducation(val: string): string | undefined {
    if (!val) return undefined;
    const map: Record<string, string> = {
      ninguna: 'Ninguna', primaria: 'Primaria', secundaria: 'Secundaria',
      superior: 'Superior', posgrado: 'Posgrado',
    };
    return map[val.toLowerCase()] ?? undefined;
  }

  downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['nombre', 'cedula', 'email', 'celular', 'genero', 'direccion', 'ocupacion', 'nivel_educativo'],
      ['Juan Pérez', '1234567890', 'juan@mail.com', '0991234567', 'Masculino', 'Calle 1', 'Docente', 'Superior'],
    ]);
    ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 25 }, { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Padres');
    XLSX.writeFile(wb, 'plantilla_padres.xlsx');
  }

  clearFile() {
    this.preview = [];
    this.result = null;
    this.parseError = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  submit() {
    const valid = this.okRows;
    if (!valid.length || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = valid.map((r) => ({
      name: r.name, dni: r.dni,
      email: r.email, mobile: r.mobile, gender: r.gender,
      address: r.address, occupation: r.occupation, educationLevel: r.educationLevel,
    }));

    this.api.bulkCreate(payload).subscribe({
      next: (res) => {
        this.result = res;
        this.isSubmitting = false;
        const msg = res.failureCount === 0
          ? `${res.successCount} padres registrados correctamente`
          : `${res.successCount} creados, ${res.failureCount} con errores`;
        this.snackBar.open(msg, '', {
          duration: 5000,
          panelClass: res.failureCount === 0 ? 'snackbar-success' : 'snackbar-warning',
        });
        this.preview = [];
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || 'Error al importar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }
}
