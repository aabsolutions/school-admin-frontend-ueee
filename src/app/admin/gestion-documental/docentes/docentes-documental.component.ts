import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environments/environment';
import { DocumentalDocenteService } from './documental-docente.service';
import { DocumentosDocenteDialogComponent } from './dialogs/documentos-dialog/documentos-docente-dialog.component';

interface ApiList<T> { data: { data: T[]; total: number } }
interface TeacherRow {
  _id: string;
  name: string;
  dni: string;
  email: string;
  img: string;
}

const TEACHERS_API = `${environment.apiUrl}/teachers`;

@Component({
  selector: 'app-docentes-documental',
  templateUrl: './docentes-documental.component.html',
  imports: [
    CommonModule, FormsModule, BreadcrumbComponent,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
})
export class DocentesDocumentalComponent implements OnInit {
  breadscrums = [{ title: 'Gestión Documental', items: ['Admin'], active: 'Documentos Docentes' }];

  displayedColumns = ['teacher', 'dni', 'email', 'actions'];
  dataSource = new MatTableDataSource<TeacherRow>([]);

  searchTerm = '';
  isLoading  = true;
  total      = 0;

  private search$ = new Subject<string>();

  @ViewChild(MatSort)      set matSort(s: MatSort)           { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor(
    private http: HttpClient,
    private svc: DocumentalDocenteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadData();
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(term => { this.searchTerm = term; this.loadData(); });
  }

  loadData() {
    this.isLoading = true;
    let params = new HttpParams().set('limit', 200);
    if (this.searchTerm) params = params.set('search', this.searchTerm);

    this.http
      .get<ApiList<TeacherRow>>(TEACHERS_API, { params })
      .pipe(map(r => ({ data: r.data.data, total: r.data.total })))
      .subscribe({
        next: ({ data, total }) => {
          this.dataSource.data = data;
          this.total = total;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Error al cargar los docentes', '', {
            duration: 4000, panelClass: 'snackbar-danger',
          });
        },
      });
  }

  onSearch(value: string) { this.search$.next(value); }

  openDocumentos(teacher: TeacherRow) {
    this.svc.getByTeacher(teacher._id).subscribe({
      next: record => {
        this.dialog.open(DocumentosDocenteDialogComponent, {
          width: '680px',
          data: { record, teacherId: teacher._id, teacherName: teacher.name },
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar los documentos del docente', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
      },
    });
  }
}
