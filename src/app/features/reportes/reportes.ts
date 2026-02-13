import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, SidebarMenu],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {

  isMenuOpen: boolean = false;

  reportes = [
    {
      tipo: 'Actividad de pacientes',
      fecha: '12/11/2025',
      estado: 'Generado'
    },
    {
      tipo: 'Alertas del día',
      fecha: '11/11/2025',
      estado: 'Descargar'
    },
    {
      tipo: 'Evaluaciones completas',
      fecha: '10/11/2025',
      estado: 'Generado'
    },
    {
      tipo: 'Citas programadas',
      fecha: '08/11/2025',
      estado: 'Descargar'
    }
  ];

  onMenuToggle(isOpen: boolean): void {
    this.isMenuOpen = isOpen;
  }

  generarReporte() {
    console.log('Generar nuevo reporte');
  }

  accionReporte(reporte: any) {
    if (reporte.estado === 'Descargar') {
      console.log('Descargando reporte...');
    } else {
      console.log('Reporte ya generado');
    }
  }
}
