// src\app\pages\dashboard-empresa\dashboard-empresa.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { AnalyticsService } from '../../services/analytics.service';
import { CompanyService } from '../../services/company.service'; // <--- Importar servicio
import { IconComponent } from '../../cositas/icon.component';
import { PerfilEmpresaComponent } from './perfil-empresa/perfil-empresa';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, PerfilEmpresaComponent],
  templateUrl: './dashboard-empresa.html',
  styleUrl: './dashboard-empresa.css',
})
export class DashboardEmpresaComponent implements OnInit {
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private companyService = inject(CompanyService); // <--- Inyectar
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  usuario = this.authService.obtenerUsuarioActual();
  stats: any = null;

  loading = true;
  verificandoEstado = true;
  empresaValidada = false;
  vistaActual: 'resumen' | 'perfil' = 'resumen';

  cambiarVista(vista: 'resumen' | 'perfil') {
    this.vistaActual = vista;
  }
  ngOnInit() {
    if (this.usuario) {
      this.verificarAcceso();
    } else {
      this.loading = false;
      this.router.navigate(['/welcome']);
    }
  }

  // Verificar si la empresa está validada en BD
  verificarAcceso() {
    this.verificandoEstado = true;

    this.companyService.obtenerEstadoEmpresa(this.usuario.id_usuario).subscribe({
      next: (data) => {
        // El backend devuelve { validada: 1 (o 0), ... }
        this.empresaValidada = data.validada === 1;
        this.verificandoEstado = false;

        // Si está validada, cargamos las estadísticas normales
        if (this.empresaValidada) {
          this.cargarEstadisticas();
        } else {
          // Si no, detenemos loading y mostramos pantalla de bloqueo
          this.loading = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error verificando estado de empresa:', err);
        this.verificandoEstado = false;
        this.loading = false;
        this.cd.detectChanges();
      },
    });
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
