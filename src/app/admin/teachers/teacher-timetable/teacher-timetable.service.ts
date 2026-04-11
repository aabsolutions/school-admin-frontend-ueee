import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimetableResponse, Teacher } from './teacher-timetable..interface';

@Injectable({
  providedIn: 'root',
})
export class TeacherTimetableService {
  constructor(private http: HttpClient) {}

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>('assets/data/teachers.json');
  }

  getTimetable(): Observable<TimetableResponse> {
    return this.http.get<TimetableResponse>(
      'assets/data/teacher-timetable.json'
    );
  }
}
