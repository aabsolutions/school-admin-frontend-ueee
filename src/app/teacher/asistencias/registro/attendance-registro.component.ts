import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AsistenciasService } from '@shared/services/asistencias.service';
import {
  AttendanceAssignment,
  AttendanceEntry,
  AttendanceStatus,
  StudentBasic,
} from '@shared/services/asistencias.model';

interface StudentRow extends StudentBasic {
  status: AttendanceStatus;
  note: string;
}

@Component({
  selector: 'app-attendance-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    BreadcrumbComponent,
  ],
  templateUrl: './attendance-registro.component.html',
})
export class AttendanceRegistroComponent implements OnInit {
  breadscrums = [{ title: 'Asistencias', items: ['Docente'], active: 'Registro' }];

  assignment: AttendanceAssignment | null = null;
  students: StudentRow[] = [];
  selectedDate = this.todayStr();
  isLoading = true;
  isSaving = false;
  noAssignment = false;
  lastSaveResult: { absentCount: number } | null = null;

  readonly statusOptions: { value: AttendanceStatus; label: string }[] = [
    { value: 'present', label: 'Presente' },
    { value: 'absent', label: 'Ausente' },
    { value: 'late', label: 'Tardanza' },
    { value: 'excused', label: 'Justificado' },
  ];

  constructor(private svc: AsistenciasService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadAssignment();
  }

  loadAssignment() {
    this.isLoading = true;
    this.svc.getMyAssignment().subscribe({
      next: (a: any) => {
        this.assignment = a;
        this.students = (a.students ?? []).map((s: StudentBasic) => ({
          ...s,
          status: 'present' as AttendanceStatus,
          note: '',
        }));
        this.loadExistingRecord();
      },
      error: () => {
        this.noAssignment = true;
        this.isLoading = false;
      },
    });
  }

  loadExistingRecord() {
    if (!this.assignment) { this.isLoading = false; return; }
    const cl = (this.assignment.cursoLectivoId as any)?._id ?? this.assignment.cursoLectivoId;
    this.svc
      .getMyRecords({ page: 1, limit: 1, dateFrom: this.selectedDate, dateTo: this.selectedDate })
      .subscribe({
        next: (res) => {
          if (res.data.length) {
            const rec = res.data[0];
            this.students = this.students.map((s) => {
              const entry = rec.records.find((r: AttendanceEntry) => r.studentId === s._id);
              return entry ? { ...s, status: entry.status, note: entry.note ?? '' } : s;
            });
          }
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  onDateChange() {
    this.students = this.students.map((s) => ({ ...s, status: 'present', note: '' }));
    this.loadExistingRecord();
  }

  save() {
    if (!this.assignment) return;
    const cl = (this.assignment.cursoLectivoId as any)?._id ?? this.assignment.cursoLectivoId as any;
    this.isSaving = true;
    this.svc
      .saveAttendance({
        cursoLectivoId: cl,
        date: this.selectedDate,
        records: this.students.map((s) => ({
          studentId: s._id,
          status: s.status,
          note: s.note,
        })),
      })
      .subscribe({
        next: (res) => {
          this.lastSaveResult = res;
          this.isSaving = false;
          this.snack.open(
            `Asistencia guardada. Ausentes: ${res.absentCount}${res.absentCount ? ' (comunicados enviados)' : ''}`,
            'OK',
            { duration: 5000 },
          );
        },
        error: (e) => {
          this.snack.open(e.message, 'Cerrar', { duration: 4000 });
          this.isSaving = false;
        },
      });
  }

  get absentCount(): number {
    return this.students.filter((s) => s.status === 'absent').length;
  }

  get presentCount(): number {
    return this.students.filter((s) => s.status === 'present').length;
  }

  cursoLabel(): string {
    const cl = this.assignment?.cursoLectivoId as any;
    if (!cl) return '';
    const c = cl.cursoId;
    return c ? `${c.nivel} ${c.paralelo} (${c.jornada}) — ${cl.academicYear}` : cl.academicYear;
  }

  todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }
}
