import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_MAP } from '../assets/icons/icons';

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
  // Aceptamos ambos inputs para evitar errores
  @Input() name: string = '';
  @Input() nombre: string = '';

  svgContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    // Usamos 'name' preferentemente, si no 'nombre'
    let key = this.name || this.nombre || '';

    // Si el nombre viene en minúscula (ej: 'check'), lo convertimos a PascalCase (ej: 'Check')
    if (key && key.length > 0 && key[0] === key[0].toLowerCase()) {
      key = key.charAt(0).toUpperCase() + key.slice(1);
    }

    const svgString = ICON_MAP[key] || '';

    if (!svgString && key) {
      console.warn(`⚠️ Icono no encontrado en ICON_MAP: ${key}`);
    }

    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
