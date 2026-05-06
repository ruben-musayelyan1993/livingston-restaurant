import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { HeroComponent } from '../sections/hero/hero.component';
import { AboutComponent } from '../sections/about/about.component';
import { CuisineComponent } from '../sections/cuisine/cuisine.component';
import { AtmosphereComponent } from '../sections/atmosphere/atmosphere.component';
import { EventsComponent } from '../sections/events/events.component';
import { ContactsComponent } from '../sections/contacts/contacts.component';
import { ReservationModalComponent } from '../shared/reservation-modal/reservation-modal.component';
import { PrivateEventModalComponent } from '../shared/private-event-modal/private-event-modal.component';
import { LanguageService } from '../core/language.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    AboutComponent,
    CuisineComponent,
    AtmosphereComponent,
    EventsComponent,
    ContactsComponent,
    ReservationModalComponent,
    PrivateEventModalComponent,
  ],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  private readonly langSvc = inject(LanguageService);

  ngOnInit(): void {
    this.langSvc.init();
  }
}
