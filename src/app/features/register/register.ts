import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputField } from '../../shared/components/input-field/input-field';
import { Button } from '../../shared/components/button/button';
import { PrivacyNotice } from '../../shared/components/privacy-notice/privacy-notice';
import { Logo } from '../../shared/components/logo/logo';
import { AuthService } from '../../services/auth';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';
import { AlertSuccess } from '../../shared/components/alert-success/alert-success';

@Component({
  selector: 'app-register',
  imports: [
    InputField, 
    Button, 
    PrivacyNotice, 
    Logo, 
    FormsModule,
    ModalOverlay,
    AlertSuccess
  ],
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
  
  isLoading = false;
  apiError: string | null = null;
  showSuccessAlert = false;
  mostrarVerificacionCodigo = false;
  codigoVerificacion = '';
  codigoError: string | null = null;

  nombreTouched = false;
  correoTouched = false;
  cedulaTouched = false;
  contrasenaTouched = false;
  confirmarContrasenaTouched = false;
  institucionTouched = false;

  get nombreError(): string | null {
    if (!this.nombreTouched) return null;
    if (!this.nombreCompleto.trim()) return 'El nombre es obligatorio';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(this.nombreCompleto)) return 'Solo se permiten letras y espacios';
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

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

  async onRegister() {
    this.nombreTouched = true;
    this.correoTouched = true;
    this.cedulaTouched = true;
    this.contrasenaTouched = true;
    this.confirmarContrasenaTouched = true;
    this.institucionTouched = true;

    if (!this.isValid()) return;

    this.isLoading = true;
    this.apiError = null;

    try {
      const response = await this.authService.registro(
        this.nombreCompleto,
        this.correo,
        this.contrasena,
        this.cedulaProfesional,
        this.institucion
      ).toPromise();

      if (response?.success) {
        this.ngZone.run(() => {
          this.showSuccessAlert = true;
          this.cdr.markForCheck();
        });

        setTimeout(() => {
          this.ngZone.run(() => {
            this.showSuccessAlert = false;
            this.mostrarVerificacionCodigo = true;
            this.codigoVerificacion = '';
            this.codigoError = null;
            this.cdr.markForCheck();
          });
        }, 2000);
      }
    } catch (error: any) {
      this.ngZone.run(() => {
        this.apiError = error.error?.message || error.message || 'Error al registrar.';
        this.cdr.markForCheck();
      });
      console.error('Error en registro:', error);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  async verificarCodigo() {
    if (!this.codigoVerificacion || this.codigoVerificacion.length !== 6) {
      this.codigoError = 'El código debe tener 6 dígitos';
      return;
    }

    if (!/^\d+$/.test(this.codigoVerificacion)) {
      this.codigoError = 'El código debe contener solo números';
      return;
    }

    this.codigoError = null;
    this.isLoading = true;

    try {
      const response = await this.authService.verificarCodigo(
        this.correo,
        this.codigoVerificacion
      ).toPromise();

      if (response?.success) {
        this.ngZone.run(() => {
          this.mostrarVerificacionCodigo = false;
          this.cdr.markForCheck();
        });
        alert('✅ ' + response.message);
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.ngZone.run(() => {
        this.codigoError = error.error?.message || error.message || 'Código inválido.';
        this.cdr.markForCheck();
      });
      console.error('Error en verificación:', error);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  async reenviarCodigo() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.codigoError = null;

    try {
      const response = await this.authService.reenviarCodigo(this.correo).toPromise();
      if (response) {
        alert('✅ ' + response.message);
      }
    } catch (error: any) {
      this.ngZone.run(() => {
        this.codigoError = error.error?.message || error.message || 'Error al reenviar código.';
        this.cdr.markForCheck();
      });
      console.error('Error al reenviar:', error);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  closeSuccessAlert() {
    this.showSuccessAlert = false;
  }

  cerrarVerificacion() {
    this.mostrarVerificacionCodigo = false;
  }

  goToLogin() { 
    this.router.navigate(['/login']); 
  }
  
  onNombreBlur() { this.nombreTouched = true; }
  onCorreoBlur() { this.correoTouched = true; }
  onCedulaBlur() { this.cedulaTouched = true; }
  onContrasenaBlur() { this.contrasenaTouched = true; }
  onConfirmarContrasenaBlur() { this.confirmarContrasenaTouched = true; }
  onInstitucionBlur() { this.institucionTouched = true; }
  openPrivacyModal() { this.showPrivacyModal = true; }
  closePrivacyModal() { this.showPrivacyModal = false; }
}