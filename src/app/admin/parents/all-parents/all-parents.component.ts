import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ParentsApiService, Parent } from '../parents-api.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-all-parents',
  templateUrl: './all-parents.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BreadcrumbComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
})
export class AllParentsComponent implements OnInit {
  breadscrums = [{ title: 'Padres de Familia', items: ['Admin'], active: 'Padres' }];

  displayedColumns = ['name', 'email', 'dni', 'mobile', 'hijos', 'actions'];
  dataSource = new MatTableDataSource<Parent>();
  totalRecords = 0;
  pageIndex = 0;
  pageSize = 10;
  searchTerm = '';
  isLoading = false;

  private searchSubject = new Subject<string>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ParentsApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadData();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;
    this.api.getAll(this.pageIndex + 1, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.totalRecords = res.total;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al cargar padres', '', { duration: 3000, panelClass: 'snackbar-danger' });
      },
    });
  }

  onSearch(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  edit(id: string) {
    this.router.navigate(['/admin/parents/edit-parent', id]);
  }

  remove(id: string) {
    if (!confirm('¿Eliminár este padre de familia?')) return;
    this.api.remove(id).subscribe({
      next: () => {
        this.snackBar.open('Padre eliminado', '', { duration: 3000, panelClass: 'snackbar-success' });
        this.loadData();
      },
      error: () => this.snackBar.open('Error al eliminar', '', { duration: 3000, panelClass: 'snackbar-danger' }),
    });
  }
}
