import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';
import {
  MensajesService,
  Mensaje,
  MensajeDetalle,
  PacienteOpcion,
  FiltrosMensajes
} from '../../services/mensajes';

type EstadoFiltro = 'pendientes' | 'no_leidos' | 'respondidos' | 'todos';
type Severidad = 'ALTA' | 'MEDIA' | 'BAJA';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarMenu],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class Alertas implements OnInit {

  isMenuOpen = false;

  readonly MOTIVOS = [
    'Síntomas nuevos o peores',
    'Dudas con mi medicamento',
    'Efectos secundarios',
    'Solicitar cita',
    'Otro'
  ];
  readonly LIMITE = 20;
  readonly MAX_RESPUESTA = 2000;

  // Lista
  mensajes: Mensaje[] = [];
  total = 0;
  nextOffset: number | null = null;
  noLeidos = 0;
  pacientes: PacienteOpcion[] = [];

  cargando = false;
  cargandoMas = false;
  error: string | null = null;

  // Filtros
  filtroEstado: EstadoFiltro = 'pendientes';
  filtroMotivo = '';
  filtroPaciente: number | null = null;

  // Modal
  modalAbierto = false;
  mensajeSeleccionado: Mensaje | null = null;
  detalle: MensajeDetalle | null = null;
  cargandoDetalle = false;
  errorDetalle: string | null = null;
  textoRespuesta = '';
  enviando = false;
  errorEnvio: string | null = null;

  // Evita que una respuesta vieja pise a una nueva si cambian los filtros rápido
  private peticionActual = 0;

  constructor(private mensajesService: MensajesService) {}

  ngOnInit(): void {
    this.cargarPacientes();
    this.cargarMensajes();
    this.cargarNoLeidos();
  }

  onMenuToggle(isOpen: boolean): void {
    this.isMenuOpen = isOpen;
  }

  // ============================================
  // CARGA DE DATOS
  // ============================================

  private construirFiltros(offset: number): FiltrosMensajes {
    const filtros: FiltrosMensajes = { limit: this.LIMITE, offset };

    switch (this.filtroEstado) {
      case 'pendientes':  filtros.respondido = false; break;
      case 'no_leidos':   filtros.leido = false;      break;
      case 'respondidos': filtros.respondido = true;  break;
    }

    if (this.filtroMotivo) filtros.motivo = this.filtroMotivo;
    if (this.filtroPaciente !== null) filtros.paciente_id = this.filtroPaciente;

    return filtros;
  }

  cargarMensajes(): void {
    const peticion = ++this.peticionActual;
    this.cargando = true;
    this.error = null;

    this.mensajesService.listar(this.construirFiltros(0)).subscribe({
      next: (response) => {
        if (peticion !== this.peticionActual) return;
        this.mensajes = response.data;
        this.total = response.pagination.total;
        this.nextOffset = response.pagination.next_offset;
        this.cargando = false;
      },
      error: (err) => {
        if (peticion !== this.peticionActual) return;
        this.error = err.message;
        this.mensajes = [];
        this.cargando = false;
      }
    });
  }

  cargarMas(): void {
    if (this.nextOffset === null || this.cargandoMas) return;

    const peticion = this.peticionActual;
    this.cargandoMas = true;

    this.mensajesService.listar(this.construirFiltros(this.nextOffset)).subscribe({
      next: (response) => {
        if (peticion !== this.peticionActual) return;
        this.mensajes = [...this.mensajes, ...response.data];
        this.total = response.pagination.total;
        this.nextOffset = response.pagination.next_offset;
        this.cargandoMas = false;
      },
      error: (err) => {
        this.error = err.message;
        this.cargandoMas = false;
      }
    });
  }

  cargarNoLeidos(): void {
    this.mensajesService.contarNoLeidos().subscribe({
      next: (total) => this.noLeidos = total,
      error: () => this.noLeidos = 0
    });
  }

  cargarPacientes(): void {
    this.mensajesService.listarPacientes().subscribe({
      next: (lista) => this.pacientes = lista,
      error: () => this.pacientes = []
    });
  }

  actualizar(): void {
    this.cargarMensajes();
    this.cargarNoLeidos();
  }

  // ============================================
  // FILTROS
  // ============================================

  get hayFiltros(): boolean {
    return this.filtroEstado !== 'pendientes' || !!this.filtroMotivo || this.filtroPaciente !== null;
  }

  onFiltroChange(): void {
    this.cargarMensajes();
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'pendientes';
    this.filtroMotivo = '';
    this.filtroPaciente = null;
    this.cargarMensajes();
  }

  // ============================================
  // MODAL
  // ============================================

  abrirMensaje(mensaje: Mensaje): void {
    this.mensajeSeleccionado = mensaje;
    this.detalle = null;
    this.textoRespuesta = '';
    this.errorDetalle = null;
    this.errorEnvio = null;
    this.modalAbierto = true;
    this.cargarDetalle();
  }

  cargarDetalle(): void {
    const mensaje = this.mensajeSeleccionado;
    if (!mensaje) return;

    const eraNoLeido = !mensaje.leido;
    this.cargandoDetalle = true;
    this.errorDetalle = null;

    this.mensajesService.obtener(mensaje.id).subscribe({
      next: (detalle) => {
        if (this.mensajeSeleccionado?.id !== detalle.id) return;
        this.detalle = detalle;
        this.cargandoDetalle = false;

        // La API ya lo marcó como leído: reflejarlo sin recargar la lista
        if (eraNoLeido) {
          mensaje.leido = true;
          this.noLeidos = Math.max(0, this.noLeidos - 1);
        }
      },
      error: (err) => {
        this.errorDetalle = err.message;
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.mensajeSeleccionado = null;
    this.detalle = null;
    this.textoRespuesta = '';
    this.errorDetalle = null;
    this.errorEnvio = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalAbierto && !this.enviando) {
      this.cerrarModal();
    }
  }

  enviarRespuesta(): void {
    const texto = this.textoRespuesta.trim();
    const detalle = this.detalle;
    const mensaje = this.mensajeSeleccionado;

    if (!texto || !detalle || this.enviando) return;

    this.enviando = true;
    this.errorEnvio = null;

    this.mensajesService.responder(detalle.id, texto).subscribe({
      next: (respuesta) => {
        detalle.respuestas = [...detalle.respuestas, respuesta];
        this.textoRespuesta = '';
        this.enviando = false;

        if (mensaje) {
          mensaje.respondido = true;
          mensaje.leido = true;
          mensaje.total_respuestas = (mensaje.total_respuestas || 0) + 1;
        }
      },
      error: (err) => {
        this.errorEnvio = err.message;
        this.enviando = false;
      }
    });
  }

  verHistorialPaciente(): void {
    const mensaje = this.mensajeSeleccionado;
    if (!mensaje) return;

    // Asegura que el paciente exista en el filtro aunque no venga en la lista
    if (!this.pacientes.some(p => p.id === mensaje.paciente_id)) {
      this.pacientes = [...this.pacientes, { id: mensaje.paciente_id, nombre: mensaje.paciente_nombre }];
    }

    this.filtroPaciente = mensaje.paciente_id;
    this.filtroEstado = 'todos';
    this.filtroMotivo = '';
    this.cerrarModal();
    this.cargarMensajes();
  }

  // ============================================
  // UTILIDADES DE VISTA
  // ============================================

  getSeveridad(mensaje: { motivo: string; sintomas: string[] }): Severidad {
    if (
      mensaje.sintomas?.includes('Caídas o pérdida de equilibrio') ||
      mensaje.motivo === 'Síntomas nuevos o peores'
    ) {
      return 'ALTA';
    }
    if (mensaje.motivo === 'Efectos secundarios') {
      return 'MEDIA';
    }
    return 'BAJA';
  }

  getSeveridadClass(mensaje: { motivo: string; sintomas: string[] }): string {
    switch (this.getSeveridad(mensaje)) {
      case 'ALTA':  return 'severidad-alta';
      case 'MEDIA': return 'severidad-media';
      default:      return 'severidad-baja';
    }
  }

  formatearFecha(iso: string | null | undefined): string {
    if (!iso) return '';

    const fecha = new Date(iso);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (fecha.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`;
    if (fecha.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`;

    const dia = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${dia}, ${hora}`;
  }

  trackById(_: number, mensaje: Mensaje): number {
    return mensaje.id;
  }
}