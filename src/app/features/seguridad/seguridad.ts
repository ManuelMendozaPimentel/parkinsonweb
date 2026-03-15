import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfilService, PerfilCompleto } from '../../services/perfil';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';

type ModalTipo = 'password' | 'correo' | 'correo-codigo' | null;

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalOverlay],
  templateUrl: './seguridad.html',
  styleUrl: './seguridad.css'
})
export class Seguridad implements OnInit {

  perfil: PerfilCompleto | null = null;
  isLoading = false;
  apiError: string | null = null;

  // Flags de visibilidad (se guardan juntos)
  visibilidad = {
    mostrar_correo: false,
    mostrar_cedula: true,
    mostrar_especialidad: true,
    mostrar_biografia: true,
    mostrar_telefono_personal: false
  };
  isSavingVisibilidad = false;
  visibilidadSuccess = false;
  visibilidadError: string | null = null;

  // Modal activo
  modalActivo: ModalTipo = null;
  isSubmitting = false;
  modalError: string | null = null;
  modalSuccess: string | null = null;

  // Formulario cambiar contraseña
  formPassword = {
    password_actual: '',
    password_nueva: '',
    password_confirmar: ''
  };

  // Formulario cambiar correo — paso 1
  formCorreo = {
    nuevo_correo: '',
    password: ''
  };

  // Formulario cambiar correo — paso 2 (código)
  codigoVerificacion = '';
  nuevoCorreoPendiente = ''; // para mostrar "enviamos a X"

  constructor(
    private perfilService: PerfilService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.isLoading = true;
    this.perfilService.obtenerPerfil().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            this.perfil = response.data;
            // Sincronizar flags desde la API
            this.visibilidad = {
              mostrar_correo:            response.data.mostrar_correo,
              mostrar_cedula:            response.data.mostrar_cedula,
              mostrar_especialidad:      response.data.mostrar_especialidad,
              mostrar_biografia:         response.data.mostrar_biografia,
              mostrar_telefono_personal: response.data.mostrar_telefono_personal
            };
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.apiError = error.message || 'Error al cargar datos';
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Visibilidad ───────────────────────────────────────────────

  guardarVisibilidad(): void {
    this.isSavingVisibilidad = true;
    this.visibilidadError = null;
    this.visibilidadSuccess = false;

    this.perfilService.editarPerfil(this.visibilidad).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.visibilidadSuccess = true;
            setTimeout(() => this.visibilidadSuccess = false, 2500);
          }
          this.isSavingVisibilidad = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.visibilidadError = error.message || 'Error al guardar';
          this.isSavingVisibilidad = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────

  abrirModal(tipo: ModalTipo): void {
    this.modalActivo = tipo;
    this.modalError = null;
    this.modalSuccess = null;
    this.formPassword = { password_actual: '', password_nueva: '', password_confirmar: '' };
    this.formCorreo = { nuevo_correo: '', password: '' };
    this.codigoVerificacion = '';
  }

  cerrarModal(): void {
    this.modalActivo = null;
    this.modalError = null;
    this.modalSuccess = null;
    this.isSubmitting = false;
  }

  // ── Cambiar contraseña ────────────────────────────────────────

  submitCambiarPassword(): void {
    if (this.isSubmitting) return;

    const { password_actual, password_nueva, password_confirmar } = this.formPassword;

    if (!password_actual || !password_nueva || !password_confirmar) {
      this.modalError = 'Todos los campos son obligatorios';
      return;
    }
    if (password_nueva.length < 8 || password_nueva.length > 12) {
      this.modalError = 'La nueva contraseña debe tener entre 8 y 12 caracteres';
      return;
    }
    if (password_nueva !== password_confirmar) {
      this.modalError = 'Las contraseñas nuevas no coinciden';
      return;
    }
    if (password_actual === password_nueva) {
      this.modalError = 'La nueva contraseña debe ser diferente a la actual';
      return;
    }

    this.isSubmitting = true;
    this.modalError = null;

    this.perfilService.cambiarPassword(password_actual, password_nueva).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.modalSuccess = '✅ Contraseña actualizada correctamente';
            setTimeout(() => this.cerrarModal(), 1500);
          }
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.modalError = error.error?.message || error.message || 'Error al cambiar contraseña';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Cambiar correo — Paso 1 ───────────────────────────────────

  submitSolicitarCambioCorreo(): void {
    if (this.isSubmitting) return;

    const { nuevo_correo, password } = this.formCorreo;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nuevo_correo || !password) {
      this.modalError = 'Todos los campos son obligatorios';
      return;
    }
    if (!emailRegex.test(nuevo_correo)) {
      this.modalError = 'Formato de correo inválido';
      return;
    }

    this.isSubmitting = true;
    this.modalError = null;

    this.perfilService.solicitarCambioCorreo(nuevo_correo, password).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.nuevoCorreoPendiente = nuevo_correo;
            this.modalActivo = 'correo-codigo'; // Avanza al paso 2
            this.modalError = null;
          }
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.modalError = error.error?.message || error.message || 'Error al solicitar cambio';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Cambiar correo — Paso 2 ───────────────────────────────────

  submitConfirmarCambioCorreo(): void {
    if (this.isSubmitting) return;

    if (!this.codigoVerificacion || !/^\d{6}$/.test(this.codigoVerificacion)) {
      this.modalError = 'El código debe ser de 6 dígitos numéricos';
      return;
    }

    this.isSubmitting = true;
    this.modalError = null;

    this.perfilService.confirmarCambioCorreo(this.codigoVerificacion).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            // Actualizar el correo mostrado en pantalla
            if (this.perfil) {
              this.perfil = { ...this.perfil, correo: this.nuevoCorreoPendiente };
            }
            this.modalSuccess = '✅ Correo actualizado correctamente';
            setTimeout(() => this.cerrarModal(), 1500);
          }
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.modalError = error.error?.message || error.message || 'Código incorrecto';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      }
    });
  }
}