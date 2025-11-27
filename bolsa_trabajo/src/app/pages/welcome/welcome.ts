import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
// Importamos el nuevo servicio de iconos
import { IconService } from '../../core/icon.spec';
import { CommonModule } from '@angular/common'; // Necesario para directivas como @for, @if
import { IconComponent } from '../../cositas/icon.component';
@Component({
  selector: 'app-welcome',
  standalone: true,
  // Asegúrate de que CommonModule esté importado si usas directivas de control de flujo en un standalone
  imports: [CommonModule, IconComponent],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  // 1. Inyectamos el servicio de iconos en el constructor
  constructor(private iconService: IconService) {}

  protected searchTerm = signal('');
  protected searchFeedback = signal('');

  // 2. Usamos nombres clave en lugar de emojis
  protected categories = [
    { name: 'Desarrollo Web', jobs: 120, iconName: 'Tools' }, // Usando 'Tools'
    { name: 'Diseño Gráfico', jobs: 45, iconName: 'Lightbulb' }, // Usando 'Lightbulb'
    { name: 'Marketing Digital', jobs: 78, iconName: 'TrendUp' }, // Usando 'TrendUp'
    { name: 'Recursos Humanos', jobs: 33, iconName: 'Users' }, // Usando 'Users'
    { name: 'Ventas', jobs: 50, iconName: 'Briefcase' },
    { name: 'Finanzas', jobs: 22, iconName: 'TrendUp' },
    { name: 'Atención al Cliente', jobs: 90, iconName: 'Users' },
    { name: 'Educación', jobs: 15, iconName: 'Lightbulb' },
  ];

  // 3. Método para obtener el icono seguro (llamará al servicio)
  getIconHtml(name: string) {
    return this.iconService.getIcon(name);
  }

  // Lógica para actualizar el término de búsqueda...
  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  // Lógica para simular la búsqueda...
  searchJobs() {
    if (this.searchTerm().trim()) {
      this.searchFeedback.set(`Buscando empleos para "${this.searchTerm()}"...`);
      setTimeout(() => this.searchFeedback.set(''), 2000);
    } else {
      this.searchFeedback.set('Por favor, ingresa un término de búsqueda.');
      setTimeout(() => this.searchFeedback.set(''), 2000);
    }
  }
}
