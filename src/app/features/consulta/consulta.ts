import { Component } from '@angular/core';

interface ConsultaData {
  nombreInstitucion: string;
  direccion: string;
  horarioAtencion: string;
  reglasAgenda: string[];
  telefonoCita: string;
}

@Component({
  selector: 'app-consulta',
  standalone: true,
  templateUrl: './consulta.html',
  styleUrl: './consulta.css'
})
export class Consulta {
  consultaData: ConsultaData = {
    nombreInstitucion: 'Hospital Covadonga Cordoba',
    direccion: 'Neurología (parkinson)',
    horarioAtencion: 'Lunes y Miércoles 9:00–14:00',
    reglasAgenda: [
      'Tiempo mínimo de anticipación para agendar 24hrs',
      'Se permite cancelar con 24 hrs de anticipación sin penalización'
    ],
    telefonoCita: '274-568-9090'
  };

  actualizarConsulta(): void {
    console.log('Actualizar consulta');
    alert('Funcionalidad: Actualizar información de consulta');
  }
}