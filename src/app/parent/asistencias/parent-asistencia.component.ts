import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { ChildAttendanceSummary, STATUS_LABEL } from '@shared/services/asistencias.model';

@Component({
  selector: 'app-parent-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BreadcrumbComponent,
  ],
  templateUrl: './parent-asistencia.component.html',
})
export class ParentAsistenciaComponent implements OnInit {
  breadscrums = [{ title: 'Asistencias', items: ['Representante'], active: 'Resumen' }];

  children: ChildAttendanceSummary[] = [];
  isLoading = true;
  readonly displayedColumns = ['date', 'status', 'note'];
  readonly statusLabel = STATUS_LABEL;

  constructor(private svc: AsistenciasService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.svc.getMyChildrenAttendance().subscribe({
      next: (data) => {
        this.children = data;
        this.isLoading = false;
      },
      error: (e) => {
        this.snack.open(e.message, 'Cerrar', { duration: 4000 });
        this.isLoading = false;
      },
    });
  }

  attendanceRate(child: ChildAttendanceSummary): number {
    const total = child.present + child.absent + child.late;
    return total > 0 ? Math.round((child.present / total) * 100) : 100;
  }

  statusClass(status: string): string {
    return (
      { present: 'bg-success', absent: 'bg-danger', late: 'bg-warning text-dark', excused: 'bg-secondary' }[status] ?? ''
    );
  }
}
