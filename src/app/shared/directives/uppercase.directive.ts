import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ selector: 'input[appUppercase]', standalone: true })
export class UppercaseDirective {
  constructor(@Self() @Optional() private control: NgControl) {}

  @HostListener('input', ['$event.target'])
  onInput(el: HTMLInputElement): void {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const upper = el.value.toUpperCase();
    if (el.value !== upper) {
      el.value = upper;
      el.setSelectionRange(start, end);
    }
    this.control?.control?.setValue(upper, { emitEvent: false });
  }
}
