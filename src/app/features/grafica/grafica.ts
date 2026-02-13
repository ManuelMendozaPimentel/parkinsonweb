import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-grafica',
  standalone: true,
  imports: [CommonModule, SidebarMenu],
  templateUrl: './grafica.html',
  styleUrl: './grafica.css'
})
export class Grafica {

  calendarioAbierto = false;
    isMenuOpen: boolean = false; // 👈 ESTADO DEL MENÚ

  meses = [
    'Septiembre 2025',
    'Octubre 2025',
    'Noviembre 2025'
  ];

  mesSeleccionadoIndex = 2;

  diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  datosPorMes: any = {
    'Noviembre 2025': [
      { nombre: 'Felipe', valor: 85 },
      { nombre: 'Juan', valor: 55 },
      { nombre: 'Carlos', valor: 75 },
      { nombre: 'Samuel', valor: 60 },
      { nombre: 'Jose', valor: 25 }
    ],
    'Octubre 2025': [
      { nombre: 'Felipe', valor: 60 },
      { nombre: 'Juan', valor: 40 },
      { nombre: 'Carlos', valor: 90 },
      { nombre: 'Samuel', valor: 70 },
      { nombre: 'Jose', valor: 30 }
    ],
    'Septiembre 2025': [
      { nombre: 'Felipe', valor: 45 },
      { nombre: 'Juan', valor: 80 },
      { nombre: 'Carlos', valor: 50 },
      { nombre: 'Samuel', valor: 65 },
      { nombre: 'Jose', valor: 35 }
    ]
  };

  get mesSeleccionado(): string {
    return this.meses[this.mesSeleccionadoIndex];
  }

  get datos() {
    return this.datosPorMes[this.mesSeleccionado] || [];
  }

  toggleCalendario() {
    this.calendarioAbierto = !this.calendarioAbierto;
  }

  cambiarMes(dir: number) {
    this.mesSeleccionadoIndex =
      (this.mesSeleccionadoIndex + dir + this.meses.length) % this.meses.length;
  }

  // ----- MINI CALENDARIO -----

  get diasDelMes(): number[] {
    const fecha = new Date(2025, this.mesSeleccionadoIndex, 1);
    const ultimoDia = new Date(2025, this.mesSeleccionadoIndex + 1, 0).getDate();
    return Array.from({ length: ultimoDia }, (_, i) => i + 1);
  }

  get primerDiaOffset(): number {
    const fecha = new Date(2025, this.mesSeleccionadoIndex, 1);
    let dia = fecha.getDay();
    return dia === 0 ? 6 : dia - 1;
  }

  actualizar() {
    console.log('Actualizar gráfica');
  }

  calcularAltura(valor: number) {
    return valor * 2;
  }

  calcularY(valor: number) {
    return 200 - this.calcularAltura(valor);
  }

    // 👈 MANEJADOR DEL TOGGLE DEL MENÚ
  onMenuToggle(isOpen: boolean): void {
    this.isMenuOpen = isOpen;
  }
}
