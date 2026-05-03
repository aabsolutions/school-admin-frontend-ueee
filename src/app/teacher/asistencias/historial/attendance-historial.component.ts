import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { AttendanceRecord } from '@shared/services/asistencias.model';

@Component({
  selector: 'app-attendance-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    BreadcrumbComponent,
  ],
  templateUrl: './attendance-historial.component.html',
})
export class AttendanceHistorialComponent implements OnInit {
  breadscrums = [{ title: 'Asistencias', items: ['Docente'], active: 'Historial' }];

  dateFrom = '';
  dateTo = '';
  displayedColumns = ['date', 'present', 'absent', 'late', 'excused'];
  dataSource = new MatTableDataSource<AttendanceRecord>();
  total = 0;
  pageIndex = 0;
  pageSize = 15;
  isLoading = false;
  expandedRow: AttendanceRecord | null = null;

  constructor(private svc: AsistenciasService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.svc
      .getMyRecords({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        dateFrom: this.dateFrom || undefined,
        dateTo: this.dateTo || undefined,
      } as any)
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.total = res.total;
          this.isLoading = false;
        },
        error: (e) => {
          this.snack.open(e.message, 'Cerrar', { duration: 4000 });
          this.isLoading = false;
        },
      });
  }

  onPageChange(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  countByStatus(record: AttendanceRecord, status: string): number {
    return record.records.filter((r) => r.status === status).length;
  }

  toggleRow(row: AttendanceRecord) {
    this.expandedRow = this.expandedRow === row ? null : row;
  }
}
