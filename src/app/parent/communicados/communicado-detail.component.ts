import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParentApiService, Communicado } from '../services/parent-api.service';

@Component({
  selector: 'app-communicado-detail',
  templateUrl: './communicado-detail.component.html',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
})
export class CommunicadoDetailComponent implements OnInit {
  communicado: Communicado | null = null;
  isLoading = true;
  isMarking = false;

  constructor(
    private api: ParentApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.api.getCommunicado(id).subscribe({
      next: (c) => { this.communicado = c; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  markReceived() {
    if (!this.communicado || this.isMarking) return;
    this.isMarking = true;
    this.api.markReceived(this.communicado._id).subscribe({
      next: (updated) => {
        this.communicado = updated;
        this.isMarking = false;
        this.snackBar.open('Comunicado marcado como recibido', '', {
          duration: 3000, panelClass: 'snackbar-success',
        });
      },
      error: () => {
        this.isMarking = false;
        this.snackBar.open('Error al marcar', '', { duration: 3000, panelClass: 'snackbar-danger' });
      },
    });
  }
}
