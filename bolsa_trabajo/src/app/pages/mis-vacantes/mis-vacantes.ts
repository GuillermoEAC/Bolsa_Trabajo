import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-mis-vacantes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-vacantes.html',
  styleUrls: ['./mis-vacantes.css'],
})
export class MisVacantesComponent implements OnInit {
  private vacantesService = inject(VacantesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef); // 👈 2. Inyectar el detector de cambios

  vacantes: any[] = [];
  loading = true;

  ngOnInit() {
    this.authService.usuario$.subscribe((usuario) => {
      if (usuario && usuario.id_usuario) {
        console.log('👤 Usuario detectado:', usuario.id_usuario);
        this.cargarVacantes(usuario.id_usuario);
      } else {
        console.log('⚠️ No hay usuario (aún)');
        // No ponemos loading false aquí todavía por si el usuario tarda un milisegundo en llegar
      }
    });
  }

  cargarVacantes(idUsuario: number) {
    this.loading = true;

    this.vacantesService.obtenerVacantesPorUsuario(idUsuario).subscribe({
      next: (data: any) => {
        console.log('📦 Datos recibidos:', data);
        this.vacantes = data;
        this.loading = false;

        // 👈 3. ¡EL TRUCO! Forzar la actualización de la vista
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges(); // 👈 Forzar actualización también en error
      },
    });
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar esta vacante?')) {
      this.vacantesService.eliminarVacante(id).subscribe({
        next: () => {
          // Recargamos usando el usuario actual
          const usuario = this.authService.obtenerUsuarioActual();
          if (usuario) this.cargarVacantes(usuario.id_usuario);
        },
        error: (err: any) => alert('Error al eliminar'),
      });
    }
  }

  editar(id: number) {
    this.router.navigate(['/publicar-vacante', id]);
  }
}
