import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AsistenciasService } from '@shared/services/asistencias.service';
import { AttendanceAssignment } from '@shared/services/asistencias.model';
import { Role } from '@core/models/role';

// ─── Dialog ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-assign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Asignar Registrador de Asistencia</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="assign-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Usuario</mat-label>
          <mat-select formControlName="userId">
            <mat-option *ngFor="let u of data.users" [value]="u._id">
              {{ u.name }} — {{ u.role }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Curso Lectivo</mat-label>
          <mat-select formControlName="cursoLectivoId">
            <mat-option *ngFor="let cl of data.cursoLectivos" [value]="cl._id">
              {{ cl.cursoId?.nivel }} {{ cl.cursoId?.paralelo }} — {{ cl.academicYear }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.assign-form { display:flex; flex-direction:column; gap:12px; min-width:360px; padding-top:8px; } .full-width { width:100%; }'],
})
export class AssignDialogComponent {
  form: FormGroup;

  constructor(
    public ref: MatDialogRef<AssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: any[]; cursoLectivos: any[] },
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      userId: [null, Validators.required],
      cursoLectivoId: [null, Validators.required],
    });
  }

  save() {
    if (this.form.valid) this.ref.close(this.form.value);
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

@Component({
  selector: 'app-attendance-config',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent,
  ],
  templateUrl: './attendance-config.component.html',
})
export class AttendanceConfigComponent implements OnInit {
  breadscrums = [
    { title: 'Asistencias', items: ['Admin'], active: 'Configuración' },
  ];

  displayedColumns = ['user', 'role', 'curso', 'year', 'active', 'actions'];
  dataSource = new MatTableDataSource<AttendanceAssignment>();
  isLoading = true;
  total = 0;

  private users: any[] = [];
  private cursoLectivos: any[] = [];

  constructor(
    private svc: AsistenciasService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadAssignments();
    this.svc.getUsers().subscribe((u) => (this.users = u));
    this.svc.getCursoLectivos().subscribe((cl) => (this.cursoLectivos = cl));
  }

  loadAssignments() {
    this.isLoading = true;
    this.svc.getAllAssignments().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openDialog() {
    const ref = this.dialog.open(AssignDialogComponent, {
      data: {
        users: this.users.filter(u => u.role !== Role.Teacher && u.role !== Role.Student && u.role !== Role.Parent),
        cursoLectivos: this.cursoLectivos,
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.svc.createAssignment(result.userId, result.cursoLectivoId).subscribe({
        next: () => {
          this.snack.open('Asignación guardada', 'OK', { duration: 3000 });
          this.loadAssignments();
        },
        error: (e) => this.snack.open(e.message, 'Cerrar', { duration: 4000 }),
      });
    });
  }

  delete(row: AttendanceAssignment) {
    this.svc.deleteAssignment(row._id).subscribe({
      next: () => {
        this.snack.open('Asignación eliminada', 'OK', { duration: 3000 });
        this.loadAssignments();
      },
      error: (e) => this.snack.open(e.message, 'Cerrar', { duration: 4000 }),
    });
  }

  cursoLabel(a: AttendanceAssignment): string {
    const c = a.cursoLectivoId?.cursoId;
    if (!c) return '—';
    return `${c.nivel} ${c.paralelo} (${c.jornada})`;
  }
}
