import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MateriasService } from '../../materias.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData { id: string | number; nombre: string; codigo: string; }

@Component({
  selector: 'app-materia-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatDialogClose],
})
export class MateriaDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<MateriaDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public materiasService: MateriasService
  ) {}

  confirmDelete(): void {
    this.materiasService.delete(this.data.id).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error(err),
    });
  }
}
