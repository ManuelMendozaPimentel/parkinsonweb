import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-overlay',
  templateUrl: './modal-overlay.html', // ← archivo externo
  styleUrls: ['./modal-overlay.css'],
  standalone: true,
})
export class ModalOverlay {
  @Output() close = new EventEmitter<void>();

  onBackdropClick() {
    this.close.emit();
  }
}