import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert-success',
  imports: [],
  templateUrl: './alert-success.html',
  styleUrl: './alert-success.css',
})
export class AlertSuccess {
  @Input() message = '';
  @Output() closed = new EventEmitter<void>();

  ngOnInit() {
    // Cerrar automáticamente después de 3 segundos
    setTimeout(() => {
      this.closed.emit();
    }, 3000);
  }
}
