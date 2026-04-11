import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { DeceService } from '../../dece.service';
import { DeceExpediente } from '../../dece.model';

interface StudentItem {
  id: string;
  name: string;
  dni: string;
  email: string;
  gender: string;
  img?: string;
}

@Component({
  selector: 'app-nuevo-dece-dialog',
  templateUrl: './nuevo-dece-dialog.component.html',
  styleUrls: ['./nuevo-dece-dialog.component.scss'],
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatDividerModule, MatTooltipModule,
  ],
})
export class NuevoDeceDialogComponent implements OnInit, OnDestroy {
  searchTerm  = '';
  students: StudentItem[] = [];
  searching   = false;
  creating    = false;
  hasSearched = false;

  private search$   = new Subject<string>();
  private destroy$  = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<NuevoDeceDialogComponent>,
    private http: HttpClient,
    private svc: DeceService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        if (!term.trim()) {
          this.students    = [];
          this.hasSearched = false;
          this.searching   = false;
          return [];
        }
        this.searching = true;
        const params = new HttpParams().set('search', term).set('limit', '20');
        return this.http.get<any>(`${environment.apiUrl}/students`, { params });
      }),
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.students = (res.data?.data ?? []).map((s: any) => ({
          id:     s._id ?? s.id,
          name:   s.name,
          dni:    s.dni ?? '—',
          email:  s.email,
          gender: s.gender ?? '',
          img:    s.img,
        }));
        this.hasSearched = true;
        this.searching   = false;
      },
      error: () => { this.searching = false; },
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(term: string) { this.search$.next(term); }

  selectStudent(student: StudentItem) {
    this.creating = true;
    this.svc.getOrCreate(student.id).subscribe({
      next: (exp: DeceExpediente) => {
        this.creating = false;
        const enriched: DeceExpediente = {
          ...exp,
          studentId: {
            _id:    student.id,
            name:   student.name,
            email:  student.email,
            dni:    student.dni,
            gender: student.gender,
            mobile: '',
            img:    student.img,
          },
        };
        this.dialogRef.close(enriched);
      },
      error: (err) => {
        this.creating = false;
        this.snackBar.open(err.message || 'Error al crear el expediente DECE', '', {
          duration: 4000, panelClass: 'snackbar-danger',
          verticalPosition: 'bottom', horizontalPosition: 'center',
        });
      },
    });
  }

  onNoClick() { this.dialogRef.close(); }
}
