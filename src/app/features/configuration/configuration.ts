import { Component } from '@angular/core';
import { Perfil } from '../perfil/perfil';
import { Seguridad } from '../seguridad/seguridad';
import { Consulta } from '../consulta/consulta';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

interface Tab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-configuration',
  standalone: true, 
  imports: [
    Perfil,      
    Seguridad,   
    Consulta,
    SidebarMenu // 👈 IMPORTAMOS EL SIDEBAR
  ],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class Configuration {
  activeTab: string = 'perfil';
  isMenuOpen: boolean = false; // 👈 ESTADO DEL MENÚ

  tabs: Tab[] = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'seguridad', label: 'Seguridad' },
    { id: 'consulta', label: 'Consulta' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  isActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  // 👈 MANEJADOR DEL TOGGLE DEL MENÚ
  onMenuToggle(isOpen: boolean): void {
    this.isMenuOpen = isOpen;
  }
}