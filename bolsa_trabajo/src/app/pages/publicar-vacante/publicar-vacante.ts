import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-publicar-vacante',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './publicar-vacante.html',
  styleUrls: ['./publicar-vacante.css'],
})
export class PublicarVacanteComponent implements OnInit {
  private vacantesService = inject(VacantesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Objeto local (Frontend)
  vacante = {
    titulo: '',
    descripcion: '',
    ubicacion: '',
    modalidad: 'Presencial',
    tipo_contrato: 'Tiempo Completo', // Valor por defecto
    salario_min: null,
    salario_max: null,
    id_categoria: null,
  };

  categorias: any[] = [];
  esEdicion = false;
  idVacante: number = 0;
  usuario: any = null;

  ngOnInit() {
    this.usuario = this.authService.obtenerUsuarioActual();

    this.vacantesService.obtenerCategorias().subscribe({
      next: (data) => {
        console.log('Categorías cargadas:', data);
        this.categorias = data;
      },
      error: (err) => console.error('Error cargando categorías', err),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.idVacante = Number(id);
      this.cargarDatosVacante(this.idVacante);
    }
  }

  cargarDatosVacante(id: number) {
    this.vacantesService.obtenerVacantePorId(id).subscribe({
      next: (data: any) => {
        this.vacante = {
          titulo: data.titulo_cargo,
          descripcion: data.descripcion_vacante,
          ubicacion: data.ubicacion,
          modalidad: data.tipo_trabajo,
          tipo_contrato: data.tipo_contrato || 'Tiempo Completo',
          salario_min: data.salario_min,
          salario_max: data.salario_max,
          id_categoria: data.id_categoria,
        };
      },
      error: (err) => console.error('Error al cargar vacante:', err),
    });
  }

  guardarVacante() {
    if (!this.usuario) {
      Swal.fire('Atención', 'Debes iniciar sesión como empresa para publicar.', 'warning');
      return;
    }

    const datosParaEnviar = { ...this.vacante, id_usuario: this.usuario.id_usuario };

    if (this.esEdicion) {
      this.vacantesService.actualizarVacante(this.idVacante, datosParaEnviar).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Actualizado!',
            text: 'La vacante se actualizó correctamente.',
            icon: 'success',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            this.router.navigate(['/mis-vacantes']);
          });
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo actualizar la vacante.', 'error');
        },
      });
    } else {
      this.vacantesService.publicarVacante(datosParaEnviar).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Publicado!',
            text: 'Tu vacante ha sido creada y enviada a revisión.',
            icon: 'success',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            this.router.navigate(['/mis-vacantes']);
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Oops...', 'Hubo un error al publicar la vacante.', 'error');
        },
      });
    }
  }
}
