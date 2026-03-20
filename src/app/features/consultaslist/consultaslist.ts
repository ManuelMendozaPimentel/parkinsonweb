import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';
import { ConsultaPage } from '../consultapage/consultapage';
import {
  ConsultasService,
  ConsultaItem,
  ConsultaDetalle
} from '../../services/consultas';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarMenu, ModalOverlay, ConsultaPage],
  templateUrl: './consultaslist.html',
  styleUrl: './consultaslist.css'
})
export class ConsultasList implements OnInit {

  isMenuOpen = false;

  // ── Datos ────────────────────────────────
  consultas: ConsultaItem[] = [];
  consultasFiltradas: ConsultaItem[] = [];
  isLoading = false;
  apiError: string | null = null;

  // ── Filtro ───────────────────────────────
  filtroPaciente = '';

  // ── Modal nueva consulta ─────────────────
  showFormulario = false;

  // ── Modal detalle ────────────────────────
  showDetalle = false;
  consultaDetalle: ConsultaDetalle | null = null;
  isLoadingDetalle = false;
  detalleError: string | null = null;

  constructor(
    private consultasService: ConsultasService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConsultas();
  }

  onMenuToggle(open: boolean): void {
    this.isMenuOpen = open;
  }

  // ── Carga ────────────────────────────────
  cargarConsultas(): void {
    this.isLoading = true;
    this.apiError = null;

    this.consultasService.listarConsultas().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            this.consultas = response.data;
            this.aplicarFiltro();
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.apiError = error.error?.message || error.message || 'Error al cargar las consultas';
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Filtro ───────────────────────────────
  aplicarFiltro(): void {
    const q = this.filtroPaciente.toLowerCase().trim();
    this.consultasFiltradas = q
      ? this.consultas.filter(c => c.paciente_nombre.toLowerCase().includes(q))
      : [...this.consultas];
  }

  limpiarFiltro(): void {
    this.filtroPaciente = '';
    this.aplicarFiltro();
  }

  // ── Modal nueva consulta ─────────────────
  abrirFormulario(): void {
    this.showFormulario = true;
  }

  cerrarFormulario(): void {
    this.showFormulario = false;
  }

  onConsultaGuardada(): void {
    this.showFormulario = false;
    this.cargarConsultas();
  }

  // ── Modal detalle ────────────────────────
  verDetalle(consulta: ConsultaItem): void {
    this.showDetalle = true;
    this.consultaDetalle = null;
    this.isLoadingDetalle = true;
    this.detalleError = null;

    this.consultasService.obtenerConsulta(consulta.id).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            this.consultaDetalle = response.data;
          } else {
            this.detalleError = 'No se pudo cargar el detalle';
          }
          this.isLoadingDetalle = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.detalleError = error.error?.message || 'Error al cargar el detalle';
          this.isLoadingDetalle = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  cerrarDetalle(): void {
    this.showDetalle = false;
    this.consultaDetalle = null;
    this.detalleError = null;
  }

  // ── Helpers ──────────────────────────────
  formatFecha(fechaISO: string): string {
    if (!fechaISO) return '—';
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatProximaCita(fechaISO: string | null): string {
    if (!fechaISO) return '—';
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  proximaCitaPasada(fechaISO: string | null): boolean {
    if (!fechaISO) return false;
    return new Date(fechaISO) < new Date();
  }
}