import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, SidebarMenu],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class Alertas {

  isMenuOpen: boolean = false;

  alertas = [
    {
      paciente: 'Juan Perez',
      mensaje: 'Medicación omitida hoy a las 9:00 AM'
    },
    {
      paciente: 'María Santos',
      mensaje: 'Episodio registrado: dolor fuerte – 10:42 AM'
    },
    {
      paciente: 'Carlos Ruiz',
      mensaje: 'No completó cuestionario semanal'
    }
  ];

  onMenuToggle(isOpen: boolean): void {
    this.isMenuOpen = isOpen;
  }

  actualizar() {
    console.log('Actualizar alertas');
  }
}
