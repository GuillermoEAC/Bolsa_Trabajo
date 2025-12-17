import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostulacionesService } from '../../services/postulaciones.service';
import { StudentService } from '../../services/student.service';
import { IconComponent } from '../../cositas/icon.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-ver-candidatos',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './ver-candidatos.html',
  styleUrls: ['./ver-candidatos.css'],
})
export class VerCandidatosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postulacionesService = inject(PostulacionesService);
  private studentService = inject(StudentService);
  private cd = inject(ChangeDetectorRef);

  candidatos: any[] = [];
  loading = true;
  idVacante: number = 0;

  modalAbierto = false;
  perfilSeleccionado: any = null;
  loadingPerfil = false;

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
        this.candidatos = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar:', err);
        this.loading = false;
      },
    });
  }

  actualizarEstado(idPostulacion: number, nuevoEstado: string) {
    let titulo = `¿Marcar como "${nuevoEstado}"?`;
    let colorBtn = '#3085d6';

    if (nuevoEstado === 'Rechazado') {
      titulo = '¿Estás seguro de rechazar a este candidato?';
      colorBtn = '#d33';
    } else if (nuevoEstado === 'Entrevista') {
      titulo = '¿Quieres citar a entrevista?';
      colorBtn = '#16a34a';
    }
    Swal.fire({
      title: titulo,
      text: 'Se notificará al estudiante automáticamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: colorBtn,
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Optimista UI update
        const candidatoIndex = this.candidatos.findIndex((c) => c.id_postulacion === idPostulacion);
        if (candidatoIndex !== -1) {
          this.candidatos[candidatoIndex].estado_postulacion = nuevoEstado;
        }

        this.postulacionesService.cambiarEstado(idPostulacion, nuevoEstado).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Listo!',
              text: `Estado actualizado a: ${nuevoEstado}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
            this.cargarCandidatos(); // Revertir cambios si falló
          },
        });
      }
    });
  }

  verPerfilCompleto(idUsuario: number) {
    this.modalAbierto = true;
    this.loadingPerfil = true;
    this.perfilSeleccionado = null;

    this.studentService.getProfile(idUsuario).subscribe({
      next: (data) => {
        this.perfilSeleccionado = {
          ...data,
          estudios: data.estudios || [],
          experiencias: data.experiencias || [],
          proyectos: data.proyectos || [],
        };
        this.loadingPerfil = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando perfil estudiante:', err);
        this.loadingPerfil = false;
        this.modalAbierto = false;
        alert('No se pudo cargar el perfil del candidato.');
      },
    });
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.perfilSeleccionado = null;
  }
}
