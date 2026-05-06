# Livingston Restaurant — UI Component Summary
> For Claude Design. Angular 21 · Standalone Components · SSR · Signals

---

## Design System

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-noir` | `#0A0A0A` | Page background, darkest surfaces |
| `--color-charcoal` | `#141414` | Card backgrounds |
| `--color-deep-gray` | `#1E1E1E` | Elevated surfaces |
| `--color-gold` | `#C9A96E` | Primary accent: borders, labels, CTAs |
| `--color-gold-light` | `#E8D5A3` | Gold highlights |
| `--color-ivory` | `#F5F0E8` | Primary text |
| `--color-ivory-dim` | `rgba(245,240,232,0.55)` | Secondary text |
| `--color-burgundy` | `#4A1020` | Unused / reserved |
| `--color-slate` | `#2C2C2C` | Unused / reserved |

### Typography
- **Display font:** `AcciaPiano` (custom, all weights 100–800) — headings, logo, large numbers
- **Body font:** `AcciaPiano, system-ui, sans-serif` — nav, labels, body text
- **Fluid root:** `html { font-size: clamp(14px, 0.42vw + 10px, 18px) }` — all sizes in `rem`
- **Overline:** `0.625rem · letter-spacing 0.2em · uppercase · gold` — section labels

### Layout Tokens
| Token | Default | 1441px+ | 1680px+ | 1921px+ | 2561px+ | ≤1024px | ≤768px |
|---|---|---|---|---|---|---|---|
| `--content-width` | 1280px | 1380px | 1560px | 1760px | 1980px | — | — |
| `--section-py` | 120px | 130px | 148px | 160px | 180px | 72px | 56px |
| `--side-px` | 80px | — | — | 100px | 120px | 48px | 24px |

### Global Utilities
- `.section-container` — `max-width: content-width; margin: 0 auto; padding: 0 side-px`
- `.section-py` — `padding: section-py 0`
- `.divider-gold` — `60px × 1px gold bar, opacity 0.6`; `--center` variant centers it
- `.overline` — gold uppercase label, `0.625rem`, `letter-spacing 0.2em`
- `.input-underline` — borderless input with gold bottom border on focus
- `.btn-ghost` — transparent, gold border, fills gold on hover (`color: noir`)
- `.btn-solid` — gold fill, noir text, `brightness(1.1)` on hover
- `body::after` — fixed SVG film-grain overlay at `opacity 0.035`
- `@keyframes btnShimmer` — diagonal shimmer sweep used by hero CTA and header reserve button

---

## Page Structure

```
App (router-outlet)
│
├── / → LandingPage
│   ├── Header           (fixed, top)
│   ├── Hero             (section #hero)
│   ├── About            (section #about)
│   ├── Cuisine          (section #cuisine)
│   ├── Atmosphere       (section #atmosphere)
│   ├── Events           (section #events)
│   ├── Contacts         (section #contacts)
│   ├── Footer
│   └── ReservationModal (global overlay, signal-driven)
│
└── /admin → lazy-loaded
    ├── /admin/login
    └── /admin/dashboard  (guarded by authGuard)
```

---

## Layout Components

### `Header`
**File:** `src/app/layout/header/`  
**Behavior:** Fixed top bar, transparent → `background: rgba(10,10,10,0.92) + backdrop-blur(14px)` on scroll.

**Structure:**
```
.header
  .header__inner
    button.header__logo        → scrolls to #hero
    nav.header__nav            → 5 anchor links (scroll-to)
      button.header__nav-close → mobile only, X button
    .header__actions
      .lang-switcher           → AM / RU / EN toggle (LanguageService)
      button.btn-ghost.header__reserve → opens ReservationModal (hidden ≤1024px)
      button.header__burger    → mobile menu toggle
div.header__overlay            → mobile backdrop, closes menu on click
```

**Responsive:** Nav slides in from right as fixed panel at ≤768px (280px wide). Burger appears. Reserve button hidden ≤1024px.

---

### `Footer`
**File:** `src/app/layout/footer/`

**Structure:**
```
footer.footer
  .footer__inner.section-container
    .footer__top
      .footer__brand   → "LIVINGSTON" + tagline
      nav.footer__nav  → 5 anchor links
      .footer__right
        .lang-switcher → AM / RU / EN
        .footer__socials → Instagram + Facebook SVG icons
    .footer__divider   → 1px gold-tinted line
    p.footer__copy     → copyright text
```

---

## Section Components

### `Hero`
**File:** `src/app/sections/hero/`  
**Layout:** Full viewport height (`100svh`, min 600px), centered flex column.

**Structure:**
```
section.hero#hero
  .hero__bg        → fixed background image (hero-bg.jpg), scale(1.05)
  .hero__overlay   → dark gradient overlay (35% → 75% top to bottom)
  .hero__content   → centered flex column, gap 28px
    .hero__logo-wrap  → logo.svg, clamp(240px, 36vw, 500px)
    .hero__divider    → .divider-gold--center
    p.hero__tagline   → gold, 0.6875rem, letter-spacing 0.22em
    button.btn-ghost.hero__cta → opens ReservationModal
                                  diagonal shimmer animation (::before)
```

**Animations:** Staggered `heroFadeIn` (opacity 0→1, translateY 16px→0) at delays 0.1s / 0.3s / 0.5s / 0.7s.

---

### `About`
**File:** `src/app/sections/about/`  
**Layout:** 2-column grid (`1fr 1.2fr`), switches to stacked at ≤1024px (image first).

**Structure:**
```
section.about.section-py#about
  .section-container
    .about__grid
      .about__text (scrollReveal)
        p.overline
        .divider-gold
        h2.about__title      → clamp(2.25rem, 4vw, 3.25rem)
        p.about__para × 2
        .about__stats        → flex row, align-items: stretch
          .about__stat × 3   → flex column, align-items: center
            span.about__stat-num    → clamp(2rem, 4vw, 3rem), gold
            span.about__stat-label  → 0.625rem, align-self: flex-start
          .about__stat-sep × 2     → 1px gold line, stretches full height
      .about__slider-wrap (scrollReveal)
        .about__slider       → aspect-ratio 4/5, crossfade slideshow
          img.about__slide × N
          .about__overlay
          .about__controls   → dot navigation
          .about__progress-track → gold progress bar (5s animation)
```

**Slider:** Auto-advances every 5s, gold corner frame decoration via `::before`.

---

### `Cuisine`
**File:** `src/app/sections/cuisine/`  
**Layout:** Centered header + 3-column dish grid (→ 2-col ≤1024px → 1-col ≤600px).

**Structure:**
```
section.cuisine.section-py#cuisine
  .section-container
    .cuisine__header (scrollReveal)
      p.overline
      .divider-gold--center
      h2.cuisine__title    → clamp(2.25rem, 4vw, 3.25rem), centered
      p.cuisine__subtitle
    .cuisine__grid
      .dish-card × 6 (scrollReveal, staggered by column)
        .dish-card__img-wrap → aspect-ratio 4/3, overflow hidden
          img.dish-card__img  → object-fit cover, scale(1.04) on hover
        .dish-card__body
          h3.dish-card__name   → 0.875rem
          .dish-card__divider  → 30px gold line
          p.dish-card__desc    → 0.8125rem, ivory-dim
```

**Dishes:** 6 items (carpaccio, lamb, chicken, trout, octopus, turkey). Images and names from translations.

---

### `Atmosphere`
**File:** `src/app/sections/atmosphere/`  
**Layout:** Full-bleed background image with overlay; content centered via `.section-container`.

**Structure:**
```
section.atmosphere#atmosphere
  .atmosphere__bg       → background image (atmosphere-bg.jpg), fixed attachment
  .atmosphere__overlay  → gradient overlay
  .atmosphere__content.section-py
    .section-container
      .atmosphere__intro (scrollReveal)
        p.overline
        .divider-gold
        h2.atmosphere__title   → clamp(2.25rem, 4vw, 3.25rem)
        p.atmosphere__subtitle
      .atmosphere__program (scrollReveal)
        p.atmosphere__program-label.overline
        .atmosphere__blocks    → flex row, 2 blocks
          .atmosphere__block × 2
            span.atmosphere__block-time  → gold, large
            .atmosphere__block-border    → 1px vertical gold line
            .atmosphere__block-body
              h3.atmosphere__block-title
              p.atmosphere__block-desc
      .atmosphere__timeline (scrollReveal)
        .atmosphere__timeline-track   → horizontal gold line
        .atmosphere__timeline-item × 4
          .atmosphere__timeline-dot   → circle (gold variant for events)
          span.atmosphere__timeline-time
          span.atmosphere__timeline-label
```

**Timeline events:** 19:00 open · 20:00 jazz · 22:20 DJ · 02:00 close.

---

### `Events`
**File:** `src/app/sections/events/`  
**Layout:** 2-column grid (`1.1fr 1fr`), image left, text right. Reverses at ≤1024px.

**Structure:**
```
section.events.section-py#events
  .section-container
    .events__grid
      .events__image-wrap (scrollReveal)
        .events__image-frame  → gold offset frame decoration
          img.events__image   → events-hall.jpg
        .events__capacity     → absolute overlay bottom-right
          span.events__capacity-num    → "150", large gold
          span.events__capacity-label  → unit label
          span.events__capacity-sub    → sub-label
      .events__text (scrollReveal)
        p.overline
        .divider-gold
        h2.events__title   → clamp(2rem, 3.5vw, 3rem)
        p.events__subtitle
        ul.events__list
          li.events__list-item × 4  → ◆ bullet, event types
        button.btn-ghost   → scrolls to #reservation
```

---

### `Contacts`
**File:** `src/app/sections/contacts/`  
**Layout:** 2-column grid (`1fr 1fr`), map left, info right. Stacks at ≤1024px.

**Structure:**
```
section.contacts.section-py#contacts
  .section-container
    .contacts__grid
      .contacts__map (scrollReveal)   → Google Maps iframe, full height
      .contacts__info (scrollReveal)
        p.overline
        .divider-gold
        h2.contacts__title   → clamp(2rem, 3.5vw, 3rem)
        .contacts__details
          .contacts__detail × 4
            .contacts__detail-icon   → SVG icon (18×18, stroke)
            .contacts__detail-body
              span.contacts__detail-label  → 0.5rem uppercase
              span/a.contacts__detail-value
```

**Detail items:** Address · Phone (×2, tel: links) · Hours · Dress code.

---

## Shared Components & Directives

### `ReservationModal`
**File:** `src/app/shared/reservation-modal/`  
**Trigger:** `ReservationModalService.open()` signal — called from Header, Hero, Events.

**Structure:**
```
.rm-overlay  → full-screen backdrop, click-outside closes
  .rm-panel
    .rm-deco          → left decorative panel (bg image + name + tagline)
    .rm-body
      button.rm-close → X button, top-right
      [success state]
        .rm-success
          SVG check icon
          h2.rm-success__title
          p.rm-success__msg
          button.btn-ghost → close
      [form state]
        .rm-header
          p.overline
          .divider-gold
          h2.rm-title
        form.rm-form (ReactiveForm)
          input._hp         → honeypot (hidden, spam protection)
          .rm-row
            name field      → required, minLength 2
            phone field     → required
          .rm-row
            date field      → required, no past dates
            guests select   → 1–6 + "more"
          email field       → required, email format
          textarea comment  → optional
          button.btn-solid  → submit; spinner during loading
```

**States:** `idle` · `loading` · `success` · `error`  
**Validation:** Touched-based inline errors per field.

---

### `ScrollRevealDirective`
**File:** `src/app/shared/directives/scroll-reveal.directive.ts`  
**Usage:** `<div scrollReveal [delay]="200">` on any element.  
**Behavior:** IntersectionObserver — adds `is-visible` class when element enters viewport. Supports staggered `delay` in ms.

---

## Admin Panel

### `AdminLogin`
**File:** `src/app/admin/login/`  
**Route:** `/admin/login`  
Simple password form. On success, server sets HttpOnly cookie; Angular stores `sessionStorage` flag.

### `AdminDashboard`
**File:** `src/app/admin/dashboard/`  
**Route:** `/admin/dashboard` (guarded)

**Tabs:**
1. **Texts** — language switcher (RU/EN/AM) + section sidebar (8 sections) + field editor (input/textarea)
2. **Images** — grid of image cards with preview + file replace upload

**Sections editable:** Nav · Hero · About · Cuisine · Atmosphere · Events · Contacts · Footer

**Dark theme:** mirrors main site palette — `#0A0A0A` background, `#C9A96E` gold accents, `AcciaPiano` font.

---

## Services

| Service | Location | Responsibility |
|---|---|---|
| `LanguageService` | `core/` | Init ngx-translate, expose `current()` signal, `set(lang)` |
| `ReservationModalService` | `core/` | `isOpen()` signal, `open()`, `close()` |
| `ReservationService` | `core/` | POST form data to backend |
| `AdminApiService` | `admin/` | All `/admin/api/*` calls, session management via HttpOnly cookie |

---

## SSR Configuration

| Route | Render Mode |
|---|---|
| `/` | Prerender (static at build time) |
| `/admin/*` | Client-only (no SSR, reads sessionStorage) |

**Server:** Express 5 (`src/server.ts`) — serves Angular SSR + admin REST API on the same port.  
**Admin API security:** bcrypt password · random session token · HttpOnly+SameSite cookie · 8h expiry · rate-limit 5 req/15min per IP.
