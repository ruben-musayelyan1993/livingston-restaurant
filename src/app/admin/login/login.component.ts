import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class AdminLoginComponent {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  password = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    if (!this.password.trim()) return;
    this.loading.set(true);
    this.error.set('');
    this.api.login(this.password).subscribe({
      next: () => this.router.navigateByUrl('/admin/dashboard'),
      error: (err) => {
        this.error.set(err.error?.error ?? 'Ошибка входа');
        this.loading.set(false);
      },
    });
  }
}
