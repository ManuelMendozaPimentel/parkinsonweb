import { Component,Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input() variant: 'primary' | 'link' = 'primary';
  @Input() disabled = false;
  @Output() clickEvent = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) this.clickEvent.emit();
  }
}
