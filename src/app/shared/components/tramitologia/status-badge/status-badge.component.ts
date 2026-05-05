import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TramiteState } from '@shared/services/tramitologia.model';

const STATE_CONFIG: Record<TramiteState, { label: string; class: string }> = {
  pendiente:  { label: 'Pendiente',   class: 'badge bg-warning text-dark' },
  en_proceso: { label: 'En Proceso',  class: 'badge bg-info text-white' },
  aprobado:   { label: 'Aprobado',    class: 'badge bg-success' },
  rechazado:  { label: 'Rechazado',   class: 'badge bg-danger' },
  finalizado: { label: 'Finalizado',  class: 'badge bg-secondary' },
};

@Component({
  selector: 'app-tramite-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="config.class">{{ config.label }}</span>`,
})
export class TramiteStatusBadgeComponent {
  @Input() state!: TramiteState;
  get config() { return STATE_CONFIG[this.state] ?? { label: this.state, class: 'badge bg-secondary' }; }
}
