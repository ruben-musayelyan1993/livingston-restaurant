import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  { path: '**', redirectTo: '' },
];
