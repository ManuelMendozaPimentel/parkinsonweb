import {
  Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  CitasService, Cita, CitaDetalle, EstadoCita, TipoCita,
  CrearCitaRequest, FiltrosCitas
} from '../../services/citas';
import { PacientesService, Paciente } from '../../services/pacientes';
import { PerfilService, Consultorio } from '../../services/perfil';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

type ModalMode = 'crear' | 'detalle' | 'reprogramar' | 'cancelar' | null;

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarMenu],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css']
})
export class CitasComponent implements OnInit, OnDestroy {
  isMenuOpen = false;

  onMenuToggle(open: boolean): void {
    this.isMenuOpen = open;
  }

  // ── Lista ──────────────────────────────────────────────
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  cargando = false;
  errorApi = '';

  // ── Paginación ─────────────────────────────────────────
  totalRegistros = 0;
  paginaActual = 0;
  limitePorPagina = 20;

  // ── Filtros ────────────────────────────────────────────
  filtroTexto = '';
  filtroEstado = '';
  filtroFecha = '';

  // ── Modal ──────────────────────────────────────────────
  modalMode: ModalMode = null;
  citaSeleccionada: CitaDetalle | null = null;
  cargandoDetalle = false;
  errorDetalle = '';

  // ── Datos para formulario ─────────────────────────────
  pacientes: Paciente[] = [];
  consultorios: Consultorio[] = [];
  pacienteSeleccionado: Paciente | null = null;
  busquedaPaciente = '';
  resultadosPacientes: Paciente[] = [];

  // ── Formulario crear ───────────────────────────────────
  form: CrearCitaRequest = {
    paciente_id: 0,
    fecha_hora: '',
    duracion_minutos: 30, // Fijo 30 minutos
    tipo: 'CONSULTA',
    notas: ''
  };
  formFecha = '';
  formHora = '';
  guardando = false;
  errorForm = '';

  // ── Horarios disponibles ───────────────────────────────
  horasDisponibles: string[] = [];
  horariosOcupados: string[] = [];

  // ── Reprogramar ────────────────────────────────────────
  repFecha = '';
  repHora = '';
  repMotivo = '';
  repError = '';

  // ── Cancelar ───────────────────────────────────────────
  cancelMotivo = '';
  cancelError = '';

  // ── Enums para template ────────────────────────────────
  readonly tiposCita: TipoCita[] = ['CONSULTA', 'SEGUIMIENTO', 'URGENCIA', 'ESTUDIO'];
  readonly estadosCita: EstadoCita[] = ['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA'];

  private destroy$ = new Subject<void>();
  private filtroSubject = new Subject<string>();

  constructor(
    private citasService: CitasService,
    private pacientesService: PacientesService,
    private perfilService: PerfilService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarConsultorios();
    this.filtroSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.aplicarFiltros());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga principal ────────────────────────────────────
  cargarCitas(): void {
    this.cargando = true;
    this.errorApi = '';

    const filtros: FiltrosCitas = {
      limit: this.limitePorPagina,
      offset: this.paginaActual * this.limitePorPagina
    };
    if (this.filtroEstado) filtros.estado = this.filtroEstado as EstadoCita;
    if (this.filtroFecha) filtros.fecha = this.filtroFecha;

    this.citasService.listarCitas(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.citas = res.data;
          this.totalRegistros = res.pagination.total;
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: err => {
          this.errorApi = err.message;
          this.cargando = false;
        }
      });
  }

  cargarConsultorios(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.perfilService.listarConsultorios().subscribe({
        next: (res) => {
          this.consultorios = res.data || [];
        },
        error: (err) => console.error('Error cargando consultorios:', err)
      });
    }
  }

  // ── Búsqueda de pacientes ──────────────────────────────
  buscarPacientes(): void {
    if (this.busquedaPaciente.length < 2) {
      this.resultadosPacientes = [];
      return;
    }

    this.pacientesService.listarPacientes().subscribe({
      next: (res) => {
        this.resultadosPacientes = (res.data || []).filter(p =>
          p.nombre_completo.toLowerCase().includes(this.busquedaPaciente.toLowerCase())
        );
      },
      error: (err) => console.error('Error buscando pacientes:', err)
    });
  }

  seleccionarPaciente(paciente: Paciente): void {
    this.pacienteSeleccionado = paciente;
    this.form.paciente_id = paciente.id;
    this.busquedaPaciente = paciente.nombre_completo;
    this.resultadosPacientes = [];
  }

  // ── Validación de horarios ─────────────────────────────
  generarHorasDisponibles(): string[] {
    const horas = [];
    for (let i = 8; i <= 18; i++) {
      horas.push(`${i.toString().padStart(2, '0')}:00`);
      if (i < 18) {
        horas.push(`${i.toString().padStart(2, '0')}:30`);
      }
    }
    return horas;
  }

  cargarHorariosOcupados(): void {
    if (!this.formFecha) return;

    this.citasService.listarCitas({ fecha: this.formFecha }).subscribe({
      next: (res) => {
        this.horariosOcupados = res.data.map(c => c.hora);
      },
      error: (err) => console.error('Error cargando horarios:', err)
    });
  }

  horaOcupada(hora: string): boolean {
    return this.horariosOcupados.includes(hora);
  }

  onFechaChange(): void {
    this.formHora = '';
    this.cargarHorariosOcupados();
  }

  // ── Filtro por texto ───────────────────────────────────
  onFiltroTexto(): void { this.filtroSubject.next(this.filtroTexto); }

  aplicarFiltros(): void {
    const txt = this.filtroTexto.toLowerCase().trim();
    if (!txt) {
      this.citasFiltradas = [...this.citas];
      return;
    }
    this.citasFiltradas = this.citas.filter(c =>
      c.paciente_nombre.toLowerCase().includes(txt) ||
      c.tipo.toLowerCase().includes(txt) ||
      c.estado.toLowerCase().includes(txt) ||
      c.fecha.includes(txt)
    );
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.paginaActual = 0;
    this.cargarCitas();
  }

  onFiltroEstado(): void { this.paginaActual = 0; this.cargarCitas(); }
  onFiltroFecha(): void { this.paginaActual = 0; this.cargarCitas(); }

  // ── Paginación ─────────────────────────────────────────
  get totalPaginas(): number { return Math.ceil(this.totalRegistros / this.limitePorPagina); }
  get hayPaginaAnterior(): boolean { return this.paginaActual > 0; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas - 1; }

  paginaAnterior(): void { if (this.hayPaginaAnterior) { this.paginaActual--; this.cargarCitas(); } }
  paginaSiguiente(): void { if (this.hayPaginaSiguiente) { this.paginaActual++; this.cargarCitas(); } }

  // ── Detalle ────────────────────────────────────────────
  verDetalle(cita: Cita): void {
    this.modalMode = 'detalle';
    this.cargandoDetalle = true;
    this.errorDetalle = '';
    this.citaSeleccionada = null;

    this.citasService.obtenerCita(cita.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.citaSeleccionada = res.data as CitaDetalle;
          this.cargandoDetalle = false;
        },
        error: err => {
          this.errorDetalle = err.message;
          this.cargandoDetalle = false;
        }
      });
  }

  // ── Crear cita ─────────────────────────────────────────
  abrirModalCrear(): void {
    this.form = {
      paciente_id: 0,
      fecha_hora: '',
      duracion_minutos: 30,
      tipo: 'CONSULTA',
      notas: ''
    };
    this.pacienteSeleccionado = null;
    this.busquedaPaciente = '';
    this.formFecha = '';
    this.formHora = '';
    this.errorForm = '';
    this.horariosOcupados = [];
    this.modalMode = 'crear';
  }

  guardarCita(): void {
    this.errorForm = '';

    if (!this.pacienteSeleccionado) {
      this.errorForm = 'Debe seleccionar un paciente';
      return;
    }
    if (!this.formFecha) {
      this.errorForm = 'La fecha es requerida';
      return;
    }
    if (!this.formHora) {
      this.errorForm = 'La hora es requerida';
      return;
    }
    if (this.horaOcupada(this.formHora)) {
      this.errorForm = 'Este horario ya está ocupado. Por favor selecciona otra hora.';
      return;
    }

    this.form.fecha_hora = `${this.formFecha}T${this.formHora}:00`;
    this.guardando = true;

    this.citasService.crearCita(this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarCitas();
        },
        error: err => {
          this.errorForm = err.message;
          this.guardando = false;
        }
      });
  }

  // ── Confirmar ──────────────────────────────────────────
  confirmarCita(cita: Cita, event: Event): void {
    event.stopPropagation();
    if (!confirm(`¿Confirmar la cita de ${cita.paciente_nombre}?`)) return;

    this.citasService.confirmarCita(cita.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.cargarCitas(),
        error: err => alert(err.message)
      });
  }

  // ── Reprogramar ────────────────────────────────────────
  abrirReprogramar(cita: Cita, event?: Event): void {
    event?.stopPropagation();
    this.citaSeleccionada = cita as CitaDetalle;
    this.repFecha = '';
    this.repHora = '';
    this.repMotivo = '';
    this.repError = '';
    this.modalMode = 'reprogramar';
  }

  guardarReprogramacion(): void {
    this.repError = '';
    if (!this.repFecha || !this.repHora) {
      this.repError = 'La nueva fecha y hora son requeridas';
      return;
    }

    const nueva_fecha_hora = `${this.repFecha}T${this.repHora}:00`;
    this.guardando = true;

    this.citasService.reprogramarCita(this.citaSeleccionada!.id, {
      nueva_fecha_hora,
      motivo: this.repMotivo || undefined
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarCitas();
        },
        error: err => {
          this.repError = err.message;
          this.guardando = false;
        }
      });
  }

  // ── Cancelar ───────────────────────────────────────────
  abrirCancelar(cita: Cita, event?: Event): void {
    event?.stopPropagation();
    this.citaSeleccionada = cita as CitaDetalle;
    this.cancelMotivo = '';
    this.cancelError = '';
    this.modalMode = 'cancelar';
  }

  guardarCancelacion(): void {
    this.cancelError = '';
    this.guardando = true;

    this.citasService.cancelarCita(
      this.citaSeleccionada!.id,
      this.cancelMotivo || undefined
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarCitas();
        },
        error: err => {
          this.cancelError = err.message;
          this.guardando = false;
        }
      });
  }

  // ── Modal helpers ──────────────────────────────────────
  cerrarModal(): void {
    this.modalMode = null;
    this.citaSeleccionada = null;
    this.guardando = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.cerrarModal(); }

  // ── Helpers de UI ──────────────────────────────────────
  estadoClass(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      PROGRAMADA: 'estado-programada',
      CONFIRMADA: 'estado-confirmada',
      COMPLETADA: 'estado-completada',
      CANCELADA: 'estado-cancelada',
      REPROGRAMADA: 'estado-reprogramada'
    };
    return map[estado] ?? '';
  }

  estadoLabel(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      PROGRAMADA: 'Programada',
      CONFIRMADA: 'Confirmada',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      REPROGRAMADA: 'Reprogramada'
    };
    return map[estado] ?? estado;
  }

  tipoLabel(tipo: TipoCita): string {
    const map: Record<TipoCita, string> = {
      CONSULTA: 'Consulta',
      SEGUIMIENTO: 'Seguimiento',
      URGENCIA: 'Urgencia',
      ESTUDIO: 'Estudio'
    };
    return map[tipo] ?? tipo;
  }

  esPasada(fecha_hora: string): boolean {
    return new Date(fecha_hora) < new Date();
  }

  puedeConfirmar(c: Cita): boolean { return c.estado === 'PROGRAMADA'; }
  puedeReprogramar(c: Cita): boolean { return ['PROGRAMADA', 'CONFIRMADA'].includes(c.estado); }
  puedeCancelar(c: Cita): boolean { return ['PROGRAMADA', 'CONFIRMADA'].includes(c.estado); }

  get minFecha(): string {
    return new Date().toISOString().split('T')[0];
  }

  get horasDelDia(): string[] {
    return this.generarHorasDisponibles();
  }
}