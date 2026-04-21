import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { ParentApiService, ParentProfile } from '../services/parent-api.service';

@Component({
  selector: 'app-parent-dashboard',
  templateUrl: './parent-dashboard.component.html',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule],
})
export class ParentDashboardComponent implements OnInit {
  profile: ParentProfile | null = null;
  unreadCommunicados = 0;
  isLoading = true;

  constructor(private api: ParentApiService) {}

  ngOnInit() {
    this.api.getMe().subscribe({
      next: (p) => {
        this.profile = p;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });

    this.api.getCommunicados(1, 50).subscribe({
      next: (res) => {
        this.unreadCommunicados = res.data?.filter((c: any) => c.status === 'sent').length ?? 0;
      },
    });
  }
}
