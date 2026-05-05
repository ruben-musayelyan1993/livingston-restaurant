import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ReservationModalService } from '../../core/reservation-modal.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  private readonly modal = inject(ReservationModalService);

  openReservation(): void {
    this.modal.open();
  }
}
