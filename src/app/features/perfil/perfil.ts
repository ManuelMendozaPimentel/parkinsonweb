import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfilService, PerfilCompleto } from '../../services/perfil';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalOverlay],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  // Datos cargados desde la API
  perfil: PerfilCompleto | null = null;

  // Estado general
  isLoading = false;
  apiError: string | null = null;

  // Modal de edición
  showModal = false;

  // Campos editables en el modal (copia para no mutar el original)
  form = {
    nombre_completo: '',
    telefono: '',
    especialidad: '',
    institucion_procedencia: '',
    biografia_breve: ''
  };

  // Estado del modal
  isSaving = false;
  saveError: string | null = null;
  saveSuccess = false;

  constructor(
    private perfilService: PerfilService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // Genera las iniciales para el avatar (ej: "Manuel Mendoza" → "MM")
  get iniciales(): string {
    if (!this.perfil?.nombre_completo) return '??';
    return this.perfil.nombre_completo
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  cargarPerfil(): void {
    this.isLoading = true;
    this.apiError = null;

    this.perfilService.obtenerPerfil().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            this.perfil = response.data;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.apiError = error.message || 'Error al cargar el perfil';
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  abrirModal(): void {
    if (!this.perfil) return;
    // Copia los valores actuales al formulario
    this.form = {
      nombre_completo:      this.perfil.nombre_completo      || '',
      telefono:             this.perfil.telefono             || '',
      especialidad:         this.perfil.especialidad         || '',
      institucion_procedencia: this.perfil.institucion_procedencia || '',
      biografia_breve:      this.perfil.biografia_breve      || ''
    };
    this.saveError = null;
    this.saveSuccess = false;
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.saveError = null;
  }

  guardarPerfil(): void {
    if (this.isSaving) return;

    // Validación mínima
    if (!this.form.nombre_completo.trim() || this.form.nombre_completo.trim().length < 5) {
      this.saveError = 'El nombre debe tener al menos 5 caracteres';
      return;
    }

    this.isSaving = true;
    this.saveError = null;

    this.perfilService.editarPerfil(this.form).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.saveSuccess = true;
            // Actualiza los datos en pantalla con lo que devuelve la API
            if (this.perfil) {
              this.perfil = { ...this.perfil, ...this.form };
            }
            setTimeout(() => {
              this.showModal = false;
              this.saveSuccess = false;
            }, 1200);
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.saveError = error.message || 'Error al guardar los cambios';
          this.isSaving = false;
          this.cdr.markForCheck();
        });
      }
    });
  }
}