import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.services';
import { IconComponent } from '../../cositas/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  empresas: any[] = [];
  vacantes: any[] = [];
  usuarios: any[] = [];

  vistaActual: 'empresas' | 'vacantes' | 'usuarios' = 'empresas';
  loading = true;
  menuOpen = false;

  // RESÚMENES ESTADÍSTICOS
  resumenEmpresas = {
    total: 0,
    validadas: 0,
    pendientes: 0,
  };

  resumenVacantes = {
    total: 0,
    aprobadas: 0,
    pendientes: 0,
    rechazadas: 0,
  };

  resumenUsuarios = {
    total: 0,
    estudiantes: 0,
    empresas: 0,
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.cdr.markForCheck();

    if (this.vistaActual === 'empresas') {
      this.adminService.obtenerEmpresas().subscribe({
        next: (data) => {
          this.empresas = data;
          this.calcularResumenEmpresas();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar empresas:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else if (this.vistaActual === 'vacantes') {
      this.adminService.obtenerVacantes().subscribe({
        next: (data) => {
          this.vacantes = data;
          this.calcularResumenVacantes();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar vacantes:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else if (this.vistaActual === 'usuarios') {
      // CARGAR USUARIOS
      this.adminService.obtenerUsuarios().subscribe({
        next: (data) => {
          this.usuarios = data.usuarios;
          this.resumenUsuarios = data.resumen;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  // CALCULAR RESUMEN DE EMPRESAS
  calcularResumenEmpresas() {
    this.resumenEmpresas.total = this.empresas.length;
    // Asumiendo que 'validada' es 1 (true) o 0 (false)
    this.resumenEmpresas.validadas = this.empresas.filter((e) => e.validada === 1).length;
    this.resumenEmpresas.pendientes = this.empresas.filter((e) => e.validada === 0).length;
  }

  // CALCULAR RESUMEN DE VACANTES
  calcularResumenVacantes() {
    this.resumenVacantes.total = this.vacantes.length;
    this.resumenVacantes.aprobadas = this.vacantes.filter(
      (v) => v.estado_aprobacion === 'APROBADA'
    ).length;
    this.resumenVacantes.pendientes = this.vacantes.filter(
      (v) => v.estado_aprobacion === 'PENDIENTE'
    ).length;
    this.resumenVacantes.rechazadas = this.vacantes.filter(
      (v) => v.estado_aprobacion === 'RECHAZADA'
    ).length;
  }

  cambiarVista(vista: 'empresas' | 'vacantes' | 'usuarios') {
    this.vistaActual = vista;
    this.cdr.markForCheck();
    this.cargarDatos();
  }

  // ========== LÓGICA EMPRESAS ==========
  toggleValidacion(empresa: any) {
    // Si validada es 1 (true), el nuevo estado será 0 (false) y viceversa.
    const nuevoEstado = empresa.validada === 0 ? true : false;

    // NOTA: Usar confirm() y alert() debe ser reemplazado por un modal en producción.
    if (confirm(`¿${nuevoEstado ? 'Aprobar' : 'Desactivar'} a ${empresa.nombre_empresa}?`)) {
      this.adminService.cambiarEstadoEmpresa(empresa.id_empresa, nuevoEstado).subscribe({
        next: () => {
          this.cargarDatos();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          alert('Error al actualizar el estado de la empresa');
        },
      });
    }
  }

  // ========== LÓGICA VACANTES ==========
  moderarVacante(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    if (confirm(`¿Confirmas cambiar el estado a ${estado}?`)) {
      // 💡 Nota: Aquí podrías obtener el ID del admin de tu servicio de autenticación
      // const adminId = this.authService.getAdminId();

      this.adminService.moderarVacante(id, estado).subscribe({
        next: () => {
          alert(`Vacante moderada como ${estado}.`); // Alerta de éxito // *** MODIFICACIÓN CLAVE: Actualiza la lista sin recargar todo ***

          const vacanteIndex = this.vacantes.findIndex((v) => v.id_vacante === id);
          if (vacanteIndex !== -1) {
            this.vacantes[vacanteIndex].estado_aprobacion = estado; // Actualiza el estado
            this.calcularResumenVacantes(); // Recalcula el resumen
          }
          this.cdr.detectChanges(); // Forzar la actualización de la vista
        },
        error: (err) => {
          console.error('Error al moderar vacante:', err);
          alert('Error al moderar la vacante. Revisa la consola del backend.');
        },
      });
    }
  }

  eliminarVacante(id: number) {
    if (confirm('¿Eliminar definitivamente? Se borrarán las postulaciones asociadas.')) {
      this.adminService.eliminarVacante(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar vacante:', err);
          alert('Error al eliminar la vacante');
        },
      });
    }
  }

  // ========== LÓGICA USUARIOS ==========
  eliminarUsuario(usuario: any) {
    const tipo = usuario.tipo_usuario;
    const nombre = tipo === 'ESTUDIANTE' ? `${usuario.nombre} ${usuario.apellido}` : usuario.nombre;

    const mensaje =
      tipo === 'ESTUDIANTE'
        ? `¿Eliminar a ${nombre}? Se borrarán todas sus postulaciones.`
        : `¿Eliminar a ${nombre}? Se borrarán todas sus vacantes y postulaciones asociadas.`;

    if (confirm(mensaje)) {
      // Nota: El backend recibe el tipo como parte de la ruta.
      this.adminService.eliminarUsuario(usuario.id, tipo).subscribe({
        next: () => {
          this.cargarDatos();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('Error al eliminar el usuario');
        },
      });
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
