// import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
// import { provideServerRendering, withRoutes } from '@angular/ssr';
// import { appConfig } from './app.config';
// import { serverRoutes } from './app.routes.server';

// const serverConfig: ApplicationConfig = {
//   providers: [provideServerRendering(withRoutes(serverRoutes))],
// };

// export const config = mergeApplicationConfig(appConfig, serverConfig);

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'publicar-vacante/:id',
    renderMode: RenderMode.Client, // No pre-renderizar
  },
  {
    path: 'ver-candidatos/:id',
    renderMode: RenderMode.Client, // No pre-renderizar
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender, // Pre-renderizar el resto
  },
];
