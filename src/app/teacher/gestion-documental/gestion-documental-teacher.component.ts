import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';

interface ApiOne<T> { data: T }

interface DocumentoItem {
  _id: string;
  nombre: string;
  url: string;
  categoria: 'profesional' | 'planificacion';
  descripcion?: string;
  fecha: string;
}

interface DocumentalDocente {
  _id: string;
  teacherId: string;
  documentos: DocumentoItem[];
}

const API = `${environment.apiUrl}/documental-docente`;

@Component({
  selector: 'app-gestion-documental-teacher',
  templateUrl: './gestion-documental-teacher.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatDividerModule, MatSnackBarModule, MatTabsModule, MatTooltipModule,
  ],
})
export class GestionDocumentalTeacherComponent implements OnInit {
  breadscrums = [{ title: 'Mis Documentos', items: ['Docente'], active: 'Documentos Profesionales' }];

  loading = false;
  uploading = false;
  deletingId: string | null = null;

  record: DocumentalDocente | null = null;

  selectedFile: File | null = null;
  uploadNombre = '';
  uploadCategoria: 'profesional' | 'planificacion' = 'profesional';
  uploadDescripcion = '';

  get profesionales(): DocumentoItem[] {
    return (this.record?.documentos ?? []).filter(d => d.categoria === 'profesional');
  }

  get planificaciones(): DocumentoItem[] {
    return (this.record?.documentos ?? []).filter(d => d.categoria === 'planificacion');
  }

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.loadRecord(); }

  loadRecord() {
    this.loading = true;
    this.http.get<ApiOne<DocumentalDocente>>(`${API}/me`).pipe(map(r => r.data)).subscribe({
      next: record => { this.record = record; this.loading = false; },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar los documentos', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    if (this.selectedFile && !this.uploadNombre) {
      this.uploadNombre = this.selectedFile.name.replace(/\.[^/.]+$/, '');
    }
  }

  upload() {
    if (!this.selectedFile || !this.uploadNombre.trim()) {
      this.snackBar.open('Seleccioná un archivo y completá el nombre', '', {
        duration: 3000, panelClass: 'snackbar-danger',
      });
      return;
    }

    const fd = new FormData();
    fd.append('file', this.selectedFile);
    fd.append('nombre', this.uploadNombre.trim());
    fd.append('categoria', this.uploadCategoria);
    if (this.uploadDescripcion.trim()) fd.append('descripcion', this.uploadDescripcion.trim());

    this.uploading = true;
    this.http.post<ApiOne<DocumentalDocente>>(`${API}/me/documentos`, fd).pipe(map(r => r.data)).subscribe({
      next: updated => {
        this.record = updated;
        this.uploading = false;
        this.selectedFile = null;
        this.uploadNombre = '';
        this.uploadDescripcion = '';
        this.snackBar.open('Documento subido correctamente', '', {
          duration: 3000, panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Error al subir el documento', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  deleteDoc(docId: string) {
    if (!confirm('¿Eliminar este documento?')) return;
    this.deletingId = docId;
    this.http.delete<ApiOne<DocumentalDocente>>(`${API}/me/documentos/${docId}`).pipe(map(r => r.data)).subscribe({
      next: updated => {
        this.record = updated;
        this.deletingId = null;
        this.snackBar.open('Documento eliminado', '', {
          duration: 3000, panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.deletingId = null;
        this.snackBar.open('Error al eliminar el documento', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }

  openUrl(url: string) { window.open(url, '_blank'); }
}
