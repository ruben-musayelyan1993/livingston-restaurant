import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { ReservationModalService } from '../../core/reservation-modal.service';

interface Programme { time: string; title: string; desc: string; }

@Component({
  selector: 'app-atmosphere',
  standalone: true,
  imports: [TranslatePipe, ScrollRevealDirective],
  templateUrl: './atmosphere.component.html',
  styleUrl: './atmosphere.component.css',
})
export class AtmosphereComponent {
  private readonly modalSvc = inject(ReservationModalService);

  readonly programmes: Programme[] = [
    { time: 'atmosphere.jazz_time',  title: 'atmosphere.jazz_title',  desc: 'atmosphere.jazz_desc'  },
    { time: 'atmosphere.dj_time',    title: 'atmosphere.dj_title',    desc: 'atmosphere.dj_desc'    },
    { time: 'atmosphere.prog3_time', title: 'atmosphere.prog3_title', desc: 'atmosphere.prog3_desc' },
    { time: 'atmosphere.prog4_time', title: 'atmosphere.prog4_title', desc: 'atmosphere.prog4_desc' },
    { time: 'atmosphere.prog5_time', title: 'atmosphere.prog5_title', desc: 'atmosphere.prog5_desc' },
  ];

  openReservation(): void {
    this.modalSvc.open();
  }
}
