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
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      Swal.fire('Error', 'No hay sesión activa', 'error');
      return;
    }

    const datosEnviar = {
      titulo: this.vacante.titulo, // ✅ Antes pusimos 'titulo_cargo', cámbialo a 'titulo'
      descripcion: this.vacante.descripcion, // ✅ Antes 'descripcion_vacante', cámbialo a 'descripcion'

      categoria: this.vacante.id_categoria, // Asegúrate de usar id_categoria si es un ID
      tipo_contrato: this.vacante.tipo_contrato,
      modalidad: this.vacante.modalidad,
      ubicacion: this.vacante.ubicacion,
      salario_min: Number(this.vacante.salario_min),
      salario_max: Number(this.vacante.salario_max),
      id_usuario: usuario.id_usuario,
    };

    console.log('📦 ENVIANDO:', datosEnviar);

    this.vacantesService.crearVacante(datosEnviar).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Vacante creada', 'success');
        this.router.navigate(['/dashboard-empresa']);
      },
      error: (err: any) => {
        console.log(' ERROR COMPLETO:', err);

        const mensajeBackend = err.error?.message || err.error?.error || JSON.stringify(err.error);

        Swal.fire({
          title: 'Error 400',
          text: 'El servidor dice: ' + mensajeBackend,
          icon: 'error',
        });
      },
    });
  }
}
