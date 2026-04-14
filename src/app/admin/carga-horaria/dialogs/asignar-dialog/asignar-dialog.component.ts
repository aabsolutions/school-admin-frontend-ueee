import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { CargaHorariaService, MateriaItem, DisponiblesResponse } from '../../carga-horaria.service';

export interface AsignarDialogData {
  cursoLectivoId:    string;
  cursoDisplay:      string;
  academicYear:      string;
  docenteId:         string;
  docenteName:       string;
}

@Component({
  selector: 'app-asignar-dialog',
  templateUrl: './asignar-dialog.component.html',
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatCheckboxModule,
    MatIconModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatDividerModule, MatDialogContent, MatDialogClose,
  ],
})
export class AsignarDialogComponent implements OnInit {
  disponibles:  MateriaItem[] = [];
  selectedIds   = new Set<string>();
  isLoading     = true;
  isSaving      = false;
  searchTerm    = '';

  constructor(
    public dialogRef: MatDialogRef<AsignarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignarDialogData,
    private service: CargaHorariaService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.service.getDisponibles(this.data.cursoLectivoId, this.data.docenteId).subscribe({
      next: (res: DisponiblesResponse) => {
        this.disponibles = res.disponibles;
        this.selectedIds = new Set(res.asignadasAlDocente);
        this.isLoading   = false;
      },
      error: (err) => {
        this.snackBar.open(err.message, '', { duration: 4000, panelClass: 'snackbar-danger' });
        this.isLoading = false;
      },
    });
  }

  get filtered(): MateriaItem[] {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.disponibles;
    return this.disponibles.filter(m =>
      m.nombre.toLowerCase().includes(term) || (m.codigo ?? '').toLowerCase().includes(term)
    );
  }

  isSelected(m: MateriaItem): boolean {
    return this.selectedIds.has(m._id);
  }

  toggle(m: MateriaItem): void {
    this.selectedIds.has(m._id) ? this.selectedIds.delete(m._id) : this.selectedIds.add(m._id);
  }

  save(): void {
    this.isSaving = true;
    this.service.setAsignacion(
      this.data.cursoLectivoId,
      this.data.docenteId,
      Array.from(this.selectedIds),
    ).subscribe({
      next: () => { this.isSaving = false; this.dialogRef.close(true); },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.message, '', {
          duration: 5000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }
}
