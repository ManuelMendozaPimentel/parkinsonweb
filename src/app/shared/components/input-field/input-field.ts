import { Component,Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-field',
  imports: [],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
})
export class InputField {
  @Input() label!: string;
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
