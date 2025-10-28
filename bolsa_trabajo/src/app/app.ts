// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Importa el HeaderComponent que se encuentra en ./header/header.ts
import { HeaderComponent } from './header/header'; // Asume que lo renombraste a HeaderComponent
// Importa el nuevo componente de Bienvenida
import { WelcomeComponent } from './welcome/welcome';

@Component({
  selector: 'app-root',
  // Asegúrate de que tus componentes están aquí
  imports: [RouterOutlet, HeaderComponent, WelcomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('bolsa_trabajo');
}
