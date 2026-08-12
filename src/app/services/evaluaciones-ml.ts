import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface PacienteEvaluacion {
  paciente_id: number;
  paciente_nombre: string;
  correo: string;
  telefono: string;
  total_evaluaciones: number;
  ultima_evaluacion: string;
  ultima_prediccion: number;
  ultima_probabilidad: number;
  nivel_riesgo: 'ALTO' | 'MEDIO' | 'BAJO';
}

export interface EvaluacionHistorial {
  id: number;
  fecha: string;
  prediccion: number;
  prediccion_label: 'Parkinson' | 'Sano';
  probabilidad_parkinson: number;
  probabilidad_sano: number;
  confianza: number;
  modelo_version: string;
  threshold_usado: number;
  tiempo_ejecucion_ms: number;
  features_enviadas: number;
}

export interface AnalisisPaciente {
  total_evaluaciones: number;
  evaluaciones_parkinson: number;
  evaluaciones_sano: number;
  promedio_probabilidad: number;
  nivel_riesgo_actual: string;
  recomendacion: string;
  ultima_actualizacion: string;
}

export interface DetalleEvaluacionesResponse {
  success: boolean;
  data: {
    paciente: {
      id: number;
      nombre: string;
      edad: number;
      correo: string;
      telefono: string;
    };
    analisis: AnalisisPaciente | null;
    historial: EvaluacionHistorial[];
  };
}

export interface ResumenEvaluacionesResponse {
  success: boolean;
  data: {
    total_pacientes_evaluados: number;
    total_evaluaciones: number;
    probabilidad_promedio: number;
    total_parkinson: number;
    total_sanos: number;
    distribucion_riesgo: {
      alto: number;
      medio: number;
      bajo: number;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  total?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class EvaluacionesMLService {
  private apiUrl = '/api/evaluaciones-ml';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtener lista de pacientes con evaluaciones ML
   */
  obtenerPacientesConEvaluaciones(): Observable<ApiResponse<PacienteEvaluacion[]>> {
    return this.http.get<ApiResponse<PacienteEvaluacion[]>>(
      `${this.apiUrl}/pacientes`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener detalle completo de evaluaciones de un paciente
   */
  obtenerDetallePaciente(pacienteId: number): Observable<DetalleEvaluacionesResponse> {
    return this.http.get<DetalleEvaluacionesResponse>(
      `${this.apiUrl}/paciente/${pacienteId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener resumen estadístico de todas las evaluaciones
   */
  obtenerResumen(): Observable<ResumenEvaluacionesResponse> {
    return this.http.get<ResumenEvaluacionesResponse>(
      `${this.apiUrl}/resumen`,
      { headers: this.getHeaders() }
    );
  }
}