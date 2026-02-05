import { Component } from '@angular/core';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarMenu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
    isMenuOpen = false;

  onMenuToggle(open: boolean) {
    this.isMenuOpen = open;
  }
}
