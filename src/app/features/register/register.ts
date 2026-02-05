import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputField } from '../../shared/components/input-field/input-field';
import { Button } from '../../shared/components/button/button';
import { PrivacyNotice } from '../../shared/components/privacy-notice/privacy-notice';
import { Logo } from '../../shared/components/logo/logo';

@Component({
  selector: 'app-register',
  imports: [InputField, Button, PrivacyNotice, Logo],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  nombreCompleto = '';
  correo = '';
  cedulaProfesional = '';
  contrasena = '';
  confirmarContrasena = '';
  institucion = '';
  aceptaPrivacidad = false;

  showPrivacyModal = false;
  showSuccessAlert = false;

  // Estados de "touched" para validación diferida
  nombreTouched = false;
  correoTouched = false;
  cedulaTouched = false;
  contrasenaTouched = false;
  confirmarContrasenaTouched = false;
  institucionTouched = false;

  // Errores condicionales
  get nombreError(): string | null {
    if (!this.nombreTouched) return null;
    if (!this.nombreCompleto.trim()) return 'El nombre es obligatorio';
    if (!/^[a-zA-Z\s]+$/.test(this.nombreCompleto)) return 'Solo se permiten letras y espacios';
    return null;
  }

  get correoError(): string | null {
    if (!this.correoTouched) return null;
    if (!this.correo) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo)) return 'Formato de correo inválido';
    return null;
  }

  get cedulaError(): string | null {
    if (!this.cedulaTouched) return null;
    if (!this.cedulaProfesional) return 'La cédula es obligatoria';
    if (!/^\d{7,8}$/.test(this.cedulaProfesional)) return 'Debe tener 7 u 8 dígitos numéricos';
    return null;
  }

  get contrasenaError(): string | null {
    if (!this.contrasenaTouched) return null;
    if (!this.contrasena) return 'La contraseña es obligatoria';
    if (this.contrasena.length < 8 || this.contrasena.length > 12) return 'Debe tener entre 8 y 12 caracteres';
    return null;
  }

  get confirmarContrasenaError(): string | null {
    if (!this.confirmarContrasenaTouched) return null;
    if (this.contrasena !== this.confirmarContrasena) return 'Las contraseñas no coinciden';
    return null;
  }

  get institucionError(): string | null {
    if (!this.institucionTouched) return null;
    if (!this.institucion.trim()) return 'La institución es obligatoria';
    return null;
  }

  constructor(private router: Router) {}

  isValid(): boolean {
    return (
      !this.nombreError &&
      !this.correoError &&
      !this.cedulaError &&
      !this.contrasenaError &&
      !this.confirmarContrasenaError &&
      !this.institucionError &&
      this.aceptaPrivacidad
    );
  }

  onRegister() {
    // Marcar todos como touched al intentar enviar
    this.nombreTouched = true;
    this.correoTouched = true;
    this.cedulaTouched = true;
    this.contrasenaTouched = true;
    this.confirmarContrasenaTouched = true;
    this.institucionTouched = true;

    if (!this.isValid()) {
      return;
    }

    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
      this.router.navigate(['/login']);
    }, 10000);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  // Métodos para marcar como touched
  onNombreBlur() { this.nombreTouched = true; }
  onCorreoBlur() { this.correoTouched = true; }
  onCedulaBlur() { this.cedulaTouched = true; }
  onContrasenaBlur() { this.contrasenaTouched = true; }
  onConfirmarContrasenaBlur() { this.confirmarContrasenaTouched = true; }
  onInstitucionBlur() { this.institucionTouched = true; }

  openPrivacyModal() {
    this.showPrivacyModal = true;
  }

  closePrivacyModal() {
    this.showPrivacyModal = false;
  }
}