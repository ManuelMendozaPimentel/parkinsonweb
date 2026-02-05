import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-privacy-notice',
  imports: [],
  templateUrl: './privacy-notice.html',
  styleUrl: './privacy-notice.css',
})
export class PrivacyNotice {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
