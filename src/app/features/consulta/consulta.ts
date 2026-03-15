import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfilService, Consultorio } from '../../services/perfil';
import { ModalOverlay } from '../../shared/components/modal-overlay/modal-overlay';

type ModalTipo = 'crear' | 'editar' | 'eliminar' | null;

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalOverlay],
  templateUrl: './consulta.html',
  styleUrl: './consulta.css'
})
export class Consulta implements OnInit {

  consultorios: Consultorio[] = [];
  isLoading = false;
  apiError: string | null = null;

  // Modal
  modalActivo: ModalTipo = null;
  isSubmitting = false;
  modalError: string | null = null;
  consultorioSeleccionado: Consultorio | null = null;

  // Formulario compartido para crear y editar
  form: Partial<Consultorio> = {};

  constructor(
    private perfilService: PerfilService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConsultorios();
  }

  cargarConsultorios(): void {
    this.isLoading = true;
    this.apiError = null;

    this.perfilService.listarConsultorios().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            this.consultorios = response.data;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.apiError = error.message || 'Error al cargar consultorios';
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────

  abrirCrear(): void {
    this.form = {
      nombre_institucion: '',
      es_consultorio_particular: false,
      calle: '', numero_exterior: '', numero_interior: '',
      colonia: '', codigo_postal: '', ciudad: '', estado: '',
      pais: 'México', telefono_cita: '',
      email_consultorio: '', horario_atencion: '',
      es_principal: false,
      visible_para_pacientes: true,
      mostrar_telefono_cita: true,
      mostrar_horario: true,
      mostrar_direccion_completa: false
    };
    this.consultorioSeleccionado = null;
    this.modalError = null;
    this.modalActivo = 'crear';
  }

  abrirEditar(c: Consultorio): void {
    // Copia todos los campos para no mutar el original
    this.form = { ...c };
    this.consultorioSeleccionado = c;
    this.modalError = null;
    this.modalActivo = 'editar';
  }

  abrirEliminar(c: Consultorio): void {
    this.consultorioSeleccionado = c;
    this.modalError = null;
    this.modalActivo = 'eliminar';
  }

  cerrarModal(): void {
    this.modalActivo = null;
    this.modalError = null;
    this.isSubmitting = false;
    this.consultorioSeleccionado = null;
  }

  // ── CRUD ─────────────────────────────────────────────────────

  submitCrear(): void {
    if (this.isSubmitting) return;

    if (!this.form.nombre_institucion && !this.form.es_consultorio_particular) {
      this.modalError = 'Ingresa el nombre de la institución';
      return;
    }
    if (!this.form.ciudad || !this.form.estado) {
      this.modalError = 'Ciudad y estado son obligatorios';
      return;
    }

    this.isSubmitting = true;
    this.modalError = null;

    this.perfilService.crearConsultorio(this.form).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            // Si es principal, quitar el badge a los demás
            if (response.data.es_principal) {
              this.consultorios = this.consultorios.map(c => ({ ...c, es_principal: false }));
            }
            this.consultorios = [response.data, ...this.consultorios];
            this.cerrarModal();
          }
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.modalError = error.error?.message || error.message || 'Error al crear consultorio';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  submitEditar(): void {
    if (this.isSubmitting || !this.consultorioSeleccionado) return;

    this.isSubmitting = true;
    this.modalError = null;

    this.perfilService.editarConsultorio(this.consultorioSeleccionado.id, this.form).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success && response.data) {
            // Si se marcó como principal, quitar el badge a los demás
            if (response.data.es_principal) {
              this.consultorios = this.consultorios.map(c => ({ ...c, es_principal: false }));
            }
            // Reemplaza el consultorio en la lista
            this.consultorios = this.consultorios.map(c =>
              c.id === response.data!.id ? response.data! : c
            );
            this.cerrarModal();
          }
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.modalError = error.error?.message || error.message || 'Error al editar consultorio';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  submitEliminar(): void {
    if (this.isSubmitting || !this.consultorioSeleccionado) return;

    this.isSubmitting = true;

    this.perfilService.eliminarConsultorio(this.consultorioSeleccionado.id).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.consultorios = this.consultorios.filter(
              c => c.id !== this.consultorioSeleccionado!.id
            );
            this.cerrarModal();
          }
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.modalError = error.error?.message || error.message || 'Error al eliminar';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  toggleVisibilidad(c: Consultorio): void {
    const nuevoValor = !c.visible_para_pacientes;

    this.perfilService.actualizarVisibilidadConsultorio(c.id, {
      visible_para_pacientes: nuevoValor
    }).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.consultorios = this.consultorios.map(item =>
              item.id === c.id ? { ...item, visible_para_pacientes: nuevoValor } : item
            );
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {} // silencioso — el toggle vuelve a su estado si falla
    });
  }
}