import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-publicar-vacante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicar-vacante.html',
  styleUrls: ['./publicar-vacante.css'],
})
export class PublicarVacanteComponent implements OnInit {
  private vacantesService = inject(VacantesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vacante = {
    // FIX: Propiedades renombradas a titulo_cargo y descripcion_vacante
    titulo_cargo: '',
    descripcion_vacante: '',
    ubicacion: '',
    modalidad: 'Presencial',
    tipo_contrato: 'Tiempo Completo',
    salario_min: 0,
    salario_max: 0,
  };

  loading = false;
  esEdicion = false;
  idVacanteEditar: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.idVacanteEditar = Number(id);
      this.cargarDatosVacante(this.idVacanteEditar);
    }
  }

  cargarDatosVacante(id: number) {
    this.vacantesService.obtenerVacantePorId(id).subscribe({
      next: (data: any) => {
        // Mapeamos los datos de la respuesta a las propiedades del modelo local
        this.vacante = {
          titulo_cargo: data.titulo_cargo,
          descripcion_vacante: data.descripcion_vacante,
          ubicacion: data.ubicacion,
          modalidad: data.tipo_trabajo,
          tipo_contrato: 'Tiempo Completo',
          salario_min: data.salario_min,
          salario_max: data.salario_max,
        };
      },
      error: (err: any) => console.error('Error al cargar datos', err),
    });
  }

  onSubmit() {
    this.loading = true;
    const usuario = this.authService.obtenerUsuarioActual();

    if (this.esEdicion && this.idVacanteEditar) {
      // EDITAR
      this.vacantesService.actualizarVacante(this.idVacanteEditar, this.vacante).subscribe({
        next: () => {
          console.log('Vacante actualizada con éxito');
          this.router.navigate(['/mis-vacantes']);
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error al actualizar', err);
          alert('Error al actualizar');
        },
      });
    } else {
      // CREAR
      const payload = {
        id_usuario: usuario.id_usuario,
        ...this.vacante,
      };

      this.vacantesService.publicarVacante(payload).subscribe({
        next: () => {
          console.log('Vacante publicada con éxito');
          this.router.navigate(['/mis-vacantes']);
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error al publicar', err);
          alert('Error al publicar');
        },
      });
    }
  }

  cancelar() {
    this.router.navigate(['/mis-vacantes']);
  }
}
