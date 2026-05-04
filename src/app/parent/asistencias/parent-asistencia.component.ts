import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ChartCard4Component } from '@shared/components/chart-card4/chart-card4.component';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { AttendanceStatus, ChildAttendanceSummary, STATUS_LABEL } from '@shared/services/asistencias.model';

// ─── Detail Dialog ────────────────────────────────────────────────────────────

@Component({
  selector: 'app-attendance-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.childName }} — {{ statusLabel }}</h2>
    <mat-dialog-content style="min-width:400px">
      @if (filteredRecords.length) {
        <table class="table table-sm">
          <thead>
            <tr><th>Fecha</th><th>Nota</th></tr>
          </thead>
          <tbody>
            @for (rec of filteredRecords; track rec.date) {
              <tr>
                <td>{{ rec.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ rec.note || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="text-muted text-center py-3">Sin registros recientes para este estado.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class AttendanceDetailDialogComponent {
  constructor(
    public ref: MatDialogRef<AttendanceDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      childName: string;
      status: AttendanceStatus;
      records: Array<{ date: string; status: AttendanceStatus; note: string }>;
    },
  ) {}

  get filteredRecords() {
    return this.data.records.filter(r => r.status === this.data.status);
  }

  get statusLabel(): string {
    return STATUS_LABEL[this.data.status];
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
    MatDialogModule,
    BreadcrumbComponent,
    ChartCard4Component,
  ],
  templateUrl: './parent-asistencia.component.html',
})
export class ParentAsistenciaComponent implements OnInit {
  breadscrums = [{ title: 'Asistencias', items: ['Representante'], active: 'Resumen' }];

  children: ChildAttendanceSummary[] = [];
  chartDataMap = new Map<string, number[]>();
  isLoading = true;
  readonly displayedColumns = ['date', 'status', 'note'];
  readonly statusLabel = STATUS_LABEL;

  readonly ATTENDANCE_LABELS = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];
  readonly ATTENDANCE_COLORS = ['#28a745', '#dc3545', '#ffc107', '#6c757d'];
  private readonly ATTENDANCE_KEYS: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

  constructor(
    private svc: AsistenciasService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.svc.getMyChildrenAttendance().subscribe({
      next: (data) => {
        this.children = data;
        data.forEach(child => {
          this.chartDataMap.set(child.studentId, [
            child.present, child.absent, child.late, child.excused ?? 0,
          ]);
        });
        this.isLoading = false;
      },
      error: (e) => {
        this.snack.open(e.message, 'Cerrar', { duration: 4000 });
        this.isLoading = false;
      },
    });
  }

  onSliceClick(child: ChildAttendanceSummary, statusIndex: number): void {
    this.dialog.open(AttendanceDetailDialogComponent, {
      data: {
        childName: child.name,
        status: this.ATTENDANCE_KEYS[statusIndex],
        records: child.recentRecords,
      },
      width: '480px',
    });
  }

  attendanceRate(child: ChildAttendanceSummary): number {
    const total = child.present + child.absent + child.late + (child.excused ?? 0);
    return total > 0 ? Math.round((child.present / total) * 100) : 100;
  }

  statusClass(status: string): string {
    return (
      { present: 'bg-success', absent: 'bg-danger', late: 'bg-warning text-dark', excused: 'bg-secondary' }[status] ?? ''
    );
  }
}
