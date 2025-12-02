import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostulacionesService } from '../../services/postulaciones.service';
// Si usas el componente de íconos, impórtalo (si no, borra esta línea)
import { IconComponent } from '../../cositas/icon.component';

@Component({
  selector: 'app-ver-candidatos',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  // Asegúrate de que el nombre del HTML sea correcto:
  templateUrl: './ver-candidatos.html',
  styleUrls: ['./ver-candidatos.css'],
})
export class VerCandidatosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postulacionesService = inject(PostulacionesService);
  private cd = inject(ChangeDetectorRef); // 👈 2. Inyectar el detector de cambios

  candidatos: any[] = [];
  loading = true;
  idVacante: number = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idVacante = Number(id);
      this.cargarCandidatos();
    }
  }

  cargarCandidatos() {
    this.loading = true;

    this.postulacionesService.obtenerCandidatos(this.idVacante).subscribe({
      next: (data: any) => {
        console.log('Candidatos cargados:', data);
        this.candidatos = data;
        this.loading = false;

        // 👈 3. ¡ESTO ES LO QUE ARREGLA EL BUG!
        // Fuerza a Angular a pintar la pantalla de nuevo con los datos
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar:', err);
        this.loading = false;
        // También actualizamos en caso de error para quitar el "Cargando..."
        this.cd.detectChanges();
      },
    });
  }

  actualizarEstado(idPostulacion: number, nuevoEstado: string) {
    if (confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) {
      this.postulacionesService.cambiarEstado(idPostulacion, nuevoEstado).subscribe({
        next: () => {
          // Recargamos la lista para ver el cambio de estado
          this.cargarCandidatos();
        },
        error: (err: any) => {
          console.error(err);
          alert('Error al actualizar el estado.');
        },
      });
    }
  }
}
