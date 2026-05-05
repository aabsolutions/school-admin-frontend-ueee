import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { VariableConfig } from '@shared/services/tramitologia.model';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() variables: VariableConfig[] = [];
  @Output() formChange = new EventEmitter<FormGroup>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() { this.buildForm(); }
  ngOnChanges() { this.buildForm(); }

  get sortedVariables() {
    return [...this.variables].sort((a, b) => a.order - b.order);
  }

  private buildForm() {
    const controls: Record<string, unknown> = {};
    for (const v of this.variables) {
      const validators = [];
      if (v.required) validators.push(Validators.required);
      if (v.fieldType === 'email') validators.push(Validators.email);
      if (v.fieldType === 'number') validators.push(Validators.pattern(/^\d+(\.\d+)?$/));
      controls[v.key] = [v.defaultValue ?? '', validators];
    }
    this.form = this.fb.group(controls);
    this.formChange.emit(this.form);
    this.form.valueChanges.subscribe(() => this.formChange.emit(this.form));
  }

  getValues(): Array<{ key: string; value: unknown }> {
    return Object.entries(this.form.value).map(([key, value]) => ({ key, value }));
  }
}
