import {
  Component, inject, signal, HostListener, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule,
  ValidatorFn, Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ReservationModalService } from '../../core/reservation-modal.service';
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
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './reservation-modal.component.html',
  styleUrl: './reservation-modal.component.css',
})
export class ReservationModalComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly svc = inject(ReservationModalService);
  private readonly resSvc = inject(ReservationService);
  private readonly fb = inject(FormBuilder);

  readonly status = signal<FormStatus>('idle');

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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (isPlatformBrowser(this.platformId)) this.close();
  }

  close(): void {
    this.svc.close();
    this.status.set('idle');
    this.form.reset({ guests: 2 });
  }

  submit(): void {
    if (this.form.invalid || this.form.value._hp) return;
    this.status.set('loading');
    const { _hp, ...payload } = this.form.value;
    this.resSvc.submit(payload as ReservationPayload).subscribe({
      next: () => {
        this.status.set('success');
        this.form.reset({ guests: 2 });
      },
      error: () => this.status.set('error'),
    });
  }
}
