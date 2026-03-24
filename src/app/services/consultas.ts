import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface ConsultaMedicamento {
  id?: number;
  nombre: string;
  dosis: string | null;
  frecuencia: string | null;
  duracion: string | null;
}

export interface ConsultaItem {
  id: number;
  created_at: string;
  paciente_id: number;
  paciente_nombre: string;
  diagnostico: string;
  proxima_cita: string | null;
  total_medicamentos: number;
}

export interface ConsultaDetalle extends ConsultaItem {
  motivo_consulta: string;
  plan_tratamiento: string | null;
  indicaciones: string | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  presion_arterial: string | null;
  frecuencia_cardiaca: number | null;
  temperatura: number | null;
  glucosa: number | null;
  paciente_correo: string;
  paciente_edad: number;
  diagnostico_base: string | null;
  estadio_base: string | null;
  medicamentos: ConsultaMedicamento[];
}

export interface CrearConsultaPayload {
  paciente_id: number;
  motivo_consulta: string;
  diagnostico: string;
  plan_tratamiento?: string;
  indicaciones?: string;
  proxima_cita?: string;
  peso?: number | null;
  talla?: number | null;
  imc?: number | null;
  presion_arterial?: string;
  frecuencia_cardiaca?: number | null;
  temperatura?: number | null;
  glucosa?: number | null;
  medicamentos: ConsultaMedicamento[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class ConsultasService {
  private apiUrl = 'https://magapi-production.up.railway.app/api/consultas';

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

  listarConsultas(limit = 50, offset = 0): Observable<ApiResponse<ConsultaItem[]>> {
    return this.http.get<ApiResponse<ConsultaItem[]>>(
      `${this.apiUrl}?limit=${limit}&offset=${offset}`,
      { headers: this.headers() }
    );
  }

  listarConsultasPaciente(pacienteId: number): Observable<ApiResponse<ConsultaDetalle[]>> {
    return this.http.get<ApiResponse<ConsultaDetalle[]>>(
      `${this.apiUrl}/paciente/${pacienteId}`,
      { headers: this.headers() }
    );
  }

  obtenerConsulta(id: number): Observable<ApiResponse<ConsultaDetalle>> {
    return this.http.get<ApiResponse<ConsultaDetalle>>(
      `${this.apiUrl}/${id}`,
      { headers: this.headers() }
    );
  }

  crearConsulta(payload: CrearConsultaPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      this.apiUrl,
      payload,
      { headers: this.headers() }
    );
  }
}