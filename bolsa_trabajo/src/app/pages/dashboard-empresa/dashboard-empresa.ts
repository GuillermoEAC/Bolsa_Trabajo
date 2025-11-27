import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-empresa.html',
  styleUrl: './dashboard-empresa.css',
})
export class DashboardEmpresa {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuarioActual();

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
