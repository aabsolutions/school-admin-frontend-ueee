import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CursosService } from '../../cursos.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData { id: string | number; nivel: string; especialidad: string; paralelo: string; }

@Component({
  selector: 'app-curso-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatDialogClose],
})
export class CursoDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<CursoDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public cursosService: CursosService
  ) {}

  confirmDelete(): void {
    this.cursosService.delete(this.data.id).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error(err),
    });
  }
}
