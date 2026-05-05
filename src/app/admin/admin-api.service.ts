import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';

export interface ImageItem { name: string; url: string; }

const SESSION_KEY = 'admin_auth';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  login(password: string) {
    return this.http.post('/admin/api/login', { password }, { withCredentials: true }).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem(SESSION_KEY, '1');
        }
      }),
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(SESSION_KEY);
    }
    this.http.post('/admin/api/logout', {}, { withCredentials: true }).subscribe();
  }

  handleUnauthorized(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  getTranslations() {
    return this.http.get<Record<string, Record<string, unknown>>>(
      '/admin/api/translations', { withCredentials: true },
    );
  }

  saveTranslations(data: Record<string, unknown>) {
    return this.http.put('/admin/api/translations', data, { withCredentials: true });
  }

  getImages() {
    return this.http.get<ImageItem[]>('/admin/api/images', { withCredentials: true });
  }

  uploadImage(name: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`/admin/api/images/${name}`, fd, { withCredentials: true });
  }
}
