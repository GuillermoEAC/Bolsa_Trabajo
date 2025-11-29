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
  // 👇 VERIFICA QUE ESTE NOMBRE COINCIDA CON TU ARCHIVO REAL
  templateUrl: './publicar-vacante.html',
  styleUrls: ['./publicar-vacante.css'],
})
export class PublicarVacanteComponent implements OnInit {
  private vacantesService = inject(VacantesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vacante = {
    titulo: '',
    ubicacion: '',
    modalidad: 'Presencial',
    tipo_contrato: 'Tiempo Completo',
    salario_min: 0,
    salario_max: 0,
    descripcion: '',
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
        // : any para evitar error
        this.vacante = {
          titulo: data.titulo_cargo,
          ubicacion: data.ubicacion,
          modalidad: data.tipo_trabajo,
          tipo_contrato: 'Tiempo Completo',
          salario_min: data.salario_min,
          salario_max: data.salario_max,
          descripcion: data.descripcion_vacante,
        };
      },
      error: (err: any) => alert('Error al cargar datos'),
    });
  }

  onSubmit() {
    this.loading = true;
    const usuario = this.authService.obtenerUsuarioActual();

    if (this.esEdicion && this.idVacanteEditar) {
      // EDITAR
      this.vacantesService.actualizarVacante(this.idVacanteEditar, this.vacante).subscribe({
        next: () => {
          alert('Actualizado con éxito');
          this.router.navigate(['/mis-vacantes']);
        },
        error: (err: any) => {
          this.loading = false;
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
          alert('Publicado con éxito');
          this.router.navigate(['/mis-vacantes']);
        },
        error: (err: any) => {
          this.loading = false;
          alert('Error al publicar');
        },
      });
    }
  }

  cancelar() {
    this.router.navigate(['/mis-vacantes']);
  }
}
