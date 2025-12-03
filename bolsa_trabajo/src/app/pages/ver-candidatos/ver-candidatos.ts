import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostulacionesService } from '../../services/postulaciones.service';

@Component({
  selector: 'app-ver-candidatos',
  standalone: true,
  imports: [CommonModule, RouterLink], // 🔥 SIN IconComponent
  templateUrl: './ver-candidatos.html',
  styleUrls: ['./ver-candidatos.css'],
})
export class VerCandidatosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postulacionesService = inject(PostulacionesService);
  private cd = inject(ChangeDetectorRef);

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
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar:', err);
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  actualizarEstado(idPostulacion: number, nuevoEstado: string) {
    if (confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) {
      this.postulacionesService.cambiarEstado(idPostulacion, nuevoEstado).subscribe({
        next: () => {
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
