import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // 👈 1. Importar RouterLink
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,

  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-empresa.html',
  styleUrl: './dashboard-empresa.css',
})
export class DashboardEmpresaComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuarioActual();

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }

  // Opcional: Si prefieres usar una función en lugar de routerLink en el HTML
  irAPublicar() {
    this.router.navigate(['/publicar-vacante']);
  }
}
