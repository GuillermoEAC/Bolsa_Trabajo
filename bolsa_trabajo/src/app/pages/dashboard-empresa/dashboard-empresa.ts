import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { AnalyticsService } from '../../services/analytics.service';
import { IconComponent } from '../../cositas/icon.component';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './dashboard-empresa.html',
  styleUrl: './dashboard-empresa.css',
})
export class DashboardEmpresaComponent implements OnInit {
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  usuario = this.authService.obtenerUsuarioActual();
  stats: any = null;
  loading = true;

  ngOnInit() {
    if (this.usuario) {
      this.cargarEstadisticas();
    } else {
      this.loading = false;
    }
  }

  cargarEstadisticas() {
    this.loading = true;
    this.analyticsService.obtenerEstadisticasEmpresa(this.usuario.id_usuario).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
