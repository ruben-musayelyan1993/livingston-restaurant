import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-atmosphere',
  standalone: true,
  imports: [TranslatePipe, ScrollRevealDirective],
  templateUrl: './atmosphere.component.html',
  styleUrl: './atmosphere.component.css',
})
export class AtmosphereComponent {}
