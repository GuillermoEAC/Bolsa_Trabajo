import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.html',
  styleUrl: './welcome.css', // Referencia al nuevo CSS
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  // Estado para el término de búsqueda
  protected searchTerm = signal('');
  protected searchFeedback = signal('');

  // Datos simulados para las categorías
  protected categories = [
    { name: 'Desarrollo Web', jobs: 120, icon: '💻' },
    { name: 'Diseño Gráfico', jobs: 45, icon: '🎨' },
    { name: 'Marketing Digital', jobs: 78, icon: '📣' },
    { name: 'Recursos Humanos', jobs: 33, icon: '🤝' },
    { name: 'Ventas', jobs: 50, icon: '💰' },
    { name: 'Finanzas', jobs: 22, icon: '📈' },
    { name: 'Atención al Cliente', jobs: 90, icon: '📞' },
    { name: 'Educación', jobs: 15, icon: '📚' },
  ];

  // Lógica para actualizar el término de búsqueda
  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  // Lógica para simular la búsqueda
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
