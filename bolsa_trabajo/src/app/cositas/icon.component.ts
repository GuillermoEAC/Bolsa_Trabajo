// src/app/cositas/icon.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_MAP } from '../icons'; // Importamos el archivo que acabamos de mover

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [innerHTML]="svgContent"
      style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"
    ></div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        width: 24px;
        height: 24px;
      }
    `,
  ],
})
export class IconComponent implements OnChanges {
  @Input() name: string = ''; // El nombre del icono (ej: 'Search')
  svgContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    // Busca el SVG en tu mapa. Si no existe, no muestra nada.
    const svgString = ICON_MAP[this.name] || '';
    // Le dice a Angular: "Confía en este HTML, es un SVG seguro"
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
