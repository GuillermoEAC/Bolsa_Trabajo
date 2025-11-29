import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VacantesService } from '../../services/vacantes.service';

@Component({
  selector: 'app-buscador-empleos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscador-empleos.html',
  styleUrls: ['./buscador-empleos.css'],
})
export class BuscadorEmpleosComponent implements OnInit {
  private vacantesService = inject(VacantesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vacantes: any[] = [];
  cargando = true;

  // Filtros
  filtros = {
    q: '',
    ubicacion: '',
    modalidad: '',
    minSalario: '',
    maxSalario: '',
  };

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.filtros.q = params['q'] || '';
      this.filtros.ubicacion = params['ubicacion'] || '';
      this.filtros.modalidad = params['modalidad'] || '';
      // Leemos los nuevos parámetros
      this.filtros.minSalario = params['minSalario'] || '';
      this.filtros.maxSalario = params['maxSalario'] || '';

      this.buscar();
    });
  }

  buscar() {
    this.cargando = true;
    this.vacantesService.buscarVacantes(this.filtros).subscribe({
      next: (data) => {
        this.vacantes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      },
    });
  }

  aplicarFiltros() {
    // Actualiza la URL para que se pueda compartir el link de búsqueda
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filtros,
      queryParamsHandling: 'merge',
    });
  }

  // Helper para construir la ruta de la imagen
  obtenerUrlLogo(logoPath: string): string {
    return logoPath ? `http://localhost:3000/${logoPath}` : 'assets/img/Logo_Completo.png';
  }
}
