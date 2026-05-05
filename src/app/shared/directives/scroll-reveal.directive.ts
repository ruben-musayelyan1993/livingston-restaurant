import {
  Directive, ElementRef, Input, OnDestroy, OnInit,
  PLATFORM_ID, Renderer2, inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[scrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() delay = 0;

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private observer!: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el: HTMLElement = this.el.nativeElement;
    this.renderer.setStyle(el, 'opacity', '0');
    this.renderer.setStyle(el, 'transform', 'translateY(24px)');
    this.renderer.setStyle(
      el, 'transition',
      `opacity 0.7s ease-out ${this.delay}ms, transform 0.7s ease-out ${this.delay}ms`,
    );

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.renderer.setStyle(el, 'opacity', '1');
          this.renderer.setStyle(el, 'transform', 'translateY(0)');
          this.observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
