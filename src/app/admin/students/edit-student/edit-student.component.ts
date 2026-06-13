import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { StudentSiblingsComponent } from '../student-siblings/student-siblings.component';
import { StudentsService } from '../all-students/students.service';

@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbComponent,
    StudentSiblingsComponent,
  ],
})
export class EditStudentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(StudentsService);

  studentId = '';
  studentName = '';

  breadscrums = [
    { title: 'Gestionar Hermanos', items: ['Estudiantes'], active: 'Hermanos' },
  ];

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.studentId) {
      this.svc.getStudentWithSiblings(this.studentId).subscribe({
        next: (s) => { this.studentName = s.name ?? ''; },
        error: () => {},
      });
    }
  }
}
