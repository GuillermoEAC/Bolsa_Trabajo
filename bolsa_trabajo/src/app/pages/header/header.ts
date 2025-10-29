// src/app/header/header.ts (asumiendo que renombras el archivo o el contenido)
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  logoPaht: string = 'Logo_Completo.png';
}
