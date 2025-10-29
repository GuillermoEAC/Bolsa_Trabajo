// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../app/pages/header/header';
import { WelcomeComponent } from '../app/pages/welcome/welcome';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, WelcomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('bolsa_trabajo');
}
