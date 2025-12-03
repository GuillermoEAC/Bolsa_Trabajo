import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { NotificacionesService } from '../../services/notificaciones.service';
import { Login } from '../../cositas/login/login';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Login],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  notificacionesService = inject(NotificacionesService);
  router = inject(Router);

  currentUser: any = null;
  isModalVisible = false;
  isMenuOpen = false;

  // Notificaciones
  notificaciones: any[] = [];
  noLeidasCount = 0;
  showNotifications = false;

  ngOnInit() {
    this.authService.usuario$.subscribe((user) => {
      this.currentUser = user;

      if (user) {
        this.cargarNotificaciones();
        // Actualizar notificaciones cada 30 segundos
        setInterval(() => this.cargarNotificaciones(), 30000);
      }
    });
  }

  cargarNotificaciones() {
    if (!this.currentUser) return;

    this.notificacionesService.obtenerNotificaciones(this.currentUser.id_usuario).subscribe({
      next: (data) => {
        this.notificaciones = data.notificaciones || [];
        this.noLeidasCount = data.totalNoLeidas || 0;
      },
      error: (err) => console.error('Error al cargar notificaciones:', err),
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Cerrar notificaciones si están abiertas
    if (this.isMenuOpen) {
      this.showNotifications = false;
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;

    // Cerrar menú de perfil si está abierto
    if (this.showNotifications) {
      this.isMenuOpen = false;
    }

    // Marcar todas como leídas al abrir
    if (this.showNotifications && this.noLeidasCount > 0) {
      this.notificacionesService.marcarTodasLeidas(this.currentUser.id_usuario).subscribe({
        next: () => {
          this.noLeidasCount = 0;
          // Actualizar estado local
          this.notificaciones.forEach((n) => (n.leida = true));
        },
      });
    }
  }

  // 🔥 TUS FUNCIONES ORIGINALES DE ROLES
  esEstudiante(): boolean {
    return this.currentUser?.id_rol === 2;
  }

  esEmpresa(): boolean {
    return this.currentUser?.id_rol === 3;
  }

  esAdmin(): boolean {
    return this.currentUser?.id_rol === 1;
  }

  getTipoUsuario(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.id_rol) {
      case 1:
        return 'ADMINISTRADOR';
      case 2:
        return 'ESTUDIANTE';
      case 3:
        return 'EMPRESA';
      default:
        return '';
    }
  }

  openLogin() {
    this.isModalVisible = true;
  }

  closeLogin() {
    this.isModalVisible = false;
  }

  logout() {
    this.isMenuOpen = false;
    this.showNotifications = false;
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
