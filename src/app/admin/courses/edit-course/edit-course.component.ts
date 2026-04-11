import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-course',
  template: '',
  imports: [],
})
export class EditCourseComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {
    this.router.navigate(['/admin/courses/all-course']);
  }
}
