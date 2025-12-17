import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { NotificacionesService } from '../../services/notificaciones.service';
import { StudentService } from '../../services/student.service';
import { Login } from '../../cositas/login/login';
import { IconComponent } from '../../cositas/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Login, IconComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  notificacionesService = inject(NotificacionesService);
  studentService = inject(StudentService);
  router = inject(Router);

  currentUser: any = null;

  // Variables de estado
  isModalVisible = false;
  isMenuOpen = false;
  tienePerfilCompleto = false;

  // Variables de notificaciones
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

        // Si es estudiante (Rol 2), verificamos si ya creó su perfil
        if (user.id_rol === 2) {
          this.verificarPerfil(user.id_usuario);
        }
      }
    });
  }

  // --- LÓGICA DE NOTIFICACIONES ---

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
          this.notificaciones.forEach((n) => (n.leida = true));
        },
      });
    }
  }

  // --- LÓGICA DE MENÚ Y PERFIL ---

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Cerrar notificaciones si están abiertas
    if (this.isMenuOpen) {
      this.showNotifications = false;
    }
  }

  verificarPerfil(idUsuario: number) {
    this.studentService.getProfile(idUsuario).subscribe({
      next: (perfil) => {
        // Si el perfil existe y tiene nombre, asumimos que está completo
        this.tienePerfilCompleto = !!(perfil && perfil.nombre);
      },
      error: () => {
        this.tienePerfilCompleto = false;
      },
    });
  }

  navegarAlPerfil() {
    this.isMenuOpen = false;
    if (this.tienePerfilCompleto) {
      this.router.navigate(['/mi-perfil']);
    } else {
      this.router.navigate(['/cv-builder']);
    }
  }

  // --- LÓGICA DE LOGIN / LOGOUT ---

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

  // ---  ROLES ---

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
}
