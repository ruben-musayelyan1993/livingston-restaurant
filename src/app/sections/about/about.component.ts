import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

const SLIDE_DURATION = 5000;

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslatePipe, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly slides = [
    '/assets/images/about-slide1.jpg',
    '/assets/images/about-slide2.jpg',
    '/assets/images/about-slide3.jpg',
    '/assets/images/about-slide4.jpg',
  ];

  readonly current = signal(0);

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  goTo(index: number): void {
    this.current.set(index);
    clearInterval(this.timer);
    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.timer = setInterval(() => {
      this.current.update(i => (i + 1) % this.slides.length);
    }, SLIDE_DURATION);
  }
}
