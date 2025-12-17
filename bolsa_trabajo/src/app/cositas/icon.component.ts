// src/app/cositas/icon.component.ts
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class IconComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() nombre: string = '';

  svgContent: SafeHtml = '';
  private diagnosticoDone = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Solo ejecutar diagnóstico una vez
    if (!this.diagnosticoDone) {
      console.log('🔍 DIAGNÓSTICO DE ICONOS:');

      const iconosNecesarios = [
        'Search',
        'Building',
        'Briefcase',
        'AcademicCap',
        'Code',
        'PaintBrush',
        'TrendUp',
        'Scale',
        'HardHat',
        'Heart',
      ];

      iconosNecesarios.forEach((icono) => {
        const existe = ICON_MAP[icono];
        if (existe) {
          console.log(`✅ ${icono}: OK (${existe.substring(0, 50)}...)`);
        } else {
          console.error(`❌ ${icono}: NO ENCONTRADO`);
        }
      });

      this.diagnosticoDone = true;
    }

    // Cargar el icono inicial
    this.loadIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cuando cambian los inputs, recargar el icono
    if (changes['name'] || changes['nombre']) {
      this.loadIcon();
    }
  }

  private loadIcon() {
    // Usamos 'name' preferentemente, si no 'nombre'
    let key = this.name || this.nombre || '';

    // Si el nombre viene en minúscula (ej: 'check'), lo convertimos a PascalCase (ej: 'Check')
    if (key && key.length > 0 && key[0] === key[0].toLowerCase()) {
      key = key.charAt(0).toUpperCase() + key.slice(1);
    }

    const svgString = ICON_MAP[key] || '';

    if (!svgString && key) {
      console.warn(`⚠️ Icono no encontrado en ICON_MAP: "${key}"`);
      console.log('📋 Iconos disponibles:', Object.keys(ICON_MAP));
    }

    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
