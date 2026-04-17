import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

export interface CropDialogData {
  title: string;
  aspectRatio: number;
  type: 'credencial' | 'cuerpo';
  showMedidas?: boolean;
  peso?: number;
  talla?: number;
}

export interface CropDialogResult {
  blob: Blob;
  peso?: number;
  talla?: number;
}

@Component({
  selector: 'app-crop-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    ImageCropperComponent,
  ],
  template: `
    <div class="crop-dialog-container">
      <h2 mat-dialog-title class="crop-title">
        <mat-icon>crop</mat-icon> {{ data.title }}
      </h2>

      <mat-dialog-content class="crop-content">
        @if (!imageFile && !imageChangedEvent) {
          <div class="drop-zone" (click)="fileInput.click()"
               (dragover)="$event.preventDefault()"
               (drop)="onDrop($event)">
            <mat-icon class="drop-icon">add_photo_alternate</mat-icon>
            <p>Arrastrá una imagen o hacé click para seleccionar</p>
            <span class="drop-hint">JPG, PNG o WEBP · máx. 5 MB</span>
          </div>
        }

        @if (imageFile || imageChangedEvent) {
          <div class="cropper-wrapper">
            @if (imageLoadError) {
              <div style="text-align:center; padding: 32px; color: #ef4444;">
                <mat-icon style="font-size:40px; width:40px; height:40px;">broken_image</mat-icon>
                <p style="margin: 8px 0 4px;">No se pudo cargar la imagen.</p>
                <small>Probá con otro archivo (JPG, PNG o WEBP).</small>
              </div>
            } @else {
              <image-cropper
                [imageChangedEvent]="imageChangedEvent"
                [imageFile]="imageFile ?? undefined"
                [maintainAspectRatio]="true"
                [aspectRatio]="data.aspectRatio"
                [resizeToWidth]="data.type === 'credencial' ? 600 : 480"
                format="jpeg"
                output="blob"
                (imageCropped)="onCropped($event)"
                (loadImageFailed)="onLoadFailed()"
              />
            }
          </div>
        }

        @if (data.showMedidas) {
          <div class="medidas-row">
            <mat-form-field appearance="outline" class="medida-field">
              <mat-label>Peso (kg)</mat-label>
              <input matInput type="number" min="0" max="300" [(ngModel)]="peso" placeholder="ej: 65">
              <mat-icon matSuffix>monitor_weight</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="medida-field">
              <mat-label>Talla (cm)</mat-label>
              <input matInput type="number" min="0" max="250" [(ngModel)]="talla" placeholder="ej: 170">
              <mat-icon matSuffix>height</mat-icon>
            </mat-form-field>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        @if (imageFile || imageChangedEvent) {
          <button mat-button (click)="reset()">
            <mat-icon>refresh</mat-icon> Cambiar imagen
          </button>
        }
        <button mat-raised-button color="primary" [disabled]="!croppedBlob"
                (click)="confirm()">
          <mat-icon>check</mat-icon> Confirmar
        </button>
      </mat-dialog-actions>
    </div>

    <input #fileInput type="file" accept="image/jpeg,image/png,image/webp"
           style="display:none" (change)="onFileChange($event)">
  `,
  styles: [`
    .crop-dialog-container { min-width: 520px; }
    .crop-title { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; }
    .crop-content { overflow: visible !important; }

    .drop-zone {
      border: 2px dashed rgba(99,102,241,0.5);
      border-radius: 16px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      background: rgba(99,102,241,0.04);
      transition: all .2s;
    }
    .drop-zone:hover {
      border-color: #6366f1;
      background: rgba(99,102,241,0.08);
    }
    .drop-icon { font-size: 48px; width: 48px; height: 48px; color: #6366f1; }
    .drop-zone p { margin: 12px 0 4px; font-size: 1rem; color: #374151; }
    .drop-hint { font-size: .8rem; color: #9ca3af; }

    .cropper-wrapper { max-height: 380px; overflow: hidden; border-radius: 12px; }

    .medidas-row {
      display: flex; gap: 16px; margin-top: 16px;
    }
    .medida-field { flex: 1; }
  `],
})
export class CropDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imageChangedEvent: Event | null = null;
  imageFile: File | null = null;
  croppedBlob: Blob | null = null;
  imageLoadError = false;
  peso: number | null;
  talla: number | null;

  constructor(
    public dialogRef: MatDialogRef<CropDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CropDialogData,
  ) {
    this.peso = data.peso ?? null;
    this.talla = data.talla ?? null;
  }

  onFileChange(event: Event) {
    this.imageFile = null;
    this.imageChangedEvent = event;
    this.croppedBlob = null;
    this.imageLoadError = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.imageChangedEvent = null;
    this.imageFile = file;
    this.croppedBlob = null;
    this.imageLoadError = false;
  }

  onCropped(event: ImageCroppedEvent) {
    if (event.blob) this.croppedBlob = event.blob;
  }

  onLoadFailed() {
    this.imageLoadError = true;
    this.croppedBlob = null;
  }

  reset() {
    this.imageChangedEvent = null;
    this.imageFile = null;
    this.croppedBlob = null;
    this.imageLoadError = false;
    this.fileInput.nativeElement.value = '';
  }

  confirm() {
    if (!this.croppedBlob) return;
    const result: CropDialogResult = {
      blob: this.croppedBlob,
      ...(this.data.showMedidas && this.peso != null && { peso: +this.peso }),
      ...(this.data.showMedidas && this.talla != null && { talla: +this.talla }),
    };
    this.dialogRef.close(result);
  }
}
