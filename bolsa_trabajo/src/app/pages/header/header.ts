import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { Login } from '../../cositas/login/login'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Login],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  currentUser: any = null;
  isModalVisible = false;

  // Variable para controlar el menú desplegable
  isMenuOpen = false;

  ngOnInit() {
    this.authService.usuario$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openLogin() {
    this.isModalVisible = true;
  }
  closeLogin() {
    this.isModalVisible = false;
  }

  logout() {
    this.isMenuOpen = false; // Cerrar menú
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
