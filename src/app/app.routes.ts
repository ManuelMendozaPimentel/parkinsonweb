import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Register } from './features/register/register';
import { Patients } from './features/patients/patients';
import { Configuration } from './features/configuration/configuration';
import { Perfil } from './features/perfil/perfil';
import { Seguridad } from './features/seguridad/seguridad';
import { Consulta } from './features/consulta/consulta';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register},
  { path: 'dashboard', component: Dashboard},
  { path: 'patients', component: Patients},
  { path: 'configuration', component: Configuration},
  { path: 'perfil', component: Perfil},
  { path: 'seguridad', component: Seguridad},
  { path: 'consulta', component: Consulta}
];
