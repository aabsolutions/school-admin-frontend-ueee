import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AuditService } from '../audit.service';
import { AuditLogEntry, AuditOutcome, AuditPlatform } from '../audit.model';
import { AuditDetailDialogComponent } from './dialogs/detail-dialog/audit-detail-dialog.component';

@Component({
  selector: 'app-auditoria-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    BreadcrumbComponent,
  ],
  templateUrl: './auditoria-list.component.html',
  styleUrls: ['./auditoria-list.component.scss'],
})
export class AuditoriaListComponent implements OnInit {
  breadscrums = [{ title: 'Auditoría', items: ['Administración'], active: 'Auditoría' }];

  displayedColumns = ['timestamp', 'actor', 'action', 'target', 'platform', 'outcome', 'ip'];
  dataSource = new MatTableDataSource<AuditLogEntry>([]);

  total = 0;
  pageIndex = 0;
  pageSize = 25;
  readonly pageSizeOptions = [10, 25, 50, 100];
  loading = false;

  // Filters — only applied when "Buscar" is pressed (not reactive).
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  actorId = '';
  action: string | null = null;
  platform: AuditPlatform | null = null;
  outcome: AuditOutcome | null = null;

  readonly platformOptions: AuditPlatform[] = ['web', 'mobile', 'system'];
  readonly outcomeOptions: AuditOutcome[] = ['success', 'rejected', 'error'];

  // Known action values emitted by the backend today (auth, users, role-config,
  // students/parents/teachers bulk import, tramitologia). `action` is a free-text
  // field server-side, so this list is a convenience shortlist, not an enum.
  readonly actionOptions = [
    'auth.login',
    'user.role_change',
    'user.password_reset',
    'role_config.created',
    'role_config.updated',
    'role_config.deleted',
    'student.bulk_import',
    'parent.bulk_import',
    'teacher.bulk_import',
    'tramite.transition',
    'tramite.attachment_uploaded',
  ];

  constructor(
    private auditService: AuditService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.auditService
      .getAuditLogs({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        actorId: this.actorId.trim() || undefined,
        action: this.action || undefined,
        platform: this.platform || undefined,
        outcome: this.outcome || undefined,
        dateFrom: this.dateFrom ? this.dateFrom.toISOString() : undefined,
        dateTo: this.dateTo ? this.dateTo.toISOString() : undefined,
      })
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.total = res.total;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(
            err?.error?.message ?? 'Error al cargar la auditoría',
            'Cerrar',
            { duration: 3000 },
          );
        },
      });
  }

  search() {
    this.pageIndex = 0;
    this.load();
  }

  onPageChange(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  openDetail(row: AuditLogEntry) {
    this.dialog.open(AuditDetailDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { entry: row },
    });
  }

  getOutcomeClass(outcome: AuditOutcome): string {
    switch (outcome) {
      case 'success':
        return 'chip-success';
      case 'rejected':
        return 'chip-rejected';
      case 'error':
        return 'chip-error';
      default:
        return '';
    }
  }
}
