import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { InputField } from '../../shared/components/input-field/input-field';
import { Button } from '../../shared/components/button/button';
import { Logo } from '../../shared/components/logo/logo';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputField, Button, Logo, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';

  // Estados
  isLoading = false;
  apiError: string | null = null;

  // Validación touch
  emailTouched = false;
  passwordTouched = false;

  get emailError(): string | null {
    if (!this.emailTouched) return null;
    if (!this.email) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Formato de correo inválido';
    return null;
  }

  get passwordError(): string | null {
    if (!this.passwordTouched) return null;
    if (!this.password) return 'La contraseña es obligatoria';
    if (this.password.length < 8) return 'Mínimo 8 caracteres';
    return null;
  }

  isValid(): boolean {
    return !this.emailError && !this.passwordError && !!this.email && !!this.password;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async onLogin() {
    // Marcar todos los campos como tocados para mostrar errores
    this.emailTouched = true;
    this.passwordTouched = true;
    this.apiError = null;

    if (!this.isValid()) return;

    this.isLoading = true;

    try {
      const response = await this.authService.login(this.email, this.password).toPromise();

      if (response?.success) {
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      }
    } catch (error: any) {
      this.ngZone.run(() => {
        this.apiError = error.message || 'Error al iniciar sesión.';
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } finally {
      // Solo resetear isLoading si hubo error (el éxito navega fuera)
      if (this.apiError) {
        this.isLoading = false;
      }
    }
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  onEmailBlur()    { this.emailTouched = true; }
  onPasswordBlur() { this.passwordTouched = true; }
}