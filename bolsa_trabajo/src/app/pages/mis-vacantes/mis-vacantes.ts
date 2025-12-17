// /src/app/pages/mis-vacantes/mis-vacantes.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';
import { AuthService } from '../../services/auth.services';
import { IconComponent } from '../../cositas/icon.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-mis-vacantes',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './mis-vacantes.html',
  styleUrls: ['./mis-vacantes.css'],
})
export class MisVacantesComponent implements OnInit {
  private vacantesService = inject(VacantesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  vacantes: any[] = [];
  loading = true;

  ngOnInit() {
    this.authService.usuario$.subscribe((usuario) => {
      if (usuario && usuario.id_usuario) {
        this.cargarVacantes(usuario.id_usuario);
      } else {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarVacantes(idUsuario: number) {
    this.loading = true;
    this.vacantesService.obtenerVacantesPorUsuario(idUsuario).subscribe({
      next: (data: any) => {
        this.vacantes = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  obtenerEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      APROBADA: 'Activa',
      PENDIENTE: 'En Revisión',
      RECHAZADA: 'Rechazada',
    };
    return estados[estado] || 'Desconocido';
  }

  obtenerEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      APROBADA: 'active',
      PENDIENTE: 'pending',
      RECHAZADA: 'rejected',
    };
    return clases[estado] || 'unknown';
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario dijo que SÍ, ejecutamos el servicio
        this.vacantesService.eliminarVacante(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La vacante ha sido eliminada.', 'success');
            const usuario = this.authService.obtenerUsuarioActual();
            if (usuario) this.cargarVacantes(usuario.id_usuario);
          },
          error: (err) => Swal.fire('Error', 'No se pudo eliminar la vacante.', 'error'),
        });
      }
    });
  }

  editar(id: number) {
    this.router.navigate(['/publicar-vacante', id]);
  }
}
