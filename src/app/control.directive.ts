import { Directive, signal, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[formAccessor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => formAccessorDirective),
      multi: true
    }
  ]
})
export class formAccessorDirective implements ControlValueAccessor {
  counter = signal(0);
  onChange!: (counter: number) => void;
  onTouched!: () => void;
  disabled = false;

  increase() {
    this.counter.update(counter => counter + 1);
    this.onChange(this.counter());
  }

  writeValue(counter: number): void {
    console.log(1, counter);
    this.counter.set(counter);
  }

  registerOnChange(fn: (counter: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}