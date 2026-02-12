import { Component } from '@angular/core';


interface PerfilDoctor {
  nombre: string;
  telefono: string;
  especialidad: string;
  biografiaBreve: string;
  cedula: string;
  correo: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,  
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  perfilData: PerfilDoctor = {
    nombre: 'Dr. Jose Romero Perez',
    telefono: '271-139-4066',
    especialidad: 'Neurología (parkinson)',
    biografiaBreve: 'jose@gmail.com',
    cedula: '24347856',
    correo: 'jose@gmail.com'
  };

  actualizarPerfil(): void {
    console.log('Actualizar perfil');
    alert('Funcionalidad: Actualizar datos de perfil');
  }
}