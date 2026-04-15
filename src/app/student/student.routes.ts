import { Page404Component } from '../authentication/page404/page404.component';
import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeworkComponent } from './homework/homework.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { TimetableComponent } from './timetable/timetable.component';
import { SettingsComponent } from './settings/settings.component';
import { FichaMedicaStudentComponent } from './ficha-medica/ficha-medica.component';
import { GestionDocumentalStudentComponent } from './gestion-documental/gestion-documental-student.component';
import { MiExpedienteComponent } from './mi-expediente/mi-expediente.component';
import { MiDeceComponent } from './mi-dece/mi-dece.component';
import { MisMateriasComponent } from './mis-materias/mis-materias.component';
import { MisFotosStudentComponent } from './mis-fotos/mis-fotos.component';

export const STUDENT_ROUTE: Route[] = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'homework',
    component: HomeworkComponent,
  },
  {
    path: 'leave-request',
    component: LeaveRequestComponent,
  },
  {
    path: 'timetable',
    component: TimetableComponent,
  },
  {
    path: 'ficha-medica',
    component: FichaMedicaStudentComponent,
  },
  {
    path: 'gestion-documental',
    component: GestionDocumentalStudentComponent,
  },
  {
    path: 'mi-expediente',
    component: MiExpedienteComponent,
  },
  {
    path: 'mi-dece',
    component: MiDeceComponent,
  },
  {
    path: 'mis-materias',
    component: MisMateriasComponent,
  },
  {
    path: 'mis-fotos',
    component: MisFotosStudentComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  { path: '**', component: Page404Component },
];
