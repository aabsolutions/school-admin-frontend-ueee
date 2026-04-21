import {
  Component, forwardRef, OnInit, OnDestroy, inject,
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR,
  FormControl, ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil } from 'rxjs';
import { ParentsApiService, ParentSearchResult } from '../../../admin/parents/parents-api.service';
import { AddParentInlineDialogComponent } from './add-parent-inline-dialog.component';

@Component({
  selector: 'app-parent-selector',
  templateUrl: './parent-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParentSelectorComponent),
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class ParentSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private api = inject(ParentsApiService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  searchCtrl = new FormControl('');
  suggestions: ParentSearchResult[] = [];
  selectedParents: ParentSearchResult[] = [];
  isDisabled = false;

  private onChange: (ids: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => q && typeof q === 'string' && q.length >= 1
        ? this.api.search(q)
        : of([])
      ),
      takeUntil(this.destroy$),
    ).subscribe((results) => {
      this.suggestions = results.filter(
        (r) => !this.selectedParents.some((s) => s._id === r._id)
      );
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(parent: ParentSearchResult) {
    if (this.selectedParents.some((s) => s._id === parent._id)) return;
    this.selectedParents = [...this.selectedParents, parent];
    this.searchCtrl.setValue('');
    this.suggestions = [];
    this.emitChange();
  }

  remove(id: string) {
    this.selectedParents = this.selectedParents.filter((s) => s._id !== id);
    this.emitChange();
  }

  displayFn(parent: ParentSearchResult | string): string {
    return typeof parent === 'string' ? parent : (parent?.name ?? '');
  }

  openAddDialog() {
    const ref = this.dialog.open(AddParentInlineDialogComponent, { width: '500px' });
    ref.afterClosed().subscribe((newParent: ParentSearchResult | undefined) => {
      if (newParent) this.select(newParent);
    });
  }

  private emitChange() {
    this.onChange(this.selectedParents.map((p) => p._id));
    this.onTouched();
  }

  // ControlValueAccessor
  writeValue(ids: string[]): void {
    if (!ids?.length) {
      this.selectedParents = [];
      return;
    }
    // If the incoming data is already objects with _id (from populated data), use as-is
  }

  writeValueFromObjects(parents: ParentSearchResult[]) {
    this.selectedParents = parents ?? [];
  }

  registerOnChange(fn: (ids: string[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled = disabled; }
}
