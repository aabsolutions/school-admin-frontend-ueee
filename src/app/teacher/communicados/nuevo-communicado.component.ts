import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CommunicadosApiService } from './communicados-api.service';
import { ParentsApiService, ParentSearchResult } from '../../admin/parents/parents-api.service';
import { StudentsService } from '../../admin/students/all-students/students.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-nuevo-communicado',
  templateUrl: './nuevo-communicado.component.html',
  imports: [
    CommonModule, RouterLink, FormsModule, ReactiveFormsModule,
    BreadcrumbComponent,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
    MatButtonModule, MatAutocompleteModule,
  ],
})
export class NuevoCommunicadoComponent implements OnInit {
  breadscrums = [{ title: 'Nuevo Comunicado', items: ['Docente', 'Comunicados'], active: 'Nuevo' }];
  form: FormGroup;
  isSaving = false;

  studentSearch = '';
  studentSuggestions: any[] = [];
  selectedStudent: any = null;
  parentOptions: ParentSearchResult[] = [];

  private studentSearch$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private api: CommunicadosApiService,
    private parentsApi: ParentsApiService,
    private studentsService: StudentsService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      studentId: ['', Validators.required],
      parentId:  ['', Validators.required],
      subject:   ['', [Validators.required, Validators.maxLength(200)]],
      body:      ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  ngOnInit() {
    this.studentSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => q ? this.studentsService.searchStudents(q) : of([])),
    ).subscribe((results: any[]) => {
      this.studentSuggestions = results;
    });
  }

  onStudentSearchInput(value: string) {
    this.studentSearch$.next(value);
  }

  selectStudent(student: any) {
    this.selectedStudent = student;
    this.form.patchValue({ studentId: student._id || student.id, parentId: '' });
    this.parentOptions = [];
    // Load parents for this student
    this.parentsApi.search('', student._id || student.id).subscribe({
      next: (parents) => { this.parentOptions = parents; },
    });
  }

  displayStudent(s: any): string {
    return s?.name ?? '';
  }

  onSubmit() {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;
    this.api.create(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Comunicado enviado', '', { duration: 3000, panelClass: 'snackbar-success' });
        this.router.navigate(['/teacher/communicados']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Error al enviar', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }
}
