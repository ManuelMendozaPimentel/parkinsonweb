import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface Medicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
}

export interface DatosClinicos {
  diagnostico: string;
  estadio_hoehn_yahr: string;
  medicamentos: Medicamento[];
  notas_clinicas: string;
}

export interface Paciente {
  id: number;
  nombre_completo: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  edad: number;
  fecha_vinculacion: string;
  diagnostico: string | null;
  estadio_hoehn_yahr: string | null;
  medicamentos: Medicamento[] | null;
  notas_clinicas: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private apiUrl = 'http://localhost:3000/api/pacientes';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  listarPacientes(): Observable<ApiResponse<Paciente[]>> {
    return this.http.get<ApiResponse<Paciente[]>>(
      this.apiUrl,
      { headers: this.headers() }
    );
  }

  obtenerPaciente(id: number): Observable<ApiResponse<Paciente>> {
    return this.http.get<ApiResponse<Paciente>>(
      `${this.apiUrl}/${id}`,
      { headers: this.headers() }
    );
  }

  actualizarDatosClinicos(id: number, datos: Partial<DatosClinicos>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiUrl}/${id}/datos-clinicos`,
      datos,
      { headers: this.headers() }
    );
  }

  desvincularPaciente(id: number, motivo?: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/${id}/vincular`,
      {
        headers: this.headers(),
        body: { motivo: motivo || null }
      }
    );
  }
}