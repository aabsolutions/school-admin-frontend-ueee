import { Route } from '@angular/router';
import { AllTeachersComponent } from './all-teachers/all-teachers.component';
import { AddTeacherComponent } from './add-teacher/add-teacher.component';
import { Page404Component } from 'app/authentication/page404/page404.component';
import { TeacherTimetableComponent } from './teacher-timetable/teacher-timetable.component';
import { AssignClassTeacherComponent } from './assign-class-teacher/assign-class-teacher.component';
import { BulkTeachersComponent } from './bulk-teachers/bulk-teachers.component';

export const ADMIN_TEACHER_ROUTE: Route[] = [
  {
    path: 'all-teachers',
    component: AllTeachersComponent,
  },
  {
    path: 'add-teacher',
    component: AddTeacherComponent,
  },
  {
    path: 'bulk-teachers',
    component: BulkTeachersComponent,
  },
  {
    path: 'teacher-timetable',
    component: TeacherTimetableComponent,
  },
  {
    path: 'assign-class-teacher',
    component: AssignClassTeacherComponent,
  },
  { path: '**', component: Page404Component },
];
