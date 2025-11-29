import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // 👈 1. Importamos Router
import { IconComponent } from '../../cositas/icon.component'; // Tu componente de íconos

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
  // changeDetection: ChangeDetectionStrategy.OnPush, // Opcional, si lo usas recuerda importar ChangeDetectionStrategy
})
export class WelcomeComponent {
  // 2. Inyectamos el Router
  private router = inject(Router);

  // Variable para el input de búsqueda (vinculada con ngModel en el HTML)
  terminoBusqueda: string = '';

  // 3. Lógica para buscar desde el Input principal
  buscar() {
    if (this.terminoBusqueda.trim()) {
      console.log('Navegando a empleos con:', this.terminoBusqueda);
      // Navegamos pasando el parámetro 'q'
      this.router.navigate(['/empleos'], {
        queryParams: { q: this.terminoBusqueda },
      });
    } else {
      // Si está vacío, vamos al buscador general
      this.router.navigate(['/empleos']);
    }
  }

  // 4. Lógica para buscar al dar clic en una Categoría
  buscarPorCategoria(categoria: string) {
    console.log('Navegando a categoría:', categoria);
    this.router.navigate(['/empleos'], {
      queryParams: { q: categoria },
    });
  }
}
