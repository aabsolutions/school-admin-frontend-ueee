import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle,
  MatDialogContent, MatDialogActions, MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AreaEstudioService } from '../../area-estudio.service';

@Component({
  selector: 'app-area-estudio-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatDialogClose],
})
export class AreaEstudioDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<AreaEstudioDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string | number; nombre: string },
    private service: AreaEstudioService,
    private snackBar: MatSnackBar,
  ) {}

  confirmDelete(): void {
    this.service.delete(this.data.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.snackBar.open(err.message || 'Error al eliminar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
        this.dialogRef.close(false);
      },
    });
  }
}
