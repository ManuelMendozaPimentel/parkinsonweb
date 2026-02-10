import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { Logo } from '../logo/logo';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  imports: [Logo, RouterLink],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css',
})
export class SidebarMenu {
    isOpen = false;

  @Output() menuToggle = new EventEmitter<boolean>();

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.menuToggle.emit(this.isOpen);
  }

  // Cerrar menú al hacer clic fuera (en el overlay o área principal)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isMenuButton = target.closest('.menu-button') || target.classList.contains('menu-button');
    const isSidebar = target.closest('.sidebar');

    if (!isMenuButton && !isSidebar && this.isOpen) {
      this.closeMenu();
    }
  }

  closeMenu() {
    if (this.isOpen) {
      this.isOpen = false;
      this.menuToggle.emit(false);
    }
  }
}
