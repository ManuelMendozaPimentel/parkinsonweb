import { Component, OnInit, NgZone, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacientesService, Paciente } from '../../services/pacientes';
import { PerfilService, PerfilCompleto } from '../../services/perfil';
import { ConsultasService } from '../../services/consultas';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

interface Medicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

@Component({
  selector: 'app-consulta-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultapage.html',
  styleUrl: './consultapage.css'
})
export class ConsultaPage implements OnInit {

  @Output() consultaGuardada = new EventEmitter<void>();
  @Output() cerrar           = new EventEmitter<void>();

  today = new Date().toISOString().split('T')[0];

  // ── Doctor ───────────────────────────────
  doctorPerfil: PerfilCompleto | null = null;
  isLoadingPerfil = false;

  // ── Pacientes ────────────────────────────
  busqueda = '';
  pacientesFiltrados: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  mostrarDropdown = false;
  todosPacientes: Paciente[] = [];
  isLoadingPacientes = false;

  // ── Signos vitales ───────────────────────
  signosVitales = {
    peso: '', talla: '', imc: '',
    presion_arterial: '', frecuencia_cardiaca: '',
    temperatura: '', glucosa: ''
  };

  // ── Clínico ──────────────────────────────
  motivoConsulta  = '';
  diagnostico     = '';
  planTratamiento = '';
  indicaciones    = '';
  proximaCita     = '';

  // ── Medicamentos ─────────────────────────
  medicamentos: Medicamento[] = [
    { nombre: '', dosis: '', frecuencia: '', duracion: '' }
  ];

  // ── Estado ───────────────────────────────
  isGuardando     = false;
  isGeneratingPDF = false;
  errorGuardar: string | null = null;

  constructor(
    private pacientesService: PacientesService,
    private perfilService: PerfilService,
    private consultasService: ConsultasService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarPacientes();
  }

  // ── Perfil ───────────────────────────────
  cargarPerfil(): void {
    this.isLoadingPerfil = true;
    this.perfilService.obtenerPerfil().subscribe({
      next: (res) => this.ngZone.run(() => {
        if (res.success && res.data) this.doctorPerfil = res.data;
        this.isLoadingPerfil = false;
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => {
        this.isLoadingPerfil = false;
        this.cdr.markForCheck();
      })
    });
  }

  // ── Pacientes ────────────────────────────
  cargarPacientes(): void {
    this.isLoadingPacientes = true;
    this.pacientesService.listarPacientes().subscribe({
      next: (res) => this.ngZone.run(() => {
        if (res.success && res.data) this.todosPacientes = res.data;
        this.isLoadingPacientes = false;
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => {
        this.isLoadingPacientes = false;
        this.cdr.markForCheck();
      })
    });
  }

  get inicialesPaciente(): string {
    if (!this.pacienteSeleccionado) return '';
    return this.pacienteSeleccionado.nombre_completo
      .split(' ').filter((n: string) => n.length > 0)
      .slice(0, 2).map((n: string) => n[0].toUpperCase()).join('');
  }

  onBusqueda(): void {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) { this.pacientesFiltrados = []; this.mostrarDropdown = false; return; }
    this.pacientesFiltrados = this.todosPacientes.filter(p =>
      p.nombre_completo.toLowerCase().includes(q));
    this.mostrarDropdown = true;
  }

  seleccionarPaciente(p: Paciente): void {
    this.pacienteSeleccionado = p;
    this.busqueda = p.nombre_completo;
    this.mostrarDropdown = false;
    if (p.diagnostico && !this.diagnostico) this.diagnostico = p.diagnostico;
  }

  limpiarPaciente(): void {
    this.pacienteSeleccionado = null;
    this.busqueda = '';
    this.pacientesFiltrados = [];
    this.mostrarDropdown = false;
  }

  // ── IMC ──────────────────────────────────
  calcularIMC(): void {
    const peso  = parseFloat(this.signosVitales.peso);
    const talla = parseFloat(this.signosVitales.talla) / 100;
    this.signosVitales.imc = (peso > 0 && talla > 0)
      ? (peso / (talla * talla)).toFixed(1) : '';
  }

  // ── Medicamentos ─────────────────────────
  agregarMedicamento(): void {
    this.medicamentos.push({ nombre: '', dosis: '', frecuencia: '', duracion: '' });
  }

  quitarMedicamento(i: number): void {
    if (this.medicamentos.length > 1) this.medicamentos.splice(i, 1);
  }

  // ── Validación ───────────────────────────
  formularioValido(): boolean {
    return !!this.pacienteSeleccionado &&
           !!this.motivoConsulta.trim() &&
           !!this.diagnostico.trim() &&
           this.medicamentos.some(m => m.nombre.trim() !== '');
  }

  // ── Guardar + PDF ────────────────────────
  generarReceta(): void {
    if (!this.formularioValido() || this.isGuardando) return;
    this.isGuardando = true;
    this.errorGuardar = null;

    const sv = this.signosVitales;
    const payload = {
      paciente_id:         this.pacienteSeleccionado!.id,
      motivo_consulta:     this.motivoConsulta.trim(),
      diagnostico:         this.diagnostico.trim(),
      plan_tratamiento:    this.planTratamiento.trim()   || undefined,
      indicaciones:        this.indicaciones.trim()      || undefined,
      proxima_cita:        this.proximaCita              || undefined,
      peso:                sv.peso               ? parseFloat(sv.peso)                : null,
      talla:               sv.talla              ? parseFloat(sv.talla)               : null,
      imc:                 sv.imc                ? parseFloat(sv.imc)                 : null,
      presion_arterial:    sv.presion_arterial   || undefined,
      frecuencia_cardiaca: sv.frecuencia_cardiaca? parseInt(sv.frecuencia_cardiaca)   : null,
      temperatura:         sv.temperatura        ? parseFloat(sv.temperatura)         : null,
      glucosa:             sv.glucosa            ? parseInt(sv.glucosa)               : null,
      medicamentos: this.medicamentos
        .filter(m => m.nombre.trim())
        .map(m => ({
          nombre:     m.nombre.trim(),
          dosis:      m.dosis      || null,
          frecuencia: m.frecuencia || null,
          duracion:   m.duracion   || null
        }))
    };

    this.consultasService.crearConsulta(payload).subscribe({
      next: (res) => this.ngZone.run(() => {
        if (res.success) {
          this.abrirPDF();
          this.consultaGuardada.emit();
        } else {
          this.errorGuardar = res.message || 'Error al guardar';
        }
        this.isGuardando = false;
        this.cdr.markForCheck();
      }),
      error: (err) => this.ngZone.run(() => {
        this.errorGuardar = err.error?.message || err.message || 'Error al guardar la consulta';
        this.isGuardando = false;
        this.cdr.markForCheck();
      })
    });
  }

  private abrirPDF(): void {
    this.isGeneratingPDF = true;
    const ventana = window.open('', '_blank', 'width=794,height=1123');
    if (!ventana) {
      alert('Permite las ventanas emergentes para generar la receta.');
      this.isGeneratingPDF = false;
      return;
    }
    ventana.document.write(this.construirHTMLReceta());
    ventana.document.close();
    ventana.onload = () => {
      ventana.focus();
      ventana.print();
      this.ngZone.run(() => { this.isGeneratingPDF = false; this.cdr.markForCheck(); });
    };
  }

  private construirHTMLReceta(): string {
    const fecha    = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    const paciente = this.pacienteSeleccionado!;
    const d        = this.doctorPerfil;

    const nombre       = d?.nombre_completo       || 'Dr. Sin nombre';
    const cedula       = d?.cedula_profesional     || '—';
    const especialidad = d?.especialidad           || '—';
    const institucion  = d?.institucion_procedencia|| '';
    const telefono     = d?.telefono               || '';

    const medsHTML = this.medicamentos.filter(m => m.nombre.trim()).map((m, i) => `
      <div class="med-item">
        <div class="med-numero">${i + 1}</div>
        <div class="med-nombre">
          ${m.nombre}${m.dosis ? ` — ${m.dosis} tableta${Number(m.dosis) !== 1 ? 's' : ''}` : ''}
          ${m.frecuencia ? ` cada ${m.frecuencia} horas` : ''}
          ${m.duracion   ? ` por ${m.duracion} días`     : ''}
        </div>
      </div>`).join('');

    const sv = this.signosVitales;
    const signosFilas = [
      sv.peso               ? `<tr><td>Peso</td><td>${sv.peso} kg</td></tr>`                           : '',
      sv.talla              ? `<tr><td>Talla</td><td>${sv.talla} cm</td></tr>`                         : '',
      sv.imc                ? `<tr><td>IMC</td><td>${sv.imc} kg/m²</td></tr>`                          : '',
      sv.presion_arterial   ? `<tr><td>Presión arterial</td><td>${sv.presion_arterial} mmHg</td></tr>` : '',
      sv.frecuencia_cardiaca? `<tr><td>Frec. cardíaca</td><td>${sv.frecuencia_cardiaca} lpm</td></tr>` : '',
      sv.temperatura        ? `<tr><td>Temperatura</td><td>${sv.temperatura} °C</td></tr>`             : '',
      sv.glucosa            ? `<tr><td>Glucosa</td><td>${sv.glucosa} mg/dL</td></tr>`                  : '',
    ].filter(Boolean).join('');

    const proximaFmt = this.proximaCita
      ? new Date(this.proximaCita + 'T12:00:00').toLocaleDateString('es-MX',
          { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      : '';

    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Receta — ${paciente.nombre_completo}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Times New Roman',serif;font-size:12pt;color:#1a1a1a;background:white}
  .receta{width:794px;min-height:1123px;padding:40px 50px;position:relative}
  .encabezado{display:flex;justify-content:space-between;border-bottom:3px solid #1a4a3a;padding-bottom:16px;margin-bottom:20px}
  .doctor-info h1{font-size:18pt;color:#1a4a3a;font-weight:bold;margin-bottom:4px}
  .doctor-info p{font-size:10pt;color:#444;line-height:1.5}
  .fecha-folio{text-align:right;font-size:10pt;color:#555}
  .fecha-folio .fecha{font-size:11pt;font-weight:bold;color:#1a4a3a}
  .stit{font-size:9pt;font-weight:bold;text-transform:uppercase;letter-spacing:.08em;color:#1a4a3a;margin:16px 0 6px}
  .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;background:#f4f8f6;padding:10px 14px;border-radius:4px;border-left:3px solid #1a4a3a}
  .pgrid .c{font-size:10pt;color:#333}
  .pgrid .c strong{color:#1a1a1a}
  .st{width:100%;border-collapse:collapse;font-size:10pt}
  .st td{padding:4px 10px;border:1px solid #ddd}
  .st td:first-child{font-weight:bold;background:#f4f8f6;width:40%}
  .cbox{background:#f9f9f9;border:1px solid #ddd;border-radius:4px;padding:10px 14px;font-size:10.5pt;line-height:1.6;white-space:pre-wrap}
  .rx{font-size:28pt;color:#1a4a3a;font-style:italic;font-weight:bold;margin:16px 0 8px}
  .med-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px dashed #ccc}
  .med-item:last-child{border-bottom:none}
  .med-numero{width:22px;height:22px;background:#1a4a3a;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9pt;font-weight:bold;flex-shrink:0;margin-top:2px}
  .med-nombre{font-size:11pt;font-weight:bold}
  .ibox{background:#fffdf0;border:1px solid #e8d87a;border-radius:4px;padding:10px 14px;font-size:10.5pt;line-height:1.6;white-space:pre-wrap}
  .cita{display:flex;align-items:center;gap:10px;background:#eef6f2;border:1px solid #a8d5be;border-radius:4px;padding:10px 14px;font-size:11pt}
  .firma{position:absolute;bottom:50px;right:50px;text-align:center}
  .firma-linea{width:200px;border-top:1.5px solid #1a1a1a;margin-bottom:6px}
  .firma-txt{font-size:9.5pt;color:#333;line-height:1.4}
  .pie{position:absolute;bottom:20px;left:50px;right:50px;display:flex;justify-content:space-between;font-size:8pt;color:#888;border-top:1px solid #ddd;padding-top:6px}
  @media print{body{padding:0}.receta{padding:30px 40px}}
</style></head><body>
<div class="receta">
  <div class="encabezado">
    <div class="doctor-info">
      <h1>${nombre}</h1>
      <p>${especialidad}</p>
      <p>Cédula Profesional: ${cedula}</p>
      ${institucion ? `<p>${institucion}</p>` : ''}
      ${telefono    ? `<p>Tel: ${telefono}</p>` : ''}
    </div>
    <div class="fecha-folio">
      <div class="fecha">${fecha}</div>
      <div style="margin-top:4px">Receta médica</div>
    </div>
  </div>

  <div class="stit">Paciente</div>
  <div class="pgrid">
    <div class="c"><strong>Nombre:</strong> ${paciente.nombre_completo}</div>
    <div class="c"><strong>Edad:</strong> ${paciente.edad ?? '—'} años</div>
    <div class="c"><strong>Correo:</strong> ${paciente.correo || '—'}</div>
    ${paciente.diagnostico        ? `<div class="c"><strong>Diagnóstico base:</strong> ${paciente.diagnostico}</div>` : ''}
    ${paciente.estadio_hoehn_yahr ? `<div class="c"><strong>Estadio H&amp;Y:</strong> ${paciente.estadio_hoehn_yahr}</div>` : ''}
  </div>

  ${signosFilas ? `<div class="stit">Signos vitales</div><table class="st">${signosFilas}</table>` : ''}

  <div class="stit">Diagnóstico de la consulta</div>
  <div class="cbox">${this.diagnostico}</div>

  ${this.planTratamiento ? `<div class="stit">Plan de tratamiento</div><div class="cbox">${this.planTratamiento}</div>` : ''}

  <div class="rx">&#8478;</div>
  ${medsHTML}

  ${this.indicaciones ? `<div class="stit">Indicaciones generales</div><div class="ibox">${this.indicaciones}</div>` : ''}

  ${proximaFmt ? `
  <div class="stit">Próxima cita</div>
  <div class="cita"><span>&#128197;</span><span>${proximaFmt}</span></div>` : ''}

  <div class="firma">
    <div class="firma-linea"></div>
    <div class="firma-txt"><strong>${nombre}</strong><br>Cédula: ${cedula}<br>${especialidad}</div>
  </div>
  <div class="pie">
    <span>NeuroTrack — Sistema de monitoreo neurológico</span>
    <span>Documento generado el ${fecha}</span>
  </div>
</div></body></html>`;
  }
}