import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface RegistroResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    nombre_completo: string;
    correo: string;
    codigo_vinculacion: string;
    correo_verificado: boolean;
    cedula_verificada: boolean;
    cuenta_activa: boolean;
    code_expires_in?: string;
  };
}

export interface VerificarCodigoRequest {
  correo: string;
  codigo: string;
}

export interface VerificarCodigoResponse {
  success: boolean;
  message: string;
  data: {
    correo_verificado: boolean;
    cedula_verificada: boolean;
    cuenta_activa: boolean;
    next_step?: string;
  };
}

export interface ReenviarCodigoRequest {
  correo: string;
}

export interface ReenviarCodigoResponse {
  success: boolean;
  message: string;
  data: {
    code_expires_in: string;
    intentos_restantes: number;
  };
}
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    doctor: {
      id: number;
      nombre_completo: string;
      correo: string;
      especialidad: string;
      codigo_vinculacion: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://magapi-production.up.railway.app/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * Registrar nuevo doctor
   */
  registro(
    nombre_completo: string,
    correo: string,
    password: string,
    cedula_profesional: string,
    institucion_procedencia: string,
    especialidad?: string,
    telefono?: string
  ): Observable<RegistroResponse> {
    const body = {
      nombre_completo,
      correo,
      password,
      cedula_profesional,
      institucion_procedencia,
      especialidad,
      telefono
    };

    return this.http.post<RegistroResponse>(`${this.apiUrl}/registro`, body).pipe(
      tap(response => {
        console.log('✅ Registro exitoso:', response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verificar código de 6 dígitos
   */
  verificarCodigo(correo: string, codigo: string): Observable<VerificarCodigoResponse> {
    const body: VerificarCodigoRequest = { correo, codigo };

    return this.http.post<VerificarCodigoResponse>(
      `${this.apiUrl}/verificar-codigo`,
      body
    ).pipe(
      tap(response => {
        console.log('✅ Código verificado:', response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Reenviar código de verificación
   */
  reenviarCodigo(correo: string): Observable<ReenviarCodigoResponse> {
    const body: ReenviarCodigoRequest = { correo };

    return this.http.post<ReenviarCodigoResponse>(
      `${this.apiUrl}/reenviar-codigo`,
      body
    ).pipe(
      tap(response => {
        console.log('✅ Código reenviado:', response);
      }),
      catchError(this.handleError)
    );
  }

   login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('doctor', JSON.stringify(response.data.doctor));
          console.log(' Login exitoso:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getDoctorData() {
    const data = localStorage.getItem('doctor');
    return data ? JSON.parse(data) : null;
  }
  // ───────────────────────────────────────────────────────

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 400)      errorMessage = error.error?.message || 'Datos inválidos';
      else if (error.status === 401) errorMessage = error.error?.message || 'Correo o contraseña incorrectos';
      else if (error.status === 403) errorMessage = error.error?.message || 'Cuenta no verificada o inactiva';
      else if (error.status === 409) errorMessage = error.error?.message || 'El correo o cédula ya están registrados';
      else if (error.status === 429) errorMessage = error.error?.message || 'Demasiados intentos. Intenta más tarde';
      else if (error.status === 500) errorMessage = 'Error interno del servidor';
      else                           errorMessage = `Error ${error.status}: ${error.message}`;
    }

    console.error('❌ Error en API:', error);
    return throwError(() => new Error(errorMessage));
  }
}