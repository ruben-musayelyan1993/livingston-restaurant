import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

interface Dish {
  key: string;
  image: string;
}

@Component({
  selector: 'app-cuisine',
  standalone: true,
  imports: [TranslatePipe, ScrollRevealDirective],
  templateUrl: './cuisine.component.html',
  styleUrl: './cuisine.component.css',
})
export class CuisineComponent {
  readonly dishes: Dish[] = [
    { key: 'carpaccio', image: '/assets/images/dish-carpaccio.jpg' },
    { key: 'lamb',      image: '/assets/images/dish-lamb.jpg' },
    { key: 'chicken',   image: '/assets/images/dish-chicken.jpg' },
    { key: 'trout',     image: '/assets/images/dish-trout.jpg' },
    { key: 'octopus',   image: '/assets/images/dish-octopus.jpg' },
    { key: 'turkey',    image: '/assets/images/dish-turkey.jpg' },
  ];
}
