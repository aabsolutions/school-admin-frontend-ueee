import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ClassTimetableService } from './class-timetable.service';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-class-timetable',
    imports: [BreadcrumbComponent, MatTableModule, MatSortModule],
    templateUrl: './class-timetable.component.html',
    styleUrl: './class-timetable.component.scss'
})
export class ClassTimetableComponent implements OnInit {
  breadscrums = [
    {
      title: 'Class Timetable',
      items: ['Class'],
      active: 'Class Timetable',
    },
  ];

  timetableData: any[] = [];
  displayedColumns: string[] = [
    'time',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  constructor(private timetableService: ClassTimetableService) {}

  ngOnInit(): void {
    this.timetableService.getTimetable().subscribe((data: any) => {
      this.timetableData = data.timetable;
    });
  }
}
