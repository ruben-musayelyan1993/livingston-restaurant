import {
  Component, inject, signal, HostListener, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule,
  ValidatorFn, Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivateEventModalService } from '../../core/private-event-modal.service';
import { PrivateEventService, PrivateEventPayload } from '../../core/private-event.service';

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
  selector: 'app-private-event-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './private-event-modal.component.html',
  styleUrl: './private-event-modal.component.css',
})
export class PrivateEventModalComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly svc = inject(PrivateEventModalService);
  private readonly eventSvc = inject(PrivateEventService);
  private readonly fb = inject(FormBuilder);

  readonly status = signal<FormStatus>('idle');

  readonly eventTypes = ['wedding', 'birthday', 'corporate', 'other'] as const;

  readonly form = this.fb.group({
    name:      ['', [Validators.required, Validators.minLength(2)]],
    company:   [''],
    eventType: ['', Validators.required],
    guests:    [null as number | null, [Validators.required, Validators.min(1)]],
    date:      ['', [Validators.required, minTodayValidator()]],
    comment:   ['', Validators.maxLength(500)],
    _hp:       [''],
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
    this.form.reset();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.value._hp) return;
    this.status.set('loading');
    const { _hp, ...raw } = this.form.value;
    this.eventSvc.submit(raw as PrivateEventPayload).subscribe({
      next: () => {
        this.status.set('success');
        this.form.reset();
      },
      error: () => this.status.set('error'),
    });
  }
}
