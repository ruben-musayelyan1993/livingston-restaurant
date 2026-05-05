import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule,
  ValidatorFn, Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { ReservationService, ReservationPayload } from '../../core/reservation.service';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

function minTodayValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(control.value) >= today ? null : { pastDate: true };
  };
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ScrollRevealDirective],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
})
export class ReservationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ReservationService);

  readonly status = signal<FormStatus>('idle');
  readonly showModal = signal(false);

  readonly form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phone:   ['', [Validators.required, Validators.minLength(7)]],
    date:    ['', [Validators.required, minTodayValidator()]],
    guests:  [2],
    comment: ['', Validators.maxLength(300)],
    _hp:     [''],
  });

  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  fieldError(name: string, error: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid || this.form.value._hp) return;
    this.status.set('loading');

    const { _hp, ...payload } = this.form.value;
    this.svc.submit(payload as ReservationPayload).subscribe({
      next: () => {
        this.status.set('success');
        this.showModal.set(true);
        this.form.reset({ guests: 2 });
      },
      error: () => this.status.set('error'),
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.status.set('idle');
  }
}
