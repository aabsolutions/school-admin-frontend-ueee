import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import * as XLSX from 'xlsx';
import { environment } from '@environments/environment';
import { EnrollmentService, BulkPreviewItem } from '../../enrollment.service';

@Component({
  selector: 'app-bulk-enrollment-dialog',
  templateUrl: './bulk-enrollment-dialog.component.html',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogContent, MatDialogClose,
    MatStepperModule, MatFormFieldModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatIconModule, MatTableModule, MatCheckboxModule,
    MatProgressSpinnerModule, MatChipsModule, MatTooltipModule,
  ],
})
export class BulkEnrollmentDialogComponent implements OnInit {
  step1Form: FormGroup;

  academicYears: string[] = [];
  allCursosLectivos: { id: string; label: string; academicYear: string }[] = [];
  filteredCursos: { id: string; label: string }[] = [];

  previewData: BulkPreviewItem[] = [];
  selection = new SelectionModel<BulkPreviewItem>(true, []);
  previewColumns = ['select', 'dni', 'name', 'status'];

  loadingPreview = false;
  loadingEnroll = false;
  previewError = '';
  fileName = '';

  get readyCount()    { return this.previewData.filter(r => r.status === 'ready').length; }
  get enrolledCount() { return this.previewData.filter(r => r.status === 'already_enrolled').length; }
  get notFoundCount() { return this.previewData.filter(r => r.status === 'not_found').length; }
  get selectedReady() { return this.selection.selected.filter(r => r.status === 'ready'); }

  constructor(
    public dialogRef: MatDialogRef<BulkEnrollmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient,
    private enrollmentService: EnrollmentService,
    private ngZone: NgZone,
  ) {
    this.step1Form = this.fb.group({
      academicYear:   ['', Validators.required],
      cursoLectivoId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/curso-lectivo?limit=500&status=active`).subscribe({
      next: r => {
        this.allCursosLectivos = r.data.data.map((cl: any) => {
          const c = cl.cursoId;
          const display = c
            ? `${c.nivel} - ${c.especialidad} - ${c.paralelo} - ${c.jornada}`
            : cl._id;
          return { id: cl._id ?? cl.id, label: display, academicYear: cl.academicYear };
        });
        this.academicYears = [...new Set(this.allCursosLectivos.map(c => c.academicYear))].sort().reverse();
      },
    });

    this.step1Form.get('academicYear')!.valueChanges.subscribe(year => {
      this.filteredCursos = this.allCursosLectivos
        .filter(c => c.academicYear === year)
        .map(c => ({ id: c.id, label: c.label }))
        .sort((a, b) => a.label.localeCompare(b.label));
      this.step1Form.patchValue({ cursoLectivoId: '' });
      this.previewData = [];
      this.selection.clear();
    });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fileName = file.name;
    this.previewError = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      this.ngZone.run(() => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (rows.length < 2) {
            this.previewError = 'El archivo no tiene datos. Verificá que tenga al menos una fila con DNIs.';
            return;
          }

          const header: string[] = (rows[0] as any[]).map(h => String(h).toLowerCase().trim());
          const dniIdx = header.findIndex(h => h.includes('dni') || h.includes('cedula') || h.includes('cédula'));
          const colIdx = dniIdx >= 0 ? dniIdx : 0;

          const dnis = rows.slice(1)
            .map(row => String((row as any[])[colIdx] ?? '').trim())
            .filter(Boolean);

          if (!dnis.length) {
            this.previewError = 'No se encontraron DNIs en el archivo.';
            return;
          }

          this.loadPreview(dnis);
        } catch (err) {
          this.previewError = 'Error al leer el archivo. Verificá que sea un Excel válido.';
        }
      });
    };
    reader.readAsArrayBuffer(file);
    (event.target as HTMLInputElement).value = '';
  }

  private loadPreview(dnis: string[]) {
    const cursoLectivoId = this.step1Form.value.cursoLectivoId;
    this.loadingPreview = true;
    this.previewData = [];
    this.selection.clear();

    this.enrollmentService.bulkPreview(cursoLectivoId, dnis).subscribe({
      next: items => {
        this.previewData = items;
        const readyItems = items.filter(i => i.status === 'ready');
        readyItems.forEach(i => this.selection.select(i));
        this.loadingPreview = false;
      },
      error: (err) => {
        this.previewError = err?.message ?? 'Error al consultar el servidor.';
        this.loadingPreview = false;
      },
    });
  }

  isAllReadySelected() {
    const ready = this.previewData.filter(r => r.status === 'ready');
    return ready.length > 0 && ready.every(r => this.selection.isSelected(r));
  }

  toggleAllReady() {
    const ready = this.previewData.filter(r => r.status === 'ready');
    if (this.isAllReadySelected()) {
      ready.forEach(r => this.selection.deselect(r));
    } else {
      ready.forEach(r => this.selection.select(r));
    }
  }

  confirm() {
    const studentIds = this.selectedReady.map(r => r.studentId!);
    if (!studentIds.length) return;

    this.loadingEnroll = true;
    const cursoLectivoId = this.step1Form.value.cursoLectivoId;

    this.enrollmentService.bulkEnroll(cursoLectivoId, studentIds).subscribe({
      next: result => {
        this.loadingEnroll = false;
        this.dialogRef.close(result);
      },
      error: () => { this.loadingEnroll = false; },
    });
  }

  downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['DNI'],
      ['1234567890'],
      ['0987654321'],
    ]);
    ws['!cols'] = [{ wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_matricula_masiva.xlsx');
  }

  onNoClick() { this.dialogRef.close(); }
}
