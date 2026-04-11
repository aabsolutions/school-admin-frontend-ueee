import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CursoLectivoService } from '../../curso-lectivo.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData { id: string | number; cursoDisplay: string; academicYear: string; }

@Component({
  selector: 'app-curso-lectivo-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatDialogClose],
})
export class CursoLectivoDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<CursoLectivoDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: CursoLectivoService
  ) {}

  confirmDelete(): void {
    this.service.delete(this.data.id).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error(err),
    });
  }
}
