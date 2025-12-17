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
import Swal from 'sweetalert2'; // <--- IMPORTAR AQUÍ

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

  // Resúmenes
  resumenEmpresas = { total: 0, validadas: 0, pendientes: 0 };
  resumenVacantes = { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 };
  resumenUsuarios = { total: 0, estudiantes: 0, empresas: 0 };

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
          console.error(err);
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
          console.error(err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else if (this.vistaActual === 'usuarios') {
      this.adminService.obtenerUsuarios().subscribe({
        next: (data) => {
          this.usuarios = data.usuarios;
          this.resumenUsuarios = data.resumen;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  calcularResumenEmpresas() {
    this.resumenEmpresas.total = this.empresas.length;
    this.resumenEmpresas.validadas = this.empresas.filter((e) => e.validada === 1).length;
    this.resumenEmpresas.pendientes = this.empresas.filter((e) => e.validada === 0).length;
  }

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

  // ========== LÓGICA EMPRESAS (Con SweetAlert) ==========
  toggleValidacion(empresa: any) {
    const nuevoEstado = empresa.validada === 0 ? true : false;
    const accionTexto = nuevoEstado ? 'Aprobar' : 'Desactivar';
    const colorBoton = nuevoEstado ? '#10b981' : '#ef4444'; // Verde o Rojo

    Swal.fire({
      title: `¿${accionTexto} empresa?`,
      text: `Vas a ${accionTexto.toLowerCase()} a "${empresa.nombre_empresa}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: colorBoton,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${accionTexto.toLowerCase()}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.cambiarEstadoEmpresa(empresa.id_empresa, nuevoEstado).subscribe({
          next: () => {
            this.cargarDatos();
            this.cdr.detectChanges();
            Swal.fire('¡Listo!', `Empresa ${nuevoEstado ? 'aprobada' : 'desactivada'}.`, 'success');
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
          },
        });
      }
    });
  }

  // ========== LÓGICA VACANTES (Con SweetAlert) ==========
  moderarVacante(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    const accion = estado === 'APROBADA' ? 'aprobar' : 'rechazar';
    const color = estado === 'APROBADA' ? '#10b981' : '#ef4444';

    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} vacante?`,
      text: 'Esta acción notificará a la empresa.',
      icon: estado === 'APROBADA' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.moderarVacante(id, accion).subscribe({
          next: () => {
            const vacanteIndex = this.vacantes.findIndex((v) => v.id_vacante === id);
            if (vacanteIndex !== -1) {
              this.vacantes[vacanteIndex].estado_aprobacion = estado;
              this.calcularResumenVacantes();
            }
            this.cdr.detectChanges();

            // Alerta pequeña (Toast) en la esquina
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
            Toast.fire({
              icon: 'success',
              title: `Vacante ${estado.toLowerCase()} con éxito`,
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo moderar la vacante.', 'error');
          },
        });
      }
    });
  }

  eliminarVacante(id: number) {
    Swal.fire({
      title: '¿Eliminar vacante?',
      text: 'Se borrarán todas las postulaciones asociadas. ¡No hay vuelta atrás!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarVacante(id).subscribe({
          next: () => {
            this.cargarDatos();
            this.cdr.detectChanges();
            Swal.fire('Eliminado', 'La vacante ha sido eliminada.', 'success');
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la vacante.', 'error');
          },
        });
      }
    });
  }

  // ========== LÓGICA USUARIOS (Con SweetAlert) ==========
  eliminarUsuario(usuario: any) {
    const tipo = usuario.tipo_usuario;
    const nombre = tipo === 'ESTUDIANTE' ? `${usuario.nombre} ${usuario.apellido}` : usuario.nombre;
    const textoAdvertencia =
      tipo === 'ESTUDIANTE'
        ? 'Se borrarán todas sus postulaciones y CV.'
        : 'Se borrarán sus vacantes y postulaciones recibidas.';

    Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: textoAdvertencia,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar usuario',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarUsuario(usuario.id, tipo).subscribe({
          next: () => {
            this.cargarDatos();
            this.cdr.detectChanges();
            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
          },
        });
      }
    });
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
