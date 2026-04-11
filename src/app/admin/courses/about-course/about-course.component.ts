import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-about-course',
    templateUrl: './about-course.component.html',
    styleUrls: ['./about-course.component.scss'],
    imports: [BreadcrumbComponent]
})
export class AboutCourseComponent {
  breadscrums = [
    {
      title: 'About Course',
      items: ['Course'],
      active: 'About Course',
    },
  ];
  constructor() {
    // constructor
  }
}
