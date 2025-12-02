import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.services';
// 👇 Importar iconos
import { IconComponent } from '../../cositas/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  empresas: any[] = [];
  vacantes: any[] = [];

  vistaActual: 'empresas' | 'vacantes' = 'empresas';
  loading = true;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    if (this.vistaActual === 'empresas') {
      this.adminService.obtenerEmpresas().subscribe({
        next: (data) => {
          this.empresas = data;
          this.loading = false;
          this.cd.detectChanges();
        },
      });
    } else {
      this.adminService.obtenerVacantes().subscribe({
        next: (data) => {
          this.vacantes = data;
          this.loading = false;
          this.cd.detectChanges();
        },
      });
    }
  }

  cambiarVista(vista: 'empresas' | 'vacantes') {
    this.vistaActual = vista;
    this.cargarDatos();
  }

  // Lógica Empresas
  toggleValidacion(empresa: any) {
    const nuevoEstado = !empresa.validada;
    if (confirm(`¿${nuevoEstado ? 'Aprobar' : 'Desactivar'} a ${empresa.nombre_empresa}?`)) {
      this.adminService
        .cambiarEstadoEmpresa(empresa.id_empresa, nuevoEstado)
        .subscribe(() => this.cargarDatos());
    }
  }

  // Lógica Vacantes
  moderarVacante(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    if (confirm(`¿Confirmas cambiar el estado a ${estado}?`)) {
      this.adminService.moderarVacante(id, estado).subscribe(() => this.cargarDatos());
    }
  }

  eliminarVacante(id: number) {
    if (confirm('¿Eliminar definitivamente? Se borrarán las postulaciones asociadas.')) {
      this.adminService.eliminarVacante(id).subscribe(() => this.cargarDatos());
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
