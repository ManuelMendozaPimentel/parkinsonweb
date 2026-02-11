import { Component } from '@angular/core';

interface Tab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-configuration',
  imports: [],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css',
})
export class Configuration {

  activeTab: string = 'perfil'; // Perfil por defecto

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

}
