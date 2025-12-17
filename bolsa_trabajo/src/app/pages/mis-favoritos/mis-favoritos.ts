// src/app/pages/mis-favoritos
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritosService } from '../../services/favoritos.service';
import { AuthService } from '../../services/auth.services';
import { IconComponent } from '../../cositas/icon.component'; // Iconos SVG
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-mis-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './mis-favoritos.html',
  styleUrls: ['./mis-favoritos.css'],
})
export class MisFavoritosComponent implements OnInit {
  private favService = inject(FavoritosService);
  private authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef);

  favoritos: any[] = [];
  loading = true;

  ngOnInit() {
    this.authService.usuario$.subscribe((user) => {
      if (user) {
        this.cargarFavoritos(user.id_usuario);
      } else {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarFavoritos(idUsuario: number) {
    this.favService.obtenerMisFavoritos(idUsuario).subscribe({
      next: (data) => {
        this.favoritos = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  quitar(idVacante: number) {
    const user = this.authService.obtenerUsuarioActual();
    if (confirm('¿Quitar de favoritos?')) {
      this.favService.toggleFavorito(user.id_usuario, idVacante).subscribe(() => {
        this.cargarFavoritos(user.id_usuario);
      });
    }
  }

  obtenerUrlLogo(path: string) {
    if (!path) return 'assets/img/Logo_Completo.png';

    if (path.startsWith('http')) return path;

    const baseUrl = environment.apiUrl.replace('/api', '');

    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    return `${baseUrl}/${cleanPath}`;
  }
}
