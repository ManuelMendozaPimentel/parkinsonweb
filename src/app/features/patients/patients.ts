import { Component } from '@angular/core';
import { PatientForm } from '../../shared/components/patient-form/patient-form';
import { Button } from '../../shared/components/button/button';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { AlertSuccess } from '../../shared/components/alert-success/alert-success';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-patients',
  imports: [PatientForm, Button, ModalOverlay, ConfirmModal, AlertSuccess, SidebarMenu],
  templateUrl: './patients.html',
  styleUrls: ['./patients.css'],
  standalone: true,
})
export class Patients {
  isMenuOpen = false;

  onMenuToggle(open: boolean) {
    this.isMenuOpen = open;
  }
  // Estado de modales
  showForm = false;
  showConfirmDelete = false;
  showSuccessDelete = false;
  showSuccessUpdate = false;
  showSuccessCreate = false;

  // Datos
  patients = [
    { id: '1', fechaCreacion: '12-nov-2025', nombre: 'Juan Perez Reyes', diagnostico: 'Parkinson leve', correo: 'juan.perez@gmail.com' },
    { id: '2', fechaCreacion: '10-oct-2025', nombre: 'María López Hernández', diagnostico: 'Temblor esencial', correo: 'maria.lopez@gmail.com' },
    { id: '3', fechaCreacion: '04-oct-2025', nombre: 'Carlos Gómez Rivera', diagnostico: 'Alzheimer inicial', correo: 'carlos.gomez@gmail.com' },
  ];

  editingPatient: any = null;
  patientToDelete: any = null;

  // === Formulario ===
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

  // === Eliminar ===
  onDelete(patient: any) {
    this.patientToDelete = patient;
    this.showConfirmDelete = true;
  }

  onConfirmDelete() {
    this.patients = this.patients.filter(p => p.id !== this.patientToDelete.id);
    this.showConfirmDelete = false;
    this.showSuccessDelete = true;
    setTimeout(() => {
      this.showSuccessDelete = false;
      this.patientToDelete = null;
    }, 3000);
  }

  // === Guardar (crear o actualizar) ===
  onSavePatient(data: any) {
    if (this.editingPatient) {
      // Actualizar
      const index = this.patients.findIndex(p => p.id === this.editingPatient.id);
      if (index !== -1) {
        this.patients[index] = { ...data, id: this.editingPatient.id, fechaCreacion: this.editingPatient.fechaCreacion };
      }
      this.showSuccessUpdate = true;
      setTimeout(() => this.showSuccessUpdate = false, 3000);
    } else {
      // Registrar
      const newId = (this.patients.length + 1).toString();
      this.patients = [{ ...data, id: newId, fechaCreacion: 'Hoy' }, ...this.patients];
      this.showSuccessCreate = true;
      setTimeout(() => this.showSuccessCreate = false, 3000);
    }
    this.onCloseForm();
  }
}