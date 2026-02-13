import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.css'],
  standalone: true,
})
export class PatientForm {
  @Input() patient: any = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formData = {
    nombre: '',
    diagnostico: '',
    correo: '',
  };

  ngOnInit() {
    if (this.patient) {
      this.formData = { ...this.patient };
    }
  }

  onInputChange(field: string, value: string) {
    this.formData = { ...this.formData, [field]: value };
  }

  onSave() {
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
