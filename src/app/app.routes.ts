import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Register } from './features/register/register';
import { Patients } from './features/patients/patients';
import { Configuration } from './features/configuration/configuration';
import { Perfil } from './features/perfil/perfil';
import { Seguridad } from './features/seguridad/seguridad';
import { Consulta } from './features/consulta/consulta';
import { Grafica } from './features/grafica/grafica';
import { Alertas} from  './features/alertas/alertas';
import { Reportes } from './features/reportes/reportes';
import { ConsultaPage } from './features/consultapage/consultapage';
import { ConsultasList } from './features/consultaslist/consultaslist';
import { CitasComponent } from './features/citas/citas';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register},
  { path: 'dashboard', component: Dashboard},
  { path: 'patients', component: Patients},
  { path: 'configuration', component: Configuration},
  { path: 'perfil', component: Perfil},
  { path: 'seguridad', component: Seguridad},
  { path: 'consulta', component: Consulta}, //configuracion de perfil datos de consultorio
  { path: 'grafica', component: Grafica},
  { path: 'alertas', component: Alertas},
  { path: 'reportes', component: Reportes},
  { path: 'consultamedica', component: ConsultaPage },//llenado de receta
  { path: 'consultas', component: ConsultasList },//listado de consultas realizadas
  { path: 'citas', component: CitasComponent}
];
