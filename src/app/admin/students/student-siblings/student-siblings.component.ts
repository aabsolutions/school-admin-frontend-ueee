import {
  Component, Input, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil,
} from 'rxjs';
import {
  StudentsService, StudentBasic,
} from '../all-students/students.service';

@Component({
  selector: 'app-student-siblings',
  templateUrl: './student-siblings.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class StudentSiblingsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) studentId!: string;

  private svc = inject(StudentsService);
  private destroy$ = new Subject<void>();

  siblings: StudentBasic[] = [];
  suggestions: StudentBasic[] = [];
  searchResults: StudentBasic[] = [];
  searchCtrl = new FormControl('');
  loading = false;
  linking = false;

  ngOnInit() {
    this.load();

    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) =>
        q && typeof q === 'string' && q.length >= 2
          ? this.svc.searchStudentsForSibling(q, this.studentId)
          : of([]),
      ),
      takeUntil(this.destroy$),
    ).subscribe((results) => {
      this.searchResults = results.filter(
        (r) => !this.siblings.some((s) => s._id === r._id),
      );
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load() {
    this.loading = true;
    this.svc.getStudentWithSiblings(this.studentId).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (student) => {
        this.siblings = student.siblingIds ?? [];
        this.loading = false;
        this.loadSuggestions();
      },
      error: () => { this.loading = false; },
    });
  }

  private loadSuggestions() {
    this.svc.getSuggestedSiblings(this.studentId).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (list) => {
        this.suggestions = list.filter(
          (s) => !this.siblings.some((linked) => linked._id === s._id),
        );
      },
      error: (err) => { console.warn('Siblings: operation failed', err); },
    });
  }

  linkFromSearch(sibling: StudentBasic) {
    this.searchCtrl.setValue('', { emitEvent: false });
    this.searchResults = [];
    this.doLink(sibling);
  }

  linkFromSuggestion(sibling: StudentBasic) {
    this.suggestions = this.suggestions.filter((s) => s._id !== sibling._id);
    this.doLink(sibling, 'suggestion');
  }

  private doLink(sibling: StudentBasic, source?: 'suggestion') {
    this.linking = true;
    this.svc.linkSibling(this.studentId, sibling._id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.siblings = [...this.siblings, sibling];
        this.linking = false;
      },
      error: () => {
        this.linking = false;
        if (source === 'suggestion') {
          this.suggestions = [...this.suggestions, sibling];
        }
      },
    });
  }

  unlink(sibling: StudentBasic) {
    this.svc.unlinkSibling(this.studentId, sibling._id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.siblings = this.siblings.filter((s) => s._id !== sibling._id);
        this.suggestions = [...this.suggestions, sibling];
      },
      error: (err) => { console.warn('Siblings: operation failed', err); },
    });
  }

  displayFn(): string { return ''; }
}
