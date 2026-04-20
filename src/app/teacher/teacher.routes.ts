import { ExamScheduleComponent } from './exam-schedule/exam-schedule.component';
import { LecturesComponent } from './lectures/lectures.component';
import { Page404Component } from '../authentication/page404/page404.component';
import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { SettingsComponent } from './settings/settings.component';
import { ListaNominaTeacherComponent } from './lista-nomina/lista-nomina.component';
import { FichaMedicaTeacherComponent } from './ficha-medica/ficha-medica.component';
import { GestionDocumentalTeacherComponent } from './gestion-documental/gestion-documental-teacher.component';
import { MiCargaHorariaComponent } from './mi-carga-horaria/mi-carga-horaria.component';
import { MisFotosTeacherComponent } from './mis-fotos/mis-fotos.component';
import { MessagingComponent } from '@shared/components/messaging/messaging.component';

export const TEACHER_ROUTE: Route[] = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'lectures',
    component: LecturesComponent,
  },
  {
    path: 'leave-request',
    component: LeaveRequestComponent,
  },
  {
    path: 'exam-schedule',
    component: ExamScheduleComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'lista-nomina',
    component: ListaNominaTeacherComponent,
  },
  {
    path: 'ficha-medica',
    component: FichaMedicaTeacherComponent,
  },
  {
    path: 'gestion-documental',
    component: GestionDocumentalTeacherComponent,
  },
  {
    path: 'mi-carga-horaria',
    component: MiCargaHorariaComponent,
  },
  {
    path: 'mis-fotos',
    component: MisFotosTeacherComponent,
  },
  {
    path: 'messaging',
    component: MessagingComponent,
  },
  { path: '**', component: Page404Component },
];
