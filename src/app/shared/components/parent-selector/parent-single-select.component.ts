import {
  Component, forwardRef, Input, OnInit, OnDestroy, inject,
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR,
  FormControl, ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil } from 'rxjs';
import { ParentsApiService, ParentSearchResult } from '../../../admin/parents/parents-api.service';
import { AddParentInlineDialogComponent } from './add-parent-inline-dialog.component';

@Component({
  selector: 'app-parent-single-select',
  templateUrl: './parent-single-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParentSingleSelectComponent),
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
  ],
})
export class ParentSingleSelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label = 'Seleccionar padre/madre';
  @Input() showAddButton = true;

  private api = inject(ParentsApiService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  searchCtrl = new FormControl('');
  suggestions: ParentSearchResult[] = [];
  selected: ParentSearchResult | null = null;
  isDisabled = false;

  private onChange: (id: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        if (this.selected) return of([]);
        return q && typeof q === 'string' && q.length >= 1
          ? this.api.search(q)
          : of([]);
      }),
      takeUntil(this.destroy$),
    ).subscribe((results) => { this.suggestions = results; });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(parent: ParentSearchResult) {
    this.selected = parent;
    this.searchCtrl.setValue('', { emitEvent: false });
    this.suggestions = [];
    this.onChange(parent._id);
    this.onTouched();
  }

  clear() {
    this.selected = null;
    this.searchCtrl.setValue('');
    this.onChange(null);
    this.onTouched();
  }

  displayFn(): string { return ''; }

  openAddDialog() {
    const ref = this.dialog.open(AddParentInlineDialogComponent, { width: '500px' });
    ref.afterClosed().subscribe((p: ParentSearchResult | undefined) => {
      if (p) this.select(p);
    });
  }

  writeValue(value: string | { _id: string; name: string; email: string; dni?: string } | null): void {
    if (!value) { this.selected = null; return; }
    if (typeof value === 'object') {
      this.selected = { _id: value._id, name: value.name, email: value.email, dni: value.dni };
      return;
    }
    this.api.getOne(value).subscribe({
      next: (p) => { this.selected = { _id: p._id, name: p.name, email: p.email, dni: p.dni }; },
      error: () => {},
    });
  }

  registerOnChange(fn: (id: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
    disabled ? this.searchCtrl.disable() : this.searchCtrl.enable();
  }
}
