import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClassTimetableService {
  private readonly API_URL = 'assets/data/class-timetable.json';
  constructor(private http: HttpClient) {}
  getTimetable(): Observable<any> {
    return this.http.get(this.API_URL);
  }
}
