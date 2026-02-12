import { Component } from '@angular/core';

interface SeguridadData {
  correoRecuperacion: string;
  contrasena: string;
  telefonoRecuperacion: string;
  infoVisible: {
    correo: boolean;
    cedula: boolean;
    direccion: boolean;
    especialidad: boolean;
  };
}

@Component({
  selector: 'app-seguridad',
  standalone: true,
  templateUrl: './seguridad.html',
  styleUrl: './seguridad.css'
})
export class Seguridad {
  seguridadData: SeguridadData = {
    correoRecuperacion: 'jose@gmail.com',
    contrasena: '*************',
    telefonoRecuperacion: '2711394066',
    infoVisible: {
      correo: true,
      cedula: true,
      direccion: false,
      especialidad: true
    }
  };

  toggleInfo(field: keyof SeguridadData['infoVisible']): void {
    this.seguridadData.infoVisible[field] = !this.seguridadData.infoVisible[field];
  }

  actualizarSeguridad(): void {
    console.log('Actualizar seguridad');
    alert('Funcionalidad: Actualizar configuración de seguridad');
  }
}