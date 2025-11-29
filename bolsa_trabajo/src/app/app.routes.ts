// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome').then((m) => m.WelcomeComponent),
  },
  {
    path: 'registro-empresa',
    loadComponent: () =>
      import('./pages/company-register/company-register').then((m) => m.CompanyRegisterComponent),
    // ./pages/company-register/company-register.component
  },
  {
    path: 'dashboard-empresa',
    loadComponent: () =>
      import('./pages/dashboard-empresa/dashboard-empresa').then(
        (m) => m.DashboardEmpresaComponent
      ), // 👈 ASEGÚRATE QUE DIGA "Component" AL FINAL
  },
  {
    path: 'mis-vacantes',
    loadComponent: () =>
      import('./pages/mis-vacantes/mis-vacantes').then((m) => m.MisVacantesComponent),
  },
  {
    path: 'publicar-vacante',
    loadComponent: () =>
      import('./pages/publicar-vacante/publicar-vacante').then((m) => m.PublicarVacanteComponent),
  },
  {
    // Ruta con parámetro :id para editar
    path: 'publicar-vacante/:id',
    loadComponent: () =>
      import('./pages/publicar-vacante/publicar-vacante').then((m) => m.PublicarVacanteComponent),
  },
  {
    path: 'cv-builder',
    // Asegúrate que 'm.CvBuilderComponent' coincida con el 'export class' de tu archivo cv-builder.ts
    loadComponent: () => import('./pages/cv-builder/cv-builder').then((m) => m.CvBuilderComponent),
  },
  {
    path: 'empleos',
    loadComponent: () =>
      import('./pages/buscador-empleos/buscador-empleos').then((m) => m.BuscadorEmpleosComponent),
  },
  {
    path: 'publicar-vacante',
    loadComponent: () =>
      import('./pages/publicar-vacante/publicar-vacante').then((m) => m.PublicarVacanteComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./cositas/login/login').then((m) => m.Login),
  },
  // La ruta comodín siempre va AL FINAL
  {
    path: '**',
    redirectTo: '/welcome',
  },
];
