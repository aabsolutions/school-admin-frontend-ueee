import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-timetable',
    templateUrl: './timetable.component.html',
    styleUrls: ['./timetable.component.scss'],
    imports: [BreadcrumbComponent]
})
export class TimetableComponent {
  breadscrums = [
    {
      title: 'Timetable',
      items: ['Student'],
      active: 'Timetable',
    },
  ];

  constructor() {
    //constructor
  }
}
