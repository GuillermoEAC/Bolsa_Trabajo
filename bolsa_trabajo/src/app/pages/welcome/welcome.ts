import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class WelcomeComponent implements OnInit {
  private router = inject(Router);
  private statsService = inject(StatsService);

  terminoBusqueda: string = '';

  stats = {
    empresas: 0,
    vacantes: 0,
  };

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.statsService.obtenerContadores().subscribe({
      next: (data) => {
        this.stats.empresas = data.total_empresas;
        this.stats.vacantes = data.total_vacantes;
      },
      error: (err) => console.error('No se pudieron cargar stats', err),
    });
  }

  buscar() {
    if (this.terminoBusqueda.trim()) {
      this.router.navigate(['/empleos'], {
        queryParams: { q: this.terminoBusqueda },
      });
    } else {
      this.router.navigate(['/empleos']);
    }
  }

  buscarPorCategoria(categoria: string) {
    this.router.navigate(['/empleos'], {
      queryParams: { q: categoria },
    });
  }
}
