import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';
import { 
  EvaluacionesMLService, 
  PacienteEvaluacion, 
  DetalleEvaluacionesResponse,
  EvaluacionHistorial,
  AnalisisPaciente
} from '../../services/evaluaciones-ml';

@Component({
  selector: 'app-evaluaciones-ml',
  standalone: true,
  imports: [CommonModule, SidebarMenu],
  templateUrl: './evaluaciones-ml.html',
  styleUrl: './evaluaciones-ml.css',
})
export class EvaluacionesMl implements OnInit {
  isMenuOpen = false;
  
  // Estados de carga
  loading = true;
  loadingDetalle = false;
  apiError: string | null = null;
  
  // Datos
  pacientes: PacienteEvaluacion[] = [];
  pacienteSeleccionado: PacienteEvaluacion | null = null;
  detalleEvaluaciones: DetalleEvaluacionesResponse | null = null;
  
  // Vista actual: 'lista' | 'detalle'
  vistaActual: 'lista' | 'detalle' = 'lista';

  constructor(
    private router: Router,
    private evaluacionesService: EvaluacionesMLService
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  onMenuToggle(open: boolean): void {
    this.isMenuOpen = open;
  }

  cargarPacientes(): void {
    this.loading = true;
    this.apiError = null;
    
    this.evaluacionesService.obtenerPacientesConEvaluaciones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pacientes = response.data;
        } else {
          this.apiError = 'No se pudieron cargar las evaluaciones.';
        }
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        this.apiError = 'Error al cargar las evaluaciones. Intente nuevamente.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  verDetalle(paciente: PacienteEvaluacion): void {
    this.pacienteSeleccionado = paciente;
    this.vistaActual = 'detalle';
    this.cargarDetallePaciente(paciente.paciente_id);
  }

  cargarDetallePaciente(pacienteId: number): void {
    this.loadingDetalle = true;
    this.apiError = null;
    
    this.evaluacionesService.obtenerDetallePaciente(pacienteId).subscribe({
      next: (response) => {
        if (response.success) {
          this.detalleEvaluaciones = response;
        } else {
          this.apiError = 'No se pudo cargar el detalle del paciente.';
        }
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.apiError = 'Error al cargar el detalle del paciente.';
      },
      complete: () => {
        this.loadingDetalle = false;
      }
    });
  }

  volverALista(): void {
    this.vistaActual = 'lista';
    this.pacienteSeleccionado = null;
    this.detalleEvaluaciones = null;
    this.apiError = null;
  }

  // Helpers para la vista
  getNivelRiesgoClass(nivel: string): string {
    switch (nivel?.toLowerCase()) {
      case 'alto': return 'riesgo-alto';
      case 'medio': return 'riesgo-medio';
      case 'bajo': return 'riesgo-bajo';
      default: return '';
    }
  }

  getPrediccionLabel(prediccion: number): string {
    return prediccion === 1 ? 'Parkinson' : 'Sano';
  }

  getPrediccionClass(prediccion: number): string {
    return prediccion === 1 ? 'prediccion-parkinson' : 'prediccion-sano';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSemafaroColor(probabilidad: number): string {
    if (probabilidad >= 70) return '#dc3545'; // Rojo
    if (probabilidad >= 50) return '#ffc107'; // Amarillo
    return '#28a745'; // Verde
  }

  getContadorRiesgo(nivel: string): number {
    return this.pacientes.filter(p => p.nivel_riesgo === nivel).length;
  }
}