import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth';

export interface DashboardResumenResponse {
  success: boolean;
  data: {
    total_pacientes_activos: number;
    consultas_este_mes: number;
    consultas_semana_actual: number;
    citas_proximas: CitaProxima[];
    alertas_pendientes: Alerta[];
    actividad_reciente: ActividadDiaria[];
  };
}

export interface CitaProxima {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  fecha_hora: string;
  duracion: number;
  tipo: string;
  estado: string;
  consultorio: string | null;
}

export interface Alerta {
  paciente_id: number;
  paciente_nombre: string;
  tipo: string;
  mensaje: string;
  dias_sin_consulta?: number;
}

export interface ActividadDiaria {
  dia: string;
  fecha: string;
  consultas: number;
}

export interface AlertaResponse {
  success: boolean;
  data: AlertaDetallada[];
  total: number;
  limit: number;
  offset: number;
}

export interface AlertaDetallada {
  id: string;
  paciente_id: number;
  paciente_nombre: string;
  correo: string;
  telefono: string;
  tipo: string;
  mensaje: string;
  severidad: 'ALTA' | 'MEDIA' | 'BAJA';
  creada: string;
  dias_sin_consulta?: number;
}

export interface CitasProximasResponse {
  success: boolean;
  data: {
    hoy: CitaAgrupada[];
    manana: CitaAgrupada[];
    esta_semana: CitaAgrupada[];
  };
  total: number;
}

export interface CitaAgrupada {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_correo: string;
  paciente_telefono: string;
  fecha_hora: string;
  fecha: string;
  hora: string;
  duracion_minutos: number;
  tipo: string;
  estado: string;
  notas: string | null;
  consultorio: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://neurotrack.us-east-2.elasticbeanstalk.com/api/dashboard';

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
   * Obtener resumen del dashboard
   */
  obtenerResumen(): Observable<DashboardResumenResponse> {
    return this.http.get<DashboardResumenResponse>(
      `${this.apiUrl}/resumen`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('📊 Dashboard resumen obtenido:', response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Listar alertas
   */
  listarAlertas(limit: number = 10, offset: number = 0): Observable<AlertaResponse> {
    return this.http.get<AlertaResponse>(
      `${this.apiUrl}/alertas?limit=${limit}&offset=${offset}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('⚠️ Alertas obtenidas:', response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Listar citas próximas
   */
  listarCitasProximas(dias: number = 7): Observable<CitasProximasResponse> {
    return this.http.get<CitasProximasResponse>(
      `${this.apiUrl}/citas-proximas?dias=${dias}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('📅 Citas próximas obtenidas:', response);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error al cargar datos del dashboard';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    console.error('❌ Error en DashboardService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
