import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { StudentAttendanceSummary } from '@shared/services/asistencias.model';

export interface DetalleEstudiantesDialogData {
  cursoLabel: string;
  students: StudentAttendanceSummary[];
}

@Component({
  selector: 'app-detalle-estudiantes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './detalle-estudiantes-dialog.component.html',
})
export class DetalleEstudiantesDialogComponent {
  displayedColumns = ['name', 'absent', 'late', 'excused'];
  students: StudentAttendanceSummary[];

  constructor(
    public dialogRef: MatDialogRef<DetalleEstudiantesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleEstudiantesDialogData,
  ) {
    this.students = data.students
      .filter((s) => s.absent > 0 || s.late > 0 || s.excused > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}
