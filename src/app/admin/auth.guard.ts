import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AdminApiService } from './admin-api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(AdminApiService);
  const router = inject(Router);
  if (api.isLoggedIn()) return true;
  return router.createUrlTree(['/admin/login']);
};
