// src/app/header/header.ts (asumiendo que renombras el archivo o el contenido)
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true, // Asegura que es un componente Standalone
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  // Renombra a HeaderComponent para seguir convenciones
  // ... no necesita lógica por ahora ...
}
