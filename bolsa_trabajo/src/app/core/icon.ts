// Este archivo define el mapa centralizado de íconos SVG.
// La constante ICON_MAP es exportada para ser utilizada por icon.spes.ts.

interface IconMap {
  [key: string]: string;
}

export const ICON_MAP: IconMap = {
  // Ícono de Herramientas/Desarrollo (Tools)
  Tools: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5V3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v.75m0 0H9.375C9.056 4.5 8.75 4.757 8.75 5.093v1.854M10.5 6.75V15h2.25V6.75m-2.25 0h-4.5c-.828 0-1.5.672-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h4.5m-4.5-4.5H5.25M18.75 9h-2.25m2.25 0V7.5M17.25 9H12.75m4.5 0v2.25m-2.25 0h-4.5c-.828 0-1.5.672-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h4.5m-4.5-4.5h.75m1.5 0h.75m-3 0V15h2.25v-2.25m-2.25 0h-4.5" />
    </svg>
  `,
  // Ícono de Diseño/Creatividad (Lightbulb)
  Lightbulb: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.5a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
  `,
  // Ícono de Análisis/Tendencia (TrendUp)
  TrendUp: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.305a1.125 1.125 0 0 0 1.995 0l3.05-3.05 3.05 3.05a1.125 1.125 0 0 0 1.995 0L21.75 7.5M10.5 4.5h5.25a.75.75 0 0 1 .75.75v5.25m-6 3h.008v.008H10.5z" />
    </svg>
  `,
  // Ícono de Personas/RH (Users)
  Users: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.5L12 16.5L9 19.5M3 13.5h18a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5zM12 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM18 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  `,
  // Ícono de Desarrollo/Trabajo (Briefcase)
  Briefcase: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.25v4.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-4.5m15 0a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25m15 0h-3.515m-1.059 0h-.984m-4.214 0l-3.515 0m5.275 0h-2.126a1.5 1.5 0 0 1-1.464-1.185L9.366 4.478A1.5 1.5 0 0 0 7.902 3H3.75a.75.75 0 0 0-.75.75v.75m4.5 4.5h.75m1.5 0h.75m-3 0V4.5m4.5 4.5V4.5m-6.75 6.75h9" />
    </svg>
  `,
};
