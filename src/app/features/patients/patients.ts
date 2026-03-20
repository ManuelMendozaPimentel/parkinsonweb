import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientForm } from '../../shared/components/patient-form/patient-form';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { AlertSuccess } from '../../shared/components/alert-success/alert-success';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';
import { PacientesService, Paciente } from '../../services/pacientes';

@Component({
  selector: 'app-patients',
  imports: [
    CommonModule,
    PatientForm,
    ModalOverlay,
    ConfirmModal,
    AlertSuccess,
    SidebarMenu
  ],
  templateUrl: './patients.html',
  styleUrls: ['./patients.css'],
  standalone: true,
})
export class Patients implements OnInit {

  isMenuOpen = false;

  // Lista de pacientes
  patients: Paciente[] = [];
  isLoading = false;
  apiError: string | null = null;

  // Modales
  showForm = false;
  showConfirmDelete = false;
  showSuccessDelete = false;
  showSuccessUpdate = false;

  // Paciente seleccionado
  editingPatient: Paciente | null = null;
  patientToDelete: Paciente | null = null;

  // Estado de operaciones
  isDeleting = false;
  deleteError: string | null = null;

  constructor(
    private pacientesService: PacientesService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  onMenuToggle(open: boolean): void {
    this.isMenuOpen = open;
  }

  // ── Carga ─────────────────────────────────

  cargarPacientes(): void {
    this.isLoading = true;
    this.apiError = null;

    this.pacientesService.listarPacientes().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            this.patients = response.data;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.apiError = error.message || 'Error al cargar los pacientes';
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Formulario ────────────────────────────

  openEditForm(patient: Paciente): void {
    this.editingPatient = patient;
    this.showForm = true;
  }

  onCloseForm(): void {
    this.showForm = false;
    this.editingPatient = null;
  }

  onSavePatient(datos: any): void {
    if (!this.editingPatient) return;

    this.pacientesService
      .actualizarDatosClinicos(this.editingPatient.id, datos)
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            if (response.success) {
              // Actualiza el paciente en la lista sin recargar todo
              this.patients = this.patients.map(p =>
                p.id === this.editingPatient!.id
                  ? { ...p, ...datos }
                  : p
              );
              this.onCloseForm();
              this.showSuccessUpdate = true;
              setTimeout(() => {
                this.ngZone.run(() => {
                  this.showSuccessUpdate = false;
                  this.cdr.markForCheck();
                });
              }, 3000);
            }
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.apiError = error.error?.message || error.message || 'Error al actualizar';
            this.cdr.markForCheck();
          });
        }
      });
  }

  // ── Desvincular ───────────────────────────

  onDelete(patient: Paciente): void {
    this.patientToDelete = patient;
    this.deleteError = null;
    this.showConfirmDelete = true;
  }

  onConfirmDelete(): void {
    if (!this.patientToDelete || this.isDeleting) return;

    this.isDeleting = true;
    this.deleteError = null;

    this.pacientesService
      .desvincularPaciente(this.patientToDelete.id)
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            if (response.success) {
              this.patients = this.patients.filter(
                p => p.id !== this.patientToDelete!.id
              );
              this.showConfirmDelete = false;
              this.showSuccessDelete = true;
              this.patientToDelete = null;
              setTimeout(() => {
                this.ngZone.run(() => {
                  this.showSuccessDelete = false;
                  this.cdr.markForCheck();
                });
              }, 3000);
            }
            this.isDeleting = false;
            this.cdr.markForCheck();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.deleteError = error.error?.message || error.message || 'Error al desvincular';
            this.isDeleting = false;
            this.cdr.markForCheck();
          });
        }
      });
  }

  // ── Helpers ───────────────────────────────

  formatFecha(fechaISO: string): string {
    if (!fechaISO) return '—';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}