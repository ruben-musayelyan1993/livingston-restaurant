import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'ru' | 'en' | 'hy';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'liv-lang';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);

  readonly current = signal<Lang>('hy');

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem(this.storageKey) as Lang | null;
    const browserLang = navigator.language.toLowerCase();
    const browser: Lang = browserLang.startsWith('en') ? 'en'
                        : browserLang.startsWith('ru') ? 'ru'
                        : 'hy';
    this.set(saved ?? browser);
  }

  set(lang: Lang): void {
    this.translate.use(lang);
    this.current.set(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, lang);
      document.documentElement.lang = lang;
    }
  }
}
