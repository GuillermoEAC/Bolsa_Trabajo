// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // 👈 1. Esto ya lo tenías bien
import { HeaderComponent } from '../app/pages/header/header';
// import { WelcomeComponent } ... 👈 BORRAR: Ya no se usa aquí directamente
import { Login } from '../app/cositas/login/login';

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate de tener esto (aunque por defecto en v17+ lo es)
  // 👇 2. CORRECCIÓN AQUÍ:
  imports: [
    RouterOutlet, // <--- AGREGAR ESTO (Crucial para que funcione el router)
    HeaderComponent,
    Login,
    // WelcomeComponent <--- BORRAR ESTO (Para quitar el warning amarillo)
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('bolsa_trabajo');
  protected loginModalVisible = signal(false);

  protected closeModal() {
    this.loginModalVisible.set(false);
  }

  protected openModal() {
    this.loginModalVisible.set(true);
  }
}
