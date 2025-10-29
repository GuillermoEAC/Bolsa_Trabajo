import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// RUTA CORREGIDA: Importa desde './icon' (el archivo icon.ts en la misma carpeta core/)
import { ICON_MAP } from './icon';

@Injectable({
  providedIn: 'root', // Servicio Singleton, disponible en toda la aplicación
})
export class IconService {
  // Almacena el mapa de iconos internamente para búsquedas rápidas
  private iconMap: { [key: string]: string } = ICON_MAP;

  // Inyectamos DomSanitizer para marcar el HTML como seguro
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Obtiene un icono SVG por su nombre y lo marca como HTML seguro para inyección.
   * @param iconName El nombre clave del icono (ej: 'Briefcase', 'TrendUp').
   * @returns El SVG como SafeHtml o un string vacío si no se encuentra.
   */
  public getIcon(iconName: string): SafeHtml {
    const svgString = this.iconMap[iconName];

    if (!svgString) {
      console.warn(`Icono no encontrado: ${iconName}. Revisa el archivo icon.ts.`);
      return '';
    }

    // Marca el SVG como contenido HTML seguro.
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
