import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DeceService } from '../../dece.service';
import { DeceRegistro } from '../../dece.model';

export interface DeceConfidencialPasswordDialogData {
  expedienteId: string;
  registroId: string;
}

@Component({
  selector: 'app-dece-confidencial-password-dialog',
  templateUrl: './dece-confidencial-password-dialog.component.html',
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule,
  ],
})
export class DeceConfidencialPasswordDialogComponent {
  password = '';
  verifying = false;
  errorMsg = '';

  constructor(
    public dialogRef: MatDialogRef<DeceConfidencialPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeceConfidencialPasswordDialogData,
    private svc: DeceService,
  ) {}

  submit(): void {
    if (!this.password || this.verifying) return;
    this.verifying = true;
    this.errorMsg = '';
    this.svc.revealRegistro(this.data.expedienteId, this.data.registroId, this.password).subscribe({
      next: (registro: DeceRegistro) => {
        this.verifying = false;
        this.dialogRef.close(registro);
      },
      error: (err) => {
        this.verifying = false;
        this.errorMsg = err?.status === 401
          ? 'Contraseña incorrecta'
          : (err?.message || 'Error al verificar la contraseña');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
