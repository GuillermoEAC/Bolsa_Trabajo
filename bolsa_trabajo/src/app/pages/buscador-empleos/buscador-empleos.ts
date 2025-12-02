import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';
import { IconComponent } from '../../cositas/icon.component';
// 👇 IMPORTANTE: Importar estos dos servicios
import { AuthService } from '../../services/auth.services';
import { PostulacionesService } from '../../services/postulaciones.service';
import { FavoritosService } from '../../services/favoritos.service'; // 👈 Importar
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
  private authService = inject(AuthService); // 👈 Inyectar Auth
  private postulacionesService = inject(PostulacionesService); // 👈 Inyectar Postulaciones
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
    this.vacantesService.buscarVacantes(this.filtros).subscribe({
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

  // 🔥 ESTA ES LA FUNCIÓN QUE TE FALTABA
  postularse(idVacante: number) {
    const usuario = this.authService.obtenerUsuarioActual();

    // 1. Validar si está logueado
    if (!usuario) {
      if (confirm('Necesitas iniciar sesión para postularte. ¿Quieres ir al login?')) {
        this.router.navigate(['/login']); // O abre tu modal
      }
      return;
    }

    // 2. Validar si es estudiante (Rol 2)
    // Rol 3 es Empresa, Rol 1 Admin
    if (usuario.id_rol !== 2) {
      alert('Solo los estudiantes pueden postularse. Las empresas no pueden.');
      return;
    }

    if (confirm('¿Confirmas que deseas enviar tu postulación a esta vacante?')) {
      this.postulacionesService.aplicarVacante(usuario.id_usuario, idVacante).subscribe({
        next: (res: any) => {
          alert('✅ ' + res.mensaje);
        },
        error: (err: any) => {
          console.error(err);
          // Muestra mensaje del backend (ej: "Ya te has postulado")
          alert('❌ ' + (err.error?.error || 'Error al postular'));
        },
      });
    }
  }

  toggleFavorito(idVacante: number) {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      alert('Inicia sesión para guardar favoritos.');
      return;
    }

    // Llamada real a la API
    this.favoritosService.toggleFavorito(usuario.id_usuario, idVacante).subscribe({
      next: (res: any) => {
        // Mostramos feedback visual
        if (res.estado) {
          alert('❤️ ' + res.mensaje);
        } else {
          alert('💔 ' + res.mensaje);
        }
        // Opcional: Aquí podrías cambiar el ícono a relleno/vacío si tuvieras esa variable en la vacante
      },
      error: (err: any) => console.error(err),
    });
  }

  obtenerUrlLogo(logoPath: string): string {
    return logoPath ? `http://localhost:3000/${logoPath}` : 'assets/img/Logo_Completo.png';
  }
}
