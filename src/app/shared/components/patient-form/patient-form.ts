import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paciente, Medicamento } from '../../../services/pacientes';

interface FormDatosClinicos {
  diagnostico: string;
  estadio_hoehn_yahr: string;
  medicamentos: Medicamento[];
  notas_clinicas: string;
}

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PatientForm implements OnInit {

  @Input() patient: Paciente | null = null;
  @Output() save   = new EventEmitter<FormDatosClinicos>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormDatosClinicos = {
    diagnostico:        '',
    estadio_hoehn_yahr: '',
    medicamentos:       [],
    notas_clinicas:     ''
  };

  // Estadios con su descripción clínica
  estadios = [
    { valor: 'I',   descripcion: 'Síntomas unilaterales únicamente' },
    { valor: 'II',  descripcion: 'Síntomas bilaterales sin alteración del equilibrio' },
    { valor: 'III', descripcion: 'Síntomas bilaterales leves a moderados, algo inestable' },
    { valor: 'IV',  descripcion: 'Discapacidad grave, aún puede caminar sin ayuda' },
    { valor: 'V',   descripcion: 'En silla de ruedas o en cama sin ayuda' }
  ];

  ngOnInit(): void {
    if (this.patient) {
      this.formData = {
        diagnostico:        this.patient.diagnostico        || '',
        estadio_hoehn_yahr: this.patient.estadio_hoehn_yahr || '',
        medicamentos:       this.patient.medicamentos
                              ? [...this.patient.medicamentos]
                              : [],
        notas_clinicas:     this.patient.notas_clinicas     || ''
      };
    }
  }

  // ── Campos simples ────────────────────────

  onInputChange(field: keyof FormDatosClinicos, value: string): void {
    this.formData = { ...this.formData, [field]: value };
  }

  // ── Estadio ───────────────────────────────

  seleccionarEstadio(valor: string): void {
    // Si ya está seleccionado, deseleccionar
    this.formData = {
      ...this.formData,
      estadio_hoehn_yahr: this.formData.estadio_hoehn_yahr === valor ? '' : valor
    };
  }

  getDescripcionEstadio(valor: string): string {
    return this.estadios.find(e => e.valor === valor)?.descripcion || '';
  }

  // ── Medicamentos ──────────────────────────

  agregarMedicamento(): void {
    this.formData = {
      ...this.formData,
      medicamentos: [
        ...this.formData.medicamentos,
        { nombre: '', dosis: '', frecuencia: '' }
      ]
    };
  }

  onMedicamentoChange(index: number, campo: keyof Medicamento, valor: string): void {
    const meds = [...this.formData.medicamentos];
    meds[index] = { ...meds[index], [campo]: valor };
    this.formData = { ...this.formData, medicamentos: meds };
  }

  quitarMedicamento(index: number): void {
    this.formData = {
      ...this.formData,
      medicamentos: this.formData.medicamentos.filter((_, i) => i !== index)
    };
  }

  // ── Submit ────────────────────────────────

  onSave(): void {
    // Limpiar medicamentos vacíos antes de enviar
    const medicamentosLimpios = this.formData.medicamentos.filter(
      m => m.nombre.trim() !== ''
    );
    this.save.emit({
      ...this.formData,
      medicamentos: medicamentosLimpios
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}