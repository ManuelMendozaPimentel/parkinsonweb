import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

// ── Interfaces ────────────────────────────────────────────────

export interface Consultorio {
  id: number;
  doctor_id: number;
  nombre_institucion: string;
  es_consultorio_particular: boolean;
  calle: string;
  numero_exterior: string;
  numero_interior: string;
  colonia: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
  pais: string;
  direccion_completa: string;
  telefono_cita: string;
  email_consultorio: string;
  horario_atencion: string;
  reglas_agenda: any;
  activo: boolean;
  es_principal: boolean;
  visible_para_pacientes: boolean;
  mostrar_direccion_completa: boolean;
  mostrar_telefono_cita: boolean;
  mostrar_horario: boolean;
  mostrar_reglas_agenda: boolean;
}

export interface PerfilCompleto {
  id: number;
  nombre_completo: string;
  correo: string;
  cedula_profesional: string;
  telefono: string;
  especialidad: string;
  institucion_procedencia: string;
  biografia_breve: string;
  codigo_vinculacion: string;
  mostrar_cedula: boolean;
  mostrar_especialidad: boolean;
  mostrar_biografia: boolean;
  mostrar_correo: boolean;
  mostrar_telefono_personal: boolean;
  consultorios: Consultorio[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = 'http://localhost:3000/api/perfil';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Genera el header con el JWT en cada request
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // ── Perfil ───────────────────────────────────────────────────

  obtenerPerfil(): Observable<ApiResponse<PerfilCompleto>> {
    return this.http.get<ApiResponse<PerfilCompleto>>(
      this.apiUrl,
      { headers: this.headers() }
    );
  }

  editarPerfil(datos: Partial<PerfilCompleto>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      this.apiUrl,
      datos,
      { headers: this.headers() }
    );
  }

  // ── Seguridad ────────────────────────────────────────────────

  cambiarPassword(password_actual: string, password_nueva: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/cambiar-password`,
      { password_actual, password_nueva },
      { headers: this.headers() }
    );
  }

  solicitarCambioCorreo(nuevo_correo: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/cambiar-correo`,
      { nuevo_correo, password },
      { headers: this.headers() }
    );
  }

  confirmarCambioCorreo(codigo: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/confirmar-correo`,
      { codigo },
      { headers: this.headers() }
    );
  }

  // ── Consultorios ─────────────────────────────────────────────

  listarConsultorios(): Observable<ApiResponse<Consultorio[]>> {
    return this.http.get<ApiResponse<Consultorio[]>>(
      `${this.apiUrl}/consultorios`,
      { headers: this.headers() }
    );
  }

  crearConsultorio(datos: Partial<Consultorio>): Observable<ApiResponse<Consultorio>> {
    return this.http.post<ApiResponse<Consultorio>>(
      `${this.apiUrl}/consultorios`,
      datos,
      { headers: this.headers() }
    );
  }

  editarConsultorio(id: number, datos: Partial<Consultorio>): Observable<ApiResponse<Consultorio>> {
    return this.http.put<ApiResponse<Consultorio>>(
      `${this.apiUrl}/consultorios/${id}`,
      datos,
      { headers: this.headers() }
    );
  }

  eliminarConsultorio(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/consultorios/${id}`,
      { headers: this.headers() }
    );
  }

  actualizarVisibilidadConsultorio(id: number, visibilidad: Partial<Consultorio>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiUrl}/consultorios/${id}/visibilidad`,
      visibilidad,
      { headers: this.headers() }
    );
  }
}