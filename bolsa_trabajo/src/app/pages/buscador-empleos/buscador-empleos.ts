// src/app/pages/buscar-empleos.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';
import { IconComponent } from '../../cositas/icon.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.services';
import { PostulacionesService } from '../../services/postulaciones.service';
import { FavoritosService } from '../../services/favoritos.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-buscador-empleos',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './buscador-empleos.html',
  styleUrls: ['./buscador-empleos.css'],
})
export class BuscadorEmpleosComponent implements OnInit {
  private favoritosService = inject(FavoritosService);
  private vacantesService = inject(VacantesService);
  private authService = inject(AuthService);
  private postulacionesService = inject(PostulacionesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  vacantes: any[] = [];
  cargando = true;

  filtros = {
    q: '',
    ubicacion: '',
    modalidad: '',
    minSalario: '',
    maxSalario: '',
    tipoContrato: '',
    fecha: '',
  };

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.filtros.q = params['q'] || '';
      this.filtros.ubicacion = params['ubicacion'] || '';
      this.filtros.modalidad = params['modalidad'] || '';
      this.filtros.minSalario = params['minSalario'] || '';
      this.filtros.maxSalario = params['maxSalario'] || '';
      this.filtros.tipoContrato = params['tipoContrato'] || '';
      this.filtros.fecha = params['fecha'] || '';

      this.buscar();
    });
  }

  buscar() {
    this.cargando = true;

    // 🔥 IMPORTANTE: Obtenemos el usuario para enviarlo al backend
    // Así el backend sabe cuáles vacantes marcar en rojo al cargar
    const usuario = this.authService.obtenerUsuarioActual();

    const filtrosConUsuario = {
      ...this.filtros,
      id_usuario: usuario ? usuario.id_usuario : null,
    };

    this.vacantesService.buscarVacantes(filtrosConUsuario).subscribe({
      next: (data: any) => {
        this.vacantes = data;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.cargando = false;
        this.cd.detectChanges();
      },
    });
  }

  aplicarFiltros() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filtros,
      queryParamsHandling: 'merge',
    });
  }

  postularse(idVacante: number) {
    // ... (Tu código de postularse que ya estaba bien con SweetAlert) ...
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario) {
      Swal.fire({
        title: 'Inicia Sesión',
        text: 'Necesitas una cuenta para postularte.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ir al Login',
      }).then((res) => {
        if (res.isConfirmed) this.router.navigate(['/login']);
      });
      return;
    }
    if (usuario.id_rol !== 2) {
      Swal.fire('Acceso denegado', 'Solo estudiantes.', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Enviar postulación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, postularme',
    }).then((res) => {
      if (res.isConfirmed) {
        this.postulacionesService.aplicarVacante(usuario.id_usuario, idVacante).subscribe({
          next: (r: any) => Swal.fire('¡Enviado!', r.mensaje, 'success'),
          error: (e: any) => Swal.fire('Error', e.error?.error || 'Error', 'error'),
        });
      }
    });
  }

  // 🔥 LÓGICA DE FAVORITOS VISUAL 🔥
  toggleFavorito(vacante: any) {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      Swal.fire({
        title: '¡Ups!',
        text: 'Inicia sesión para guardar tus favoritos.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // 1. CAMBIO VISUAL INSTANTÁNEO (UI Optimista)
    // Guardamos el estado anterior por si falla el servidor
    const estadoAnterior = vacante.es_favorito;

    // Cambiamos el estado local inmediatamente para que el usuario vea el cambio
    vacante.es_favorito = !vacante.es_favorito;

    // 2. LLAMADA AL BACKEND
    this.favoritosService.toggleFavorito(usuario.id_usuario, vacante.id_vacante).subscribe({
      next: (res: any) => {
        // Notificación Toast discreta
        const esLike = vacante.es_favorito; // Usamos el estado actual

        const icono = esLike ? '❤️' : '💔';
        const mensaje = esLike ? 'Agregado a favoritos' : 'Eliminado de favoritos';

        Swal.fire({
          title: icono,
          text: mensaje,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: esLike ? '#fff0f0' : '#f8f9fa',
          color: '#333',
        });
      },
      error: (err: any) => {
        console.error(err);
        // Si falla, revertimos el cambio visual
        vacante.es_favorito = estadoAnterior;
        Swal.fire('Error', 'No se pudo actualizar favoritos', 'error');
      },
    });
  }

  obtenerUrlLogo(logoPath: string): string {
    return logoPath
      ? `${environment.apiUrl.replace('/api', '')}/${logoPath}`
      : 'assets/img/Logo_Completo.png';
  }
}
