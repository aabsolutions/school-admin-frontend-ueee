import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MisFotosStudentService, ProfilePhotos } from './mis-fotos.service';
import { CropDialogComponent, CropDialogResult } from './crop-dialog/crop-dialog.component';
import { ProfilePhotoService } from '@core/service/profile-photo.service';

@Component({
  selector: 'app-mis-fotos-student',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule,
    BreadcrumbComponent,
  ],
  templateUrl: './mis-fotos.component.html',
  styleUrls: ['./mis-fotos.component.scss'],
})
export class MisFotosStudentComponent implements OnInit {
  breadscrums = [
    { title: 'Mis Fotos', items: ['Estudiante'], active: 'Mis Fotos' },
  ];

  profile: ProfilePhotos | null = null;
  loading = true;
  loadError = false;
  uploadingCredencial = false;
  uploadingCuerpo = false;

  constructor(
    private service: MisFotosStudentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private profilePhotoService: ProfilePhotoService,
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  retry() {
    this.loading = true;
    this.loadError = false;
    this.profile = null;
    this.loadProfile();
  }

  private loadProfile() {
    this.service.getMe().subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.loading = false; this.loadError = true; },
    });
  }

  openCropper(type: 'credencial' | 'cuerpo') {
    const isCredencial = type === 'credencial';
    const ref = this.dialog.open(CropDialogComponent, {
      data: {
        title: isCredencial ? 'Foto tipo credencial' : 'Foto de cuerpo entero',
        aspectRatio: isCredencial ? 4 / 5 : 3 / 7,
        type,
        showMedidas: !isCredencial,
        peso: this.profile?.peso,
        talla: this.profile?.talla,
      },
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((result: CropDialogResult | undefined) => {
      if (!result) return;
      if (!this.profile) {
        this.snackBar.open('No se pudo identificar tu perfil. Recargá la página.', '', {
          duration: 4000, panelClass: 'snackbar-danger',
        });
        return;
      }
      this.upload(type, result);
    });
  }

  private upload(type: 'credencial' | 'cuerpo', result: CropDialogResult) {
    if (!this.profile) return;
    const isCredencial = type === 'credencial';
    if (isCredencial) this.uploadingCredencial = true;
    else this.uploadingCuerpo = true;

    this.service
      .uploadPhoto(this.profile._id, result.blob, `foto-${type}.jpg`, type, result.peso, result.talla)
      .subscribe({
        next: (updated) => {
          this.profile = updated;
          if (isCredencial) {
            this.uploadingCredencial = false;
            // Actualizar navbar y sidebar en tiempo real
            if (updated.img) this.profilePhotoService.update(updated.img);
          } else {
            this.uploadingCuerpo = false;
          }
          this.snackBar.open('Foto actualizada correctamente', '', {
            duration: 3000, panelClass: 'snackbar-success',
            verticalPosition: 'bottom', horizontalPosition: 'center',
          });
        },
        error: () => {
          if (isCredencial) this.uploadingCredencial = false;
          else this.uploadingCuerpo = false;
          this.snackBar.open('Error al subir la foto', '', {
            duration: 3000, panelClass: 'snackbar-danger',
          });
        },
      });
  }

  get credencialSrc(): string {
    return this.profile?.img || 'assets/images/user/user1.jpg';
  }

  get cuerpoSrc(): string {
    return this.profile?.imgCuerpoEntero || '';
  }
}
