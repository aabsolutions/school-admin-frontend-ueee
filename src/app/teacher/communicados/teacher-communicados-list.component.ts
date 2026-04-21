import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CommunicadosApiService, TeacherCommunicado } from './communicados-api.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-teacher-communicados-list',
  templateUrl: './teacher-communicados-list.component.html',
  imports: [
    CommonModule, RouterLink, FormsModule,
    BreadcrumbComponent,
    MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
  ],
})
export class TeacherCommunicadosListComponent implements OnInit {
  breadscrums = [{ title: 'Comunicados', items: ['Docente'], active: 'Comunicados' }];
  displayedColumns = ['subject', 'student', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<TeacherCommunicado>();
  total = 0;
  pageIndex = 0;
  searchTerm = '';
  isLoading = true;

  private search$ = new Subject<string>();

  constructor(private api: CommunicadosApiService) {}

  ngOnInit() {
    this.load();
    this.search$.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  load() {
    this.isLoading = true;
    this.api.getMyCommunicados(this.pageIndex + 1, 10, this.searchTerm).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onSearch(value: string) {
    this.searchTerm = value;
    this.search$.next(value);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.load();
  }
}
