import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [TranslatePipe, ScrollRevealDirective],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  readonly eventTypes = ['corporate', 'wedding', 'birthday', 'reception'];

  scrollToReservation(): void {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  }
}
