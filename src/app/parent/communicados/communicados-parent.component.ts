import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ParentApiService, Communicado } from '../services/parent-api.service';

@Component({
  selector: 'app-communicados-parent',
  templateUrl: './communicados-parent.component.html',
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatPaginatorModule],
})
export class CommunicadosParentComponent implements OnInit {
  displayedColumns = ['subject', 'teacher', 'student', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Communicado>();
  total = 0;
  isLoading = true;

  constructor(private api: ParentApiService) {}

  ngOnInit() {
    this.load();
  }

  load(page = 1) {
    this.isLoading = true;
    this.api.getCommunicados(page).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onPageChange(event: any) {
    this.load(event.pageIndex + 1);
  }
}
