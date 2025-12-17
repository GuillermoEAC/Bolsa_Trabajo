// src/app/pages/mis-postulaciones
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostulacionesService } from '../../services/postulaciones.service';
import { AuthService } from '../../services/auth.services';
import { IconComponent } from '../../cositas/icon.component';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-mis-postulaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './mis-postulaciones.html',
  styleUrls: ['./mis-postulaciones.css'],
})
export class MisPostulacionesComponent implements OnInit {
  private postulacionesService = inject(PostulacionesService);
  private authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef);

  postulaciones: any[] = [];
  loading = true;

  ngOnInit() {
    this.authService.usuario$.subscribe((usuario) => {
      if (usuario && usuario.id_usuario) {
        this.cargarHistorial(usuario.id_usuario);
      } else {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarHistorial(idUsuario: number) {
    this.loading = true;

    this.postulacionesService.obtenerHistorial(idUsuario).subscribe({
      next: (data: any) => {
        console.log('Historial recibido:', data);
        this.postulaciones = data;
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

  obtenerUrlLogo(path: string) {
    if (!path) return 'assets/img/Logo_Completo.png';

    if (path.startsWith('http')) return path;

    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    return `${baseUrl}/${cleanPath}`;
  }
}
