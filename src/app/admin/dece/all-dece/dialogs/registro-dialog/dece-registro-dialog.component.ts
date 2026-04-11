import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DeceService } from '../../dece.service';
import { DeceRegistro, DECE_TIPO_OPTIONS } from '../../dece.model';

export interface DeceRegistroDialogData {
  expedienteId: string;
  studentName:  string;
  registro?:    DeceRegistro; // present when editing
}

interface TeacherOption { id: string; name: string; }

@Component({
  selector: 'app-dece-registro-dialog',
  templateUrl: './dece-registro-dialog.component.html',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatDialogContent, MatDialogClose,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule,
  ],
})
export class DeceRegistroDialogComponent implements OnInit {
  form: UntypedFormGroup;
  readonly tipoOptions = DECE_TIPO_OPTIONS;
  teachers: TeacherOption[] = [];
  loadingTeachers = true;
  selectedFiles: File[] = [];
  uploading = false;

  get isEditMode(): boolean { return !!this.data.registro; }

  constructor(
    public dialogRef: MatDialogRef<DeceRegistroDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeceRegistroDialogData,
    private fb: UntypedFormBuilder,
    private svc: DeceService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    const reg = data.registro;
    this.form = this.fb.group({
      tipo:        [reg?.tipo        ?? '',         Validators.required],
      fecha:       [reg?.fecha ? new Date(reg.fecha) : new Date(), Validators.required],
      descripcion: [reg?.descripcion ?? '',         Validators.required],
      creadoPor:   [reg?.creadoPor   ?? '',         Validators.required],
    });
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/teachers?limit=200&sortBy=name&sortOrder=asc`)
      .subscribe({
        next: (res) => {
          this.teachers = (res.data?.data ?? []).map((t: any) => ({
            id:   t._id ?? t.id,
            name: t.name,
          }));
          this.loadingTeachers = false;
        },
        error: () => { this.loadingTeachers = false; },
      });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.selectedFiles = [...this.selectedFiles, ...Array.from(input.files)];
  }

  removeFile(index: number) { this.selectedFiles.splice(index, 1); }

  submit() {
    if (!this.form.valid) return;
    this.uploading = true;
    const { tipo, fecha, descripcion, creadoPor } = this.form.getRawValue();
    const fd = new FormData();
    fd.append('tipo',        tipo);
    fd.append('fecha',       (fecha as Date).toISOString());
    fd.append('descripcion', descripcion);
    fd.append('creadoPor',   creadoPor);
    this.selectedFiles.forEach(f => fd.append('files', f));

    const request$ = this.isEditMode
      ? this.svc.updateRegistro(this.data.expedienteId, this.data.registro!._id, fd)
      : this.svc.addRegistro(this.data.expedienteId, fd);

    request$.subscribe({
      next: (res) => { this.uploading = false; this.dialogRef.close(res); },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open(err.message || 'Error al guardar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onNoClick() { this.dialogRef.close(); }
}
