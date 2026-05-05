# Implementation Plan — Livingston Restaurant Landing Page

**Стек:** Angular 21 · Standalone Components · Signals · CSS (Custom Properties + BEM) · ngx-translate  
**SSR:** не подключён сейчас, подключается на последнем этапе без рефакторинга  
**Целевой документ:** для разработчика

---

## Шаг 1. Установка зависимостей и базовая конфигурация

### 1.1 CSS Custom Properties — дизайн-токены

Никаких дополнительных пакетов. Все токены дизайна объявляются в `src/styles.css` в `:root`:

```css
:root {
  /* Цвета */
  --color-noir:       #0A0A0A;
  --color-charcoal:   #141414;
  --color-deep-gray:  #1E1E1E;
  --color-gold:       #C9A96E;
  --color-gold-light: #E8D5A3;
  --color-ivory:      #F5F0E8;
  --color-burgundy:   #4A1020;
  --color-slate:      #2C2C2C;

  /* Типографика */
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body:    "Montserrat", system-ui, sans-serif;

  /* Отступы секций */
  --section-py: 120px;

  /* Макс. ширина контента */
  --content-width: 1280px;
}

@media (max-width: 1024px) {
  :root { --section-py: 72px; }
}

@media (max-width: 768px) {
  :root { --section-py: 56px; }
}
```

Токены используются во всех компонентах через `var(--color-gold)` и т.д. Каждый компонент получает собственный CSS-файл (Angular по умолчанию изолирует стили через ViewEncapsulation).

### 1.2 Google Fonts

В `src/index.html` в `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@200;300;400;500&display=swap" rel="stylesheet">
```

### 1.3 ngx-translate

```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

Создать директорию с переводами:

```
public/
  i18n/
    ru.json
    en.json
```

Структура JSON-файла (`ru.json`):

```json
{
  "nav": {
    "about": "О ресторане",
    "cuisine": "Кухня",
    "atmosphere": "Атмосфера",
    "reservation": "Бронирование"
  },
  "hero": {
    "tagline": "Европейская высокая кухня · Ереван",
    "cta": "Забронировать стол"
  },
  "reservation": {
    "title": "Забронировать стол",
    "subtitle": "Оставьте заявку — наш менеджер свяжется с вами для подтверждения",
    "fields": {
      "name": "Имя",
      "email": "Email",
      "phone": "Телефон",
      "date": "Дата",
      "guests": "Гостей",
      "comment": "Комментарий"
    },
    "submit": "Отправить",
    "submitting": "Отправляем...",
    "success": {
      "title": "Спасибо!",
      "message": "Ваш запрос принят. Наш менеджер свяжется с вами в ближайшее время для подтверждения."
    },
    "error": "Ошибка отправки. Позвоните нам: +374 10 39 20 20"
  }
}
```

`en.json` — аналогично на английском.

### 1.4 Провайдер i18n в app.config.ts

```ts
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'ru',
    }),
  ],
};
```

### 1.5 Форматтер и линтер (опционально, уже есть prettier)

Добавить `.prettierrc` если ещё нет, убедиться что VSCode его использует.

---

## Шаг 2. Сервис языка

Создать `src/app/core/language.service.ts`:

```ts
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'liv-lang';
  readonly current = signal<'ru' | 'en'>('ru');

  constructor(private translate: TranslateService) {}

  init() {
    const saved = localStorage.getItem(this.storageKey) as 'ru' | 'en' | null;
    const browser = navigator.language.startsWith('en') ? 'en' : 'ru';
    const lang = saved ?? browser;
    this.set(lang);
  }

  set(lang: 'ru' | 'en') {
    this.translate.use(lang);
    this.current.set(lang);
    localStorage.setItem(this.storageKey, lang);
    document.documentElement.lang = lang;
  }
}
```

Вызвать `languageService.init()` в `AppComponent.ngOnInit()`.

**Почему не Angular built-in i18n:** встроенный механизм компилирует отдельный бандл на каждый язык и требует разных URL (`/ru/`, `/en/`). Это усложняет роутинг и деплой для лендинга. При подключении SSR позже `ngx-translate` также прекрасно работает — на сервере язык определяется из заголовка `Accept-Language`.

---

## Шаг 3. Роутинг и структура компонентов

### 3.1 Маршруты

Лендинг — одна страница, все секции на одном маршруте. `app.routes.ts`:

```ts
export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: '**', redirectTo: '' },
];
```

### 3.2 Структура файлов

```
src/app/
├── core/
│   ├── language.service.ts
│   ├── reservation.service.ts
│   └── scroll.service.ts
├── shared/
│   ├── section-header/
│   │   ├── section-header.component.ts
│   │   └── section-header.component.html
│   └── directives/
│       └── scroll-reveal.directive.ts
├── layout/
│   ├── header/
│   │   ├── header.component.ts
│   │   └── header.component.html
│   └── footer/
│       ├── footer.component.ts
│       └── footer.component.html
├── sections/
│   ├── hero/
│   ├── about/
│   ├── cuisine/
│   ├── atmosphere/
│   ├── events/
│   ├── reservation/
│   │   ├── reservation.component.ts
│   │   ├── reservation.component.html
│   │   └── success-modal/
│   └── contacts/
├── landing-page/
│   ├── landing-page.component.ts
│   └── landing-page.component.html
└── app.ts
```

### 3.3 LandingPageComponent

Корневой компонент страницы. В шаблоне — последовательный список секций:

```html
<app-header />
<main>
  <app-hero />
  <app-about />
  <app-cuisine />
  <app-atmosphere />
  <app-events />
  <app-reservation id="reservation" />
  <app-contacts />
</main>
<app-footer />
```

Все дочерние компоненты — standalone, импортируются напрямую в `imports: []` LandingPageComponent.

---

## Шаг 4. Директива scroll-reveal

Директива вешается на любой элемент и делает его невидимым до момента появления во viewport.

```ts
// src/app/shared/directives/scroll-reveal.directive.ts
@Directive({
  selector: '[scrollReveal]',
  standalone: true,
  host: { '[class]': '"will-change-transform"' }
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() delay = 0;
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const el = this.el.nativeElement;
    this.renderer.setStyle(el, 'opacity', '0');
    this.renderer.setStyle(el, 'transform', 'translateY(24px)');
    this.renderer.setStyle(el, 'transition',
      `opacity 0.7s ease-out ${this.delay}ms, transform 0.7s ease-out ${this.delay}ms`);

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.renderer.setStyle(el, 'opacity', '1');
        this.renderer.setStyle(el, 'transform', 'translateY(0)');
        this.observer.disconnect();
      }
    }, { threshold: 0.15 });

    this.observer.observe(el);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
```

**Важно для SSR:** IntersectionObserver есть только в браузере. Обернуть в проверку:

```ts
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private platformId = inject(PLATFORM_ID);

ngOnInit() {
  if (!isPlatformBrowser(this.platformId)) return;
  // ... остальная логика
}
```

Эта заготовка под SSR позволит подключить его позже без правок директивы.

---

## Шаг 5. Header

### 5.1 Поведение при скролле

```ts
@Component({ selector: 'app-header', standalone: true, ... })
export class HeaderComponent {
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 80);
  }
}
```

Шаблон с conditional классом:

```html
<header [class.scrolled]="scrolled()">
  <nav>
    <a href="#about" (click)="closeMenu()">{{ 'nav.about' | translate }}</a>
    <!-- ... -->
  </nav>
  <app-language-switcher />
  <button class="reserve-btn" (click)="scrollTo('reservation')">
    {{ 'hero.cta' | translate }}
  </button>
</header>
```

В `header.component.css`:

```css
header { transition: background 0.3s ease, backdrop-filter 0.3s ease; }
header.scrolled { background: rgba(10,10,10,0.92); backdrop-filter: blur(12px); }
```

### 5.2 LanguageSwitcherComponent

```ts
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="switcher">
      <button [class.active]="lang() === 'ru'" (click)="set('ru')">RU</button>
      <span>/</span>
      <button [class.active]="lang() === 'en'" (click)="set('en')">EN</button>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private langSvc = inject(LanguageService);
  lang = this.langSvc.current;
  set = (l: 'ru' | 'en') => this.langSvc.set(l);
}
```

### 5.3 Мобильное меню (Drawer)

Отдельный `MobileDrawerComponent`, управляемый сигналом `menuOpen` из Header. При открытии — `overflow: hidden` на `<body>` (через `Renderer2.setStyle`).

---

## Шаг 6. Hero-секция

```ts
@Component({ selector: 'app-hero', standalone: true, ... })
export class HeroComponent {}
```

Шаблон — статичная разметка с параллакс-фоном:

```html
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <img src="/assets/logo.svg" alt="Livingston" class="hero-logo" />
    <div class="divider-gold"></div>
    <h1 class="hero-title">LIVINGSTON</h1>
    <p class="hero-tagline">{{ 'hero.tagline' | translate }}</p>
    <a href="#reservation" class="btn-outline">{{ 'hero.cta' | translate }}</a>
  </div>
  <div class="scroll-indicator">↓</div>
</section>
```

Параллакс на desktop через CSS `background-attachment: fixed`. На мобиле отключается через media query (избегаем проблем с iOS Safari).

**Анимация появления:** CSS `@keyframes` с `animation-delay` на каждом элементе — проще и производительнее Framer Motion аналогов в Angular.

---

## Шаг 7. About, Cuisine, Atmosphere, Events

Каждая секция — отдельный standalone-компонент. Общий паттерн:

1. В шаблоне используется `scrollReveal` директива на блоках:
   ```html
   <div scrollReveal [delay]="0">...</div>
   <div scrollReveal [delay]="150">...</div>
   ```
2. Тексты через `translate` pipe: `{{ 'about.title' | translate }}`
3. Изображения — в `public/assets/images/`, подключаются через `<img src="/assets/images/dish-1.jpg">`

**CuisineSection** дополнительно:
- Массив блюд в компоненте как `readonly dishes` (данные можно вынести в JSON-файл в `assets` и загрузить через `HttpClient`)
- `@for (dish of dishes; track dish.id)` для рендера карточек

**AtmosphereSection** дополнительно:
- Timeline с временными метками (статичный HTML)
- Параллакс-фон — аналогично Hero

---

## Шаг 8. Форма бронирования

### 8.1 ReservationService

```ts
// src/app/core/reservation.service.ts
@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);

  submit(data: ReservationPayload): Observable<void> {
    return this.http.post<void>('/api/reservation', data);
  }
}
```

На период разработки — mock-реализация с `delay(1500)` и `of(undefined)`.

### 8.2 ReservationComponent

```ts
@Component({ selector: 'app-reservation', standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe] })
export class ReservationComponent {
  private fb = inject(FormBuilder);
  private svc = inject(ReservationService);

  readonly status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  readonly showModal = signal(false);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phone:   ['', [Validators.required, Validators.minLength(7)]],
    date:    ['', [Validators.required, this.minDateValidator()]],
    guests:  [2],
    comment: ['', Validators.maxLength(300)],
    _hp:     [''],   // honeypot — скрытое поле, боты заполняют его
  });

  private minDateValidator(): ValidatorFn {
    return (control) => {
      const val = control.value as string;
      if (!val) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(val) >= today ? null : { pastDate: true };
    };
  }

  submit() {
    if (this.form.invalid || this.form.value._hp) return;
    this.status.set('loading');

    this.svc.submit(this.form.value as ReservationPayload).subscribe({
      next: () => {
        this.status.set('success');
        this.showModal.set(true);
        this.form.reset({ guests: 2 });
      },
      error: () => this.status.set('error'),
    });
  }
}
```

### 8.3 Шаблон формы

Поля отрендерить попарно в grid-сетке. Пример одного поля:

```html
<div class="field-group">
  <label for="name">{{ 'reservation.fields.name' | translate }}</label>
  <input id="name" type="text" formControlName="name"
         [placeholder]="'reservation.fields.name' | translate" />
  @if (form.get('name')?.invalid && form.get('name')?.touched) {
    <span class="error">{{ 'validation.required' | translate }}</span>
  }
</div>
```

Honeypot-поле — скрыто через CSS (`position: absolute; left: -9999px; opacity: 0`), не через `display: none` (боты умеют это обходить).

### 8.4 SuccessModalComponent

```ts
@Component({
  selector: 'app-success-modal',
  standalone: true,
  host: { '[class.visible]': 'show()' }
})
export class SuccessModalComponent {
  @Input({ required: true }) show = input.required<boolean>();
  @Output() close = new EventEmitter<void>();
}
```

Шаблон:

```html
<div class="modal-overlay" (click)="close.emit()">
  <div class="modal-card" (click)="$event.stopPropagation()">
    <button class="modal-close" (click)="close.emit()">×</button>
    <div class="modal-icon">✓</div>
    <h2>{{ 'reservation.success.title' | translate }}</h2>
    <p>{{ 'reservation.success.message' | translate }}</p>
  </div>
</div>
```

Анимация через CSS:

```css
.modal-overlay {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.modal-overlay.visible {
  opacity: 1;
  pointer-events: all;
}
.modal-card {
  transform: scale(0.92);
  transition: transform 0.3s ease;
}
.modal-overlay.visible .modal-card {
  transform: scale(1);
}
```

---

## Шаг 9. Contacts и Footer

**ContactsComponent:** статичный HTML с адресом, телефонами, часами работы, dress code.  
Google Maps embed — через `<iframe>` с реальным embed URL.  

**FooterComponent:** логотип, якорные ссылки, `LanguageSwitcherComponent`, copyright.

---

## Шаг 10. Глобальные стили

В `src/styles.css` после блока `:root` с токенами:

```css
* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background: var(--color-noir);
  color: var(--color-ivory);
  font-family: var(--font-body);
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
}

/* Film grain texture */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('/assets/noise.png');  /* 200×200 PNG, 4% opacity */
  opacity: 0.04;
  pointer-events: none;
  z-index: 9999;
}

/* Underline input style */
.input-underline {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(201, 169, 110, 0.3);
  color: var(--color-ivory);
  padding: 8px 0;
  width: 100%;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.input-underline:focus {
  outline: none;
  border-bottom-color: var(--color-gold);
  box-shadow: 0 1px 0 0 var(--color-gold);
}

/* Gold divider */
.divider-gold {
  width: 60px;
  height: 1px;
  background: var(--color-gold);
  opacity: 0.5;
  margin: 0 auto;
}
```

---

## Шаг 11. Meta-теги и SEO (до SSR)

В `LandingPageComponent.ngOnInit()` через Angular `Title` и `Meta` сервисы:

```ts
import { Title, Meta } from '@angular/platform-browser';

constructor(private title: Title, private meta: Meta) {}

ngOnInit() {
  this.title.setTitle('Livingston — European Haute Cuisine, Yerevan');
  this.meta.addTags([
    { name: 'description', content: 'Ресторан высокой европейской кухни на 9-м этаже с панорамой Еревана.' },
    { property: 'og:title', content: 'Livingston Restaurant Yerevan' },
    { property: 'og:type', content: 'restaurant' },
    { property: 'og:image', content: '/assets/og-image.jpg' },
  ]);
}
```

Добавить базовые meta в `src/index.html` (для случая, когда JS не загружен).

---

## Шаг 12. Подключение SSR (отдельный этап, без рефакторинга)

Все предыдущие шаги написаны так, чтобы SSR подключался одной командой:

```bash
ng add @angular/ssr
```

CLI добавит:
- `src/main.server.ts` — серверный bootstrap
- `server.ts` — Express-сервер
- Обновит `angular.json`: добавит `server` и `prerender` конфигурации

**Что нужно проверить после подключения SSR:**

| Проверка | Где смотреть |
|---|---|
| `isPlatformBrowser` в `ScrollRevealDirective` | Шаг 4 — уже добавлено |
| `isPlatformBrowser` в `LanguageService.init()` (localStorage) | Добавить guard перед `localStorage.getItem` |
| `isPlatformBrowser` в `HeaderComponent` (`window.scrollY`) | Добавить guard в `@HostListener` |
| Google Maps iframe | Рендерится без проблем |
| `TransferState` для данных меню (если грузим через HTTP) | Добавить `withStateTransfer()` в провайдер |

**Язык на сервере:**  
В `server.ts` добавить middleware, который читает `Accept-Language` и кладёт язык в `REQUEST` injection token — `ngx-translate` на сервере возьмёт его из провайдера (нужно настроить `SERVER_REQUEST` провайдер для `HttpLoader`).

**Prerender (статические страницы):**  
Для лендинга из одного маршрута достаточно prerender в `/` — Angular сгенерирует `index.html` с полным HTML на этапе сборки. Это даёт максимальный Lighthouse-score без работающего Node-сервера.

```json
// angular.json — в секции build
"prerender": {
  "routesFile": "prerender-routes.txt"
}
```

`prerender-routes.txt`:
```
/
```

---

## Последовательность реализации

| # | Задача | Зависит от |
|---|---|---|
| 1 | CSS-токены в styles.css, шрифты в index.html | — |
| 2 | Установка ngx-translate, создание ru.json / en.json | — |
| 3 | LanguageService + провайдер в app.config | 2 |
| 4 | ScrollRevealDirective | — |
| 5 | Структура компонентов (папки, пустые файлы) | — |
| 6 | LandingPageComponent (скелет) + Router | 5 |
| 7 | Header + LanguageSwitcher + мобильный Drawer | 3, 6 |
| 8 | HeroSection | 1, 3, 7 |
| 9 | AboutSection | 1, 3, 4 |
| 10 | CuisineSection (сетка карточек) | 1, 3, 4 |
| 11 | AtmosphereSection | 1, 3, 4 |
| 12 | EventsSection | 1, 3, 4 |
| 13 | ReservationService (mock) | — |
| 14 | ReservationForm + SuccessModal | 3, 13 |
| 15 | ContactsSection + Footer | 1, 3 |
| 16 | Глобальные стили (film grain, утилиты) | 1 |
| 17 | Meta-теги, index.html | — |
| 18 | Финальная полировка анимаций, адаптив | все |
| 19 | `ng add @angular/ssr` + проверки из Шага 12 | 18 |
| 20 | Настройка prerender / деплой | 19 |

---

## Команды разработки

```bash
# Запуск dev-сервера
npm start

# Сборка production
npm run build

# После подключения SSR — запуск SSR локально
node dist/firs-livingstone-example/server/server.mjs

# После подключения SSR — prerender
npm run build  # prerender запускается автоматически если настроен в angular.json
```
