import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { PrivateEventModalService } from '../../core/private-event-modal.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [TranslatePipe, ScrollRevealDirective],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  readonly eventTypes = ['corporate', 'wedding', 'birthday', 'reception'];
  private readonly modal = inject(PrivateEventModalService);

  openModal(): void { this.modal.open(); }
}
