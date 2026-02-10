import { Component } from '@angular/core';
import { PatientForm } from '../../shared/components/patient-form/patient-form';
import { Button } from '../../shared/components/button/button';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';

@Component({
  selector: 'app-patients',
  imports: [PatientForm, Button, ModalOverlay],
  templateUrl: './patients.html',
  styleUrls: ['./patients.css'],
  standalone: true,
})
export class Patients {
  patients = [
    { id: '1', fechaCreacion: '12-nov-2025', nombre: 'Juan Perez Reyes', diagnostico: 'Parkinson leve', correo: 'juan.perez@gmail.com' },
    { id: '2', fechaCreacion: '10-oct-2025', nombre: 'María López Hernández', diagnostico: 'Temblor esencial', correo: 'maria.lopez@gmail.com' },
    { id: '3', fechaCreacion: '04-oct-2025', nombre: 'Carlos Gómez Rivera', diagnostico: 'Alzheimer inicial', correo: 'carlos.gomez@gmail.com' },
  ];

  showForm = false;
  editingPatient: any = null;

  openRegisterForm() {
    this.editingPatient = null;
    this.showForm = true;
  }

  openEditForm(patient: any) {
    this.editingPatient = patient;
    this.showForm = true;
  }

  onCloseForm() {
    this.showForm = false;
    this.editingPatient = null;
  }

  onDelete(patient: any) {
    if (confirm('¿Eliminar paciente?')) {
      this.patients = this.patients.filter(p => p.id !== patient.id);
    }
  }

  onSavePatient(data: any) {
    if (this.editingPatient) {
      // Actualizar
      const index = this.patients.findIndex(p => p.id === this.editingPatient.id);
      if (index !== -1) {
        this.patients[index] = { ...data, id: this.editingPatient.id, fechaCreacion: this.editingPatient.fechaCreacion };
      }
    } else {
      // Nuevo paciente
      const newId = (parseInt(this.patients[0]?.id || '0') + 1).toString();
      this.patients = [{ ...data, id: newId, fechaCreacion: 'Hoy' }, ...this.patients];
    }
    this.onCloseForm();
  }
}