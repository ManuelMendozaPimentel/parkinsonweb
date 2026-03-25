import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';
import { DashboardService, DashboardResumenResponse, AlertaDetallada, CitaAgrupada } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarMenu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  isMenuOpen = false;
  
  // Datos del dashboard
  loading = true;
  error: string | null = null;
  
  // Cards estadísticas
  totalPacientes = 0;
  alertasHoy = 0;
  pacientesSinEvaluacion = 0;
  
  // Citas
  citasHoy: CitaAgrupada[] = [];
  citasManana: CitaAgrupada[] = [];
  citasSemana: CitaAgrupada[] = [];
  
  // Alertas
  alertas: AlertaDetallada[] = [];
  
  // Actividad para gráfica
  actividadReciente: { dia: string; consultas: number }[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  onMenuToggle(open: boolean): void {
    this.isMenuOpen = open;
  }

  cargarDashboard(): void {
    this.loading = true;
    this.error = null;
    
    // Cargar resumen
    this.dashboardService.obtenerResumen().subscribe({
      next: (response) => {
        if (response.success) {
          this.totalPacientes = response.data.total_pacientes_activos;
          this.alertasHoy = response.data.alertas_pendientes.length;
          this.pacientesSinEvaluacion = this.calcularPacientesSinEvaluacion(response.data.alertas_pendientes);
          this.actividadReciente = response.data.actividad_reciente;
        }
      },
      error: (err) => {
        console.error('Error cargando resumen:', err);
        this.error = err.message;
      }
    });
    
    // Cargar citas próximas
    this.dashboardService.listarCitasProximas(14).subscribe({
      next: (response) => {
        if (response.success) {
          this.citasHoy = response.data.hoy;
          this.citasManana = response.data.manana;
          this.citasSemana = response.data.esta_semana;
        }
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
      }
    });
    
    // Cargar alertas
    this.dashboardService.listarAlertas(20).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertas = response.data;
        }
      },
      error: (err) => {
        console.error('Error cargando alertas:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  private calcularPacientesSinEvaluacion(alertas: any[]): number {
    // Pacientes sin consulta en últimos 90 días
    return alertas.filter(a => a.tipo === 'SIN_CONSULTA').length;
  }
  
  // Obtener todas las citas para mostrar en tabla (hoy + mañana + semana)
  getTodasCitas(): CitaAgrupada[] {
    return [...this.citasHoy, ...this.citasManana, ...this.citasSemana];
  }
  
  // Verificar si hay citas
  get hayCitas(): boolean {
    return this.citasHoy.length > 0 || this.citasManana.length > 0 || this.citasSemana.length > 0;
  }
  
  // Formatear hora
  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Obtener clase de severidad
  getSeveridadClass(severidad: string): string {
    switch (severidad) {
      case 'ALTA': return 'severidad-alta';
      case 'MEDIA': return 'severidad-media';
      default: return 'severidad-baja';
    }
  }

  getMaxConsultas(): number {
  if (this.actividadReciente.length === 0) return 1;
  const max = Math.max(...this.actividadReciente.map(d => d.consultas));
  return max === 0 ? 1 : max;
}

// Calcular altura de barra
getBarHeight(consultas: number, max: number): number {
  if (max === 0) return 0;
  return (consultas / max) * 100;
}
}