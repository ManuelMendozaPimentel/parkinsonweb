import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA' | 'REPROGRAMADA';
export type TipoCita   = 'CONSULTA'  | 'SEGUIMIENTO' | 'URGENCIA'  | 'ESTUDIO';

export interface Cita {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_correo: string;
  paciente_telefono: string;
  fecha_hora: string;
  fecha: string;
  hora: string;
  duracion_minutos: number;
  tipo: TipoCita;
  estado: EstadoCita;
  notas: string | null;
  motivo_cancelacion: string | null;
  recordatorio_enviado: boolean;
  confirmacion_paciente: boolean;
  consultorio_id: number | null;
  consultorio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CitaDetalle extends Cita {
  fecha_nacimiento: string;
  consulta_id: number | null;
  consultorio_direccion: string | null;
  consultorio_telefono: string | null;
}

export interface FiltrosCitas {
  paciente_id?: number;
  estado?: EstadoCita;
  fecha?: string;
  desde?: string;
  hasta?: string;
  limit?: number;
  offset?: number;
}

export interface CrearCitaRequest {
  paciente_id: number;
  consultorio_id?: number;
  fecha_hora: string;
  duracion_minutos?: number;
  tipo?: TipoCita;
  notas?: string;
}

export interface ActualizarCitaRequest {
  fecha_hora?: string;
  duracion_minutos?: number;
  tipo?: TipoCita;
  consultorio_id?: number;
  notas?: string;
  estado?: EstadoCita;
}

export interface ReprogramarCitaRequest {
  nueva_fecha_hora: string;
  motivo?: string;
}

export interface PaginacionResponse {
  total: number;
  limit: number;
  offset: number;
  next_offset: number | null;
}

export interface CitasListResponse {
  success: boolean;
  data: Cita[];
  pagination: PaginacionResponse;
}

export interface CitaResponse {
  success: boolean;
  message?: string;
  data: Cita | CitaDetalle;
}

export interface ReprogramarResponse {
  success: boolean;
  message: string;
  data: {
    cita_original_id: number;
    cita_nueva_id: number;
    nueva_fecha_hora: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CitasService {
  private apiUrl = 'https://magapi-production.up.railway.app/api/citas';

  constructor(private http: HttpClient) {}

  listarCitas(filtros: FiltrosCitas = {}): Observable<CitasListResponse> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<CitasListResponse>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerCita(id: number): Observable<CitaResponse> {
    return this.http.get<CitaResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  crearCita(body: CrearCitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.apiUrl, body).pipe(
      tap(r => console.log('✅ Cita creada:', r)),
      catchError(this.handleError)
    );
  }

  actualizarCita(id: number, body: ActualizarCitaRequest): Observable<CitaResponse> {
    return this.http.put<CitaResponse>(`${this.apiUrl}/${id}`, body).pipe(
      tap(r => console.log('✅ Cita actualizada:', r)),
      catchError(this.handleError)
    );
  }

  cancelarCita(id: number, motivo?: string): Observable<CitaResponse> {
    let params = new HttpParams();
    if (motivo) params = params.set('motivo', motivo);
    return this.http.delete<CitaResponse>(`${this.apiUrl}/${id}`, { params }).pipe(
      tap(r => console.log('✅ Cita cancelada:', r)),
      catchError(this.handleError)
    );
  }

  confirmarCita(id: number): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(`${this.apiUrl}/${id}/confirmar`, {}).pipe(
      tap(r => console.log('✅ Cita confirmada:', r)),
      catchError(this.handleError)
    );
  }

  reprogramarCita(id: number, body: ReprogramarCitaRequest): Observable<ReprogramarResponse> {
    return this.http.post<ReprogramarResponse>(`${this.apiUrl}/${id}/reprogramar`, body).pipe(
      tap(r => console.log('✅ Cita reprogramada:', r)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let msg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    } else {
      const m = error.error?.message;
      if      (error.status === 400) msg = m || 'Datos inválidos';
      else if (error.status === 401) msg = m || 'No autorizado';
      else if (error.status === 404) msg = m || 'Cita no encontrada';
      else if (error.status === 409) msg = m || 'Conflicto de horario';
      else if (error.status === 500) msg = 'Error interno del servidor';
      else                           msg = `Error ${error.status}: ${error.message}`;
    }
    console.error('❌ Error CitasService:', error);
    return throwError(() => new Error(msg));
  }
}