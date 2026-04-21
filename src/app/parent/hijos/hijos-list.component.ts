import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ParentApiService, StudentSummary } from '../services/parent-api.service';

@Component({
  selector: 'app-hijos-list',
  templateUrl: './hijos-list.component.html',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
})
export class HijosListComponent implements OnInit {
  hijos: StudentSummary[] = [];
  isLoading = true;

  constructor(private api: ParentApiService) {}

  ngOnInit() {
    this.api.getHijos().subscribe({
      next: (data) => {
        this.hijos = data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      active: 'primary', inactive: 'warn', graduated: 'accent', suspended: 'warn',
    };
    return map[status] ?? 'default';
  }
}
