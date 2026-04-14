import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Curso } from '../../curso.model';
import { Materia } from '../../../../materias/all-materias/materia.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '@environments/environment';

export interface AsignarMateriasDialogData { curso: Curso; }

interface ApiList<T> { data: { data: T[] } }
interface ApiOne<T>  { data: T }

@Component({
  selector: 'app-asignar-materias',
  templateUrl: './asignar-materias.component.html',
  imports: [
    CommonModule, MatButtonModule, MatCheckboxModule, MatIconModule,
    MatProgressSpinnerModule, MatInputModule, MatFormFieldModule,
    FormsModule, MatDialogContent, MatDialogClose,
  ],
})
export class AsignarMateriasComponent implements OnInit {
  curso: Curso;
  allMaterias: Materia[] = [];
  selectedIds = new Set<string>();
  isLoading = true;
  isSaving = false;
  searchTerm = '';

  private readonly cursosUrl: string;
  private readonly materiasUrl: string;

  constructor(
    public dialogRef: MatDialogRef<AsignarMateriasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignarMateriasDialogData,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.curso = data.curso;
    this.cursosUrl = `${environment.apiUrl}/cursos`;
    this.materiasUrl = `${environment.apiUrl}/materias`;
  }

  ngOnInit(): void {
    forkJoin({
      all: this.http.get<ApiList<any>>(this.materiasUrl).pipe(
        map(r => r.data.data.filter((m: any) => m.status === 'active'))
      ),
      assigned: this.http.get<ApiOne<any[]>>(`${this.cursosUrl}/${this.curso.id}/materias`).pipe(
        map(r => r.data)
      ),
    }).subscribe({
      next: ({ all, assigned }) => {
        this.allMaterias = all.map((m: any) => new Materia({ ...m, id: m._id ?? m.id }));
        const assignedIds = new Set(
          (assigned || []).map((m: any) => (m._id ?? m.id ?? m).toString())
        );
        this.selectedIds = assignedIds;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  get filteredMaterias(): Materia[] {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.allMaterias;
    return this.allMaterias.filter(m =>
      m.nombre.toLowerCase().includes(term) || m.codigo.toLowerCase().includes(term)
    );
  }

  isSelected(materia: Materia): boolean {
    return this.selectedIds.has(materia.id.toString());
  }

  toggle(materia: Materia): void {
    const id = materia.id.toString();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  save(): void {
    this.isSaving = true;
    const materias = Array.from(this.selectedIds);
    this.http.put<ApiOne<any[]>>(`${this.cursosUrl}/${this.curso.id}/materias`, { materias }).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message ?? err.message ?? 'Error al guardar';
        return throwError(() => new Error(msg));
      })
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.message || 'Error al guardar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onNoClick(): void { this.dialogRef.close(); }
}
