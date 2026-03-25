import {
  Component, OnInit, OnDestroy, HostListener
} from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { Subject }             from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  CitasService, Cita, CitaDetalle, EstadoCita, TipoCita,
  CrearCitaRequest, FiltrosCitas
} from '../../services/citas';
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
  citas: Cita[]       = [];
  citasFiltradas: Cita[] = [];
  cargando            = false;
  errorApi            = '';

  // ── Paginación ─────────────────────────────────────────
  totalRegistros      = 0;
  paginaActual        = 0;
  limitePorPagina     = 20;

  // ── Filtros ────────────────────────────────────────────
  filtroTexto         = '';
  filtroEstado        = '';
  filtroFecha         = '';

  // ── Modal ──────────────────────────────────────────────
  modalMode: ModalMode = null;
  citaSeleccionada: CitaDetalle | null = null;
  cargandoDetalle     = false;
  errorDetalle        = '';

  // ── Formulario crear ───────────────────────────────────
  form: CrearCitaRequest = {
    paciente_id:      0,
    fecha_hora:       '',
    duracion_minutos: 30,
    tipo:             'CONSULTA',
    notas:            ''
  };
  formFecha  = '';
  formHora   = '';
  guardando  = false;
  errorForm  = '';

  // ── Reprogramar ────────────────────────────────────────
  repFecha   = '';
  repHora    = '';
  repMotivo  = '';
  repError   = '';

  // ── Cancelar ───────────────────────────────────────────
  cancelMotivo = '';
  cancelError  = '';

  // ── Enums para template ────────────────────────────────
  readonly tiposCita: TipoCita[]   = ['CONSULTA','SEGUIMIENTO','URGENCIA','ESTUDIO'];
  readonly estadosCita: EstadoCita[] = ['PROGRAMADA','CONFIRMADA','COMPLETADA','CANCELADA','REPROGRAMADA'];

  private destroy$ = new Subject<void>();
  private filtroSubject = new Subject<string>();

  constructor(private citasService: CitasService) {}

  ngOnInit(): void {
    this.cargarCitas();
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
      limit:  this.limitePorPagina,
      offset: this.paginaActual * this.limitePorPagina
    };
    if (this.filtroEstado) filtros.estado = this.filtroEstado as EstadoCita;
    if (this.filtroFecha)  filtros.fecha  = this.filtroFecha;

    this.citasService.listarCitas(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.citas          = res.data;
          this.totalRegistros = res.pagination.total;
          this.aplicarFiltros();
          this.cargando       = false;
        },
        error: err => {
          this.errorApi = err.message;
          this.cargando = false;
        }
      });
  }

  // ── Filtro por texto ───────────────────────────────────
  onFiltroTexto(): void { this.filtroSubject.next(this.filtroTexto); }

  aplicarFiltros(): void {
    const txt = this.filtroTexto.toLowerCase().trim();
    if (!txt) { this.citasFiltradas = [...this.citas]; return; }
    this.citasFiltradas = this.citas.filter(c =>
      c.paciente_nombre.toLowerCase().includes(txt) ||
      c.tipo.toLowerCase().includes(txt) ||
      c.estado.toLowerCase().includes(txt) ||
      c.fecha.includes(txt)
    );
  }

  limpiarFiltros(): void {
    this.filtroTexto  = '';
    this.filtroEstado = '';
    this.filtroFecha  = '';
    this.paginaActual = 0;
    this.cargarCitas();
  }

  onFiltroEstado(): void  { this.paginaActual = 0; this.cargarCitas(); }
  onFiltroFecha(): void   { this.paginaActual = 0; this.cargarCitas(); }

  // ── Paginación ─────────────────────────────────────────
  get totalPaginas(): number { return Math.ceil(this.totalRegistros / this.limitePorPagina); }
  get hayPaginaAnterior(): boolean { return this.paginaActual > 0; }
  get hayPaginaSiguiente(): boolean { return this.paginaActual < this.totalPaginas - 1; }

  paginaAnterior(): void { if (this.hayPaginaAnterior) { this.paginaActual--; this.cargarCitas(); } }
  paginaSiguiente(): void { if (this.hayPaginaSiguiente) { this.paginaActual++; this.cargarCitas(); } }

  // ── Detalle ────────────────────────────────────────────
  verDetalle(cita: Cita): void {
    this.modalMode      = 'detalle';
    this.cargandoDetalle = true;
    this.errorDetalle   = '';
    this.citaSeleccionada = null;

    this.citasService.obtenerCita(cita.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.citaSeleccionada = res.data as CitaDetalle;
          this.cargandoDetalle  = false;
        },
        error: err => {
          this.errorDetalle    = err.message;
          this.cargandoDetalle = false;
        }
      });
  }

  // ── Crear cita ─────────────────────────────────────────
  abrirModalCrear(): void {
    this.form = { paciente_id: 0, fecha_hora: '', duracion_minutos: 30, tipo: 'CONSULTA', notas: '' };
    this.formFecha = '';
    this.formHora  = '';
    this.errorForm = '';
    this.modalMode = 'crear';
  }

  guardarCita(): void {
    this.errorForm = '';
    if (!this.form.paciente_id || this.form.paciente_id <= 0) {
      this.errorForm = 'El ID del paciente es requerido'; return;
    }
    if (!this.formFecha || !this.formHora) {
      this.errorForm = 'La fecha y hora son requeridas'; return;
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
    this.repFecha  = '';
    this.repHora   = '';
    this.repMotivo = '';
    this.repError  = '';
    this.modalMode = 'reprogramar';
  }

  guardarReprogramacion(): void {
    this.repError = '';
    if (!this.repFecha || !this.repHora) {
      this.repError = 'La nueva fecha y hora son requeridas'; return;
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
    this.cancelError  = '';
    this.modalMode    = 'cancelar';
  }

  guardarCancelacion(): void {
    this.cancelError = '';
    this.guardando   = true;

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
          this.guardando   = false;
        }
      });
  }

  // ── Modal helpers ──────────────────────────────────────
  cerrarModal(): void {
    this.modalMode        = null;
    this.citaSeleccionada = null;
    this.guardando        = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.cerrarModal(); }

  // ── Helpers de UI ──────────────────────────────────────
  estadoClass(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      PROGRAMADA:   'estado-programada',
      CONFIRMADA:   'estado-confirmada',
      COMPLETADA:   'estado-completada',
      CANCELADA:    'estado-cancelada',
      REPROGRAMADA: 'estado-reprogramada'
    };
    return map[estado] ?? '';
  }

  estadoLabel(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      PROGRAMADA:   'Programada',
      CONFIRMADA:   'Confirmada',
      COMPLETADA:   'Completada',
      CANCELADA:    'Cancelada',
      REPROGRAMADA: 'Reprogramada'
    };
    return map[estado] ?? estado;
  }

  tipoLabel(tipo: TipoCita): string {
    const map: Record<TipoCita, string> = {
      CONSULTA:    'Consulta',
      SEGUIMIENTO: 'Seguimiento',
      URGENCIA:    'Urgencia',
      ESTUDIO:     'Estudio'
    };
    return map[tipo] ?? tipo;
  }

  esPasada(fecha_hora: string): boolean {
    return new Date(fecha_hora) < new Date();
  }

  puedeConfirmar(c: Cita): boolean  { return c.estado === 'PROGRAMADA'; }
  puedeReprogramar(c: Cita): boolean { return ['PROGRAMADA','CONFIRMADA'].includes(c.estado); }
  puedeCancelar(c: Cita): boolean   { return ['PROGRAMADA','CONFIRMADA'].includes(c.estado); }

  get minFecha(): string {
    return new Date().toISOString().split('T')[0];
  }
}