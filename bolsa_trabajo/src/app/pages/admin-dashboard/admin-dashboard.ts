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
import Swal from 'sweetalert2';

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

  // ========== LÓGICA EMPRESAS ==========

  toggleValidacion(empresa: any) {
    // Si está Pendiente (0) -> Pasa a Activa (1)
    // Si está Activa (1)    -> Pasa a Desactivada (2)
    // Si está Desactivada (2) -> Pasa a Activa (1) (Reactivar)

    let nuevoEstado = 0;
    let accionTexto = '';
    let colorBoton = '';

    if (empresa.validada === 0) {
      nuevoEstado = 1;
      accionTexto = 'Aprobar';
      colorBoton = '#10b981'; // Verde
    } else if (empresa.validada === 1) {
      nuevoEstado = 2; // Desactivar
      accionTexto = 'Desactivar';
      colorBoton = '#ef4444'; // Rojo
    } else {
      nuevoEstado = 1; // Reactivar
      accionTexto = 'Reactivar';
      colorBoton = '#3b82f6'; // Azul
    }

    Swal.fire({
      title: `¿${accionTexto} empresa?`,
      text: `Cambiarás el estado de "${empresa.nombre_empresa}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: colorBoton,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${accionTexto}`,
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviamos el número (0, 1, 2)
        this.adminService.cambiarEstadoEmpresa(empresa.id_empresa, nuevoEstado).subscribe({
          next: () => {
            this.cargarDatos();
            this.cdr.detectChanges();
            Swal.fire('¡Listo!', `Estado actualizado a: ${accionTexto}`, 'success');
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar.', 'error');
          },
        });
      }
    });
  }

  rechazarEmpresa(empresa: any) {
    Swal.fire({
      title: '¿Rechazar solicitud?',
      text: `Se eliminará permanentemente el registro de "${empresa.nombre_empresa}" y su usuario asociado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, rechazar y eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const idParaBorrar = empresa.id_usuario;

        this.adminService.eliminarUsuario(idParaBorrar, 'EMPRESA').subscribe({
          next: () => {
            this.cargarDatos();
            this.cdr.detectChanges();

            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
            Toast.fire({
              icon: 'success',
              title: 'Solicitud rechazada y eliminada',
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo rechazar la empresa.', 'error');
          },
        });
      }
    });
  }

  // ========== LÓGICA VACANTES ==========

  moderarVacante(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    // CASO 1: APROBAR (Simple confirmación)
    if (estado === 'APROBADA') {
      Swal.fire({
        title: '¿Aprobar vacante?',
        text: 'La vacante será visible para todos los estudiantes.',
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, aprobar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.ejecutarModeracion(id, 'aprobar', '');
        }
      });
    } else {
      Swal.fire({
        title: 'Rechazar Vacante',
        text: 'Por favor, indica el motivo del rechazo para la empresa:',
        input: 'textarea',
        inputPlaceholder: 'Ej: La descripción es muy vaga...',
        inputAttributes: {
          'aria-label': 'Escribe el motivo del rechazo',
        },
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Rechazar vacante',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes escribir un motivo obligatoriamente!';
          }
          return null;
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.ejecutarModeracion(id, 'rechazar', result.value);
        }
      });
    }
  }
  private ejecutarModeracion(id: number, accion: 'aprobar' | 'rechazar', motivo: string) {
    Swal.fire({
      title: 'Procesando...',
      didOpen: () => Swal.showLoading(),
    });

    this.adminService.moderarVacante(id, accion, motivo).subscribe({
      next: () => {
        // Actualizar la lista localmente
        const vacanteIndex = this.vacantes.findIndex((v) => v.id_vacante === id);
        if (vacanteIndex !== -1) {
          this.vacantes[vacanteIndex].estado_aprobacion =
            accion === 'aprobar' ? 'APROBADA' : 'RECHAZADA';
          this.calcularResumenVacantes();
        }
        this.cdr.detectChanges();

        // Mensaje de éxito final
        Swal.fire({
          icon: 'success',
          title: accion === 'aprobar' ? 'Vacante Aprobada' : 'Vacante Rechazada',
          text:
            accion === 'rechazar'
              ? 'Se ha notificado a la empresa.'
              : 'Ya está visible para estudiantes.',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo procesar la solicitud.', 'error');
      },
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

  // ========== LÓGICA USUARIOS ==========

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
}
