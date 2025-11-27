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
      import('./pages/dashboard-empresa/dashboard-empresa').then((m) => m.DashboardEmpresa),
  },
  {
    path: 'cv-builder',
    // Asegúrate que 'm.CvBuilderComponent' coincida con el 'export class' de tu archivo cv-builder.ts
    loadComponent: () => import('./pages/cv-builder/cv-builder').then((m) => m.CvBuilderComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./cositas/login/login').then((m) => m.Login),
  },
  //   {
  //     path: 'registro',
  //     loadComponent: () => import('./cositas/registro/registro').then((m) => m.RegistroComponent),
  //   },
  // La ruta comodín siempre va AL FINAL
  {
    path: '**',
    redirectTo: '/welcome',
  },
];
