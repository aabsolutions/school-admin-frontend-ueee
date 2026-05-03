import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { StudentHistoryEntry, AttendanceStatus, STATUS_LABEL } from '@shared/services/asistencias.model';

@Component({
  selector: 'app-student-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BreadcrumbComponent,
  ],
  templateUrl: './student-asistencia.component.html',
})
export class StudentAsistenciaComponent implements OnInit {
  breadscrums = [{ title: 'Mi Asistencia', items: ['Estudiante'], active: 'Historial' }];

  displayedColumns = ['date', 'status', 'note'];
  dataSource = new MatTableDataSource<StudentHistoryEntry>();
  total = 0;
  pageIndex = 0;
  pageSize = 20;
  isLoading = false;

  present = 0;
  absent = 0;
  late = 0;

  readonly statusLabel = STATUS_LABEL;

  private studentId = '';

  constructor(
    private svc: AsistenciasService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.svc.getMyStudentProfile().subscribe({
      next: (profile) => {
        this.studentId = profile._id;
        this.load();
      },
      error: (e) => this.snack.open(e.message, 'Cerrar', { duration: 4000 }),
    });
  }

  load() {
    this.isLoading = true;
    this.svc
      .getStudentHistory(this.studentId, { page: this.pageIndex + 1, limit: this.pageSize })
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.total = res.total;
          this.computeStats(res.data);
          this.isLoading = false;
        },
        error: (e) => {
          this.snack.open(e.message, 'Cerrar', { duration: 4000 });
          this.isLoading = false;
        },
      });
  }

  private computeStats(data: StudentHistoryEntry[]) {
    this.present = data.filter((d) => d.entry?.status === 'present').length;
    this.absent = data.filter((d) => d.entry?.status === 'absent').length;
    this.late = data.filter((d) => d.entry?.status === 'late').length;
  }

  get attendanceRate(): number {
    const total = this.present + this.absent + this.late;
    return total > 0 ? Math.round((this.present / total) * 100) : 100;
  }

  onPageChange(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  statusClass(status: string): string {
    return { present: 'bg-success', absent: 'bg-danger', late: 'bg-warning text-dark', excused: 'bg-secondary' }[status] ?? '';
  }

  getStatusLabel(status: AttendanceStatus | undefined): string {
    if (!status) return '';
    return STATUS_LABEL[status];
  }
}
