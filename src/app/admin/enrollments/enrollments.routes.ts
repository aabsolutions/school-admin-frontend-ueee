import { Route } from '@angular/router';
import { AllEnrollmentsComponent } from './all-enrollments/all-enrollments.component';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const ENROLLMENT_ROUTE: Route[] = [
  {
    path: 'all-enrollments',
    component: AllEnrollmentsComponent,
  },
  { path: '**', component: Page404Component },
];
