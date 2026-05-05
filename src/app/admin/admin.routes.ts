import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const adminRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
