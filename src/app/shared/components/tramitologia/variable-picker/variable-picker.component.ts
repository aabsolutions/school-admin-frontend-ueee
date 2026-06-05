import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VariableConfig } from '@shared/services/tramitologia.model';
import { VARIABLE_GROUPS, VARIABLE_LABELS } from './variable-labels';

@Component({
  selector: 'app-variable-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatExpansionModule, MatChipsModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="variable-picker mt-3">
      <p class="text-muted small mb-2 d-flex align-items-center gap-1">
        <mat-icon style="font-size:16px;height:16px;width:16px">code</mat-icon>
        Clic en una variable para insertarla en el cursor
      </p>

      <!-- Variable custom libre -->
      <div class="d-flex align-items-center gap-2 mb-2">
        <mat-form-field appearance="outline" class="flex-grow-1" style="font-size:13px">
          <mat-label>Variable personalizada</mat-label>
          <input matInput [(ngModel)]="customKey"
                 placeholder="CASO, MOTIVO, DESCRIPCION..."
                 (keyup.enter)="insertCustom()"
                 (input)="sanitizeKey()">
          <mat-hint>Solo mayúsculas y guiones bajos</mat-hint>
        </mat-form-field>
        <button mat-stroked-button color="accent" type="button"
                (click)="insertCustom()" [disabled]="!customKeyValid"
                style="margin-bottom:20px">
          <mat-icon>add</mat-icon> Insertar
        </button>
      </div>

      <mat-accordion [multi]="false">
        @for (group of allGroups; track group.label) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title class="fw-semibold small">{{ group.label }}</mat-panel-title>
            </mat-expansion-panel-header>
            <div class="d-flex flex-wrap gap-1 py-1">
              @for (key of group.keys; track key) {
                <span
                  class="badge rounded-pill variable-chip"
                  style="cursor:pointer;background:#e8f0fe;color:#1a73e8;border:1px solid #c5d8fb;font-size:11px;padding:4px 10px"
                  (click)="insert.emit(key)"
                  [title]="labelFor(key)">
                  {{ key }}
                </span>
              }
            </div>
          </mat-expansion-panel>
        }
        @if (customVariables?.length) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title class="fw-semibold small">Variables de plantilla</mat-panel-title>
            </mat-expansion-panel-header>
            <div class="d-flex flex-wrap gap-1 py-1">
              @for (v of customVariables; track v.key) {
                <span
                  class="badge rounded-pill variable-chip"
                  style="cursor:pointer;background:#fce8f3;color:#c2185b;border:1px solid #f3c6e3;font-size:11px;padding:4px 10px"
                  (click)="insert.emit(v.key)"
                  [title]="v.label">
                  {{ v.key }}
                </span>
              }
            </div>
          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
})
export class VariablePickerComponent {
  @Input() groups: typeof VARIABLE_GROUPS = VARIABLE_GROUPS;
  @Input() customVariables?: VariableConfig[];
  @Output() insert = new EventEmitter<string>();

  customKey = '';

  get customKeyValid(): boolean {
    return /^[A-Z][A-Z0-9_]{0,49}$/.test(this.customKey);
  }

  sanitizeKey() {
    this.customKey = this.customKey.toUpperCase().replace(/[^A-Z0-9_]/g, '');
  }

  insertCustom() {
    if (this.customKeyValid) {
      this.insert.emit(this.customKey);
      this.customKey = '';
    }
  }

  get allGroups() { return this.groups; }

  labelFor(key: string): string {
    return VARIABLE_LABELS[key] ?? key;
  }
}
