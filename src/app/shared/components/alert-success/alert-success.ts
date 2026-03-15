import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-alert-success',
  imports: [],
  templateUrl: './alert-success.html',
  styleUrl: './alert-success.css',
})
export class AlertSuccess implements OnInit, OnDestroy {
  @Input() message = '';
  @Output() closed = new EventEmitter<void>();
  
  private timeoutId: any;

  ngOnInit() {
    // Cerrar automáticamente después de 2 segundos
    this.timeoutId = setTimeout(() => {
      this.closed.emit();
    }, 2000);
  }

  ngOnDestroy() {
    // Limpiar el timeout si el componente se destruye antes
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}