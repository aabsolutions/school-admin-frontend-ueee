import { Route } from '@angular/router';
import { Page404Component } from '../authentication/page404/page404.component';
import { MessagingComponent } from '@shared/components/messaging/messaging.component';

export const PARENT_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/parent-dashboard.component').then((m) => m.ParentDashboardComponent),
  },
  {
    path: 'hijos',
    loadComponent: () =>
      import('./hijos/hijos-list.component').then((m) => m.HijosListComponent),
  },
  {
    path: 'communicados',
    loadComponent: () =>
      import('./communicados/communicados-parent.component').then((m) => m.CommunicadosParentComponent),
  },
  {
    path: 'communicados/:id',
    loadComponent: () =>
      import('./communicados/communicado-detail.component').then((m) => m.CommunicadoDetailComponent),
  },
  {
    path: 'asistencias',
    loadComponent: () =>
      import('./asistencias/parent-asistencia.component').then(
        (m) => m.ParentAsistenciaComponent,
      ),
  },
  {
    path: 'messaging',
    component: MessagingComponent,
  },
  { path: '**', component: Page404Component },
];
