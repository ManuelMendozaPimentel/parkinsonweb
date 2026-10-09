import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth';

export interface Mensaje {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_correo: string | null;
  paciente_telefono: string | null;
  motivo: string;
  sintomas: string[];
  desde_cuando: string | null;
  detalles: string | null;
  leido: boolean;
  created_at: string;
  total_respuestas: number;
  respondido: boolean;
}

export interface RespuestaMensaje {
  id: number;
  doctor_id?: number;
  mensaje_id?: number;
  texto: string;
  leido_paciente: boolean;
  created_at: string;
}

export interface MensajeDetalle {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_correo: string | null;
  paciente_telefono: string | null;
  fecha_nacimiento?: string | null;
  motivo: string;
  sintomas: string[];
  desde_cuando: string | null;
  detalles: string | null;
  leido: boolean;
  created_at: string;
  respuestas: RespuestaMensaje[];
}

export interface ListaMensajesResponse {
  success: boolean;
  data: Mensaje[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    next_offset: number | null;
  };
}

export interface FiltrosMensajes {
  leido?: boolean;
  respondido?: boolean;
  paciente_id?: number;
  motivo?: string;
  limit?: number;
  offset?: number;
}

export interface PacienteOpcion {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class MensajesService {
  private apiUrl = '/api/mensajes';
  private pacientesUrl = '/api/pacientes';

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
   * Listar mensajes con filtros y paginación
   */
  listar(filtros: FiltrosMensajes = {}): Observable<ListaMensajesResponse> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });

    return this.http.get<ListaMensajesResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(m => ({ ...m, sintomas: m.sintomas ?? [] }))
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Cantidad de mensajes sin leer
   */
  contarNoLeidos(): Observable<number> {
    return this.http.get<{ success: boolean; data: { no_leidos: number } }>(
      `${this.apiUrl}/no-leidos/count`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data.no_leidos),
      catchError(this.handleError)
    );
  }

  /**
   * Detalle del mensaje con sus respuestas (la API lo marca como leído)
   */
  obtener(id: number): Observable<MensajeDetalle> {
    return this.http.get<{ success: boolean; data: MensajeDetalle }>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => ({
        ...response.data,
        sintomas: response.data.sintomas ?? [],
        respuestas: response.data.respuestas ?? []
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Marcar como leído / no leído
   */
  marcarLeido(id: number, leido: boolean = true): Observable<{ id: number; leido: boolean }> {
    return this.http.patch<{ success: boolean; data: { id: number; leido: boolean } }>(
      `${this.apiUrl}/${id}/leido`,
      { leido },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Responder al paciente
   */
  responder(id: number, texto: string): Observable<RespuestaMensaje> {
    return this.http.post<{ success: boolean; data: RespuestaMensaje }>(
      `${this.apiUrl}/${id}/responder`,
      { texto },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Lista de pacientes para el filtro (acepta varios formatos de respuesta)
   */
  listarPacientes(): Observable<PacienteOpcion[]> {
    return this.http.get<any>(
      `${this.pacientesUrl}?limit=100`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        const lista: any[] =
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.data?.pacientes) ? response.data.pacientes :
          Array.isArray(response) ? response : [];

        return lista
          .map(p => ({
            id: Number(p.id ?? p.paciente_id),
            nombre: p.nombre_completo ?? p.nombre ?? `Paciente ${p.id ?? p.paciente_id}`
          }))
          .filter(p => !isNaN(p.id))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error al cargar los mensajes';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    console.error('❌ Error en MensajesService:', error);
    return throwError(() => new Error(errorMessage));
  }
}