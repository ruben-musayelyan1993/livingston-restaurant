import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AdminApiService, type ImageItem } from '../admin-api.service';

interface FieldDef   { key: string; label: string; multiline?: boolean; }
interface FieldGroup { label?: string; fields: FieldDef[]; cols?: number; dividerAfter?: boolean; imageKey?: string; }
interface Section    { id: string; label: string; fields?: FieldDef[]; groups?: FieldGroup[]; }

const SECTIONS: Section[] = [
  { id: 'nav', label: 'Navigation', fields: [
    { key: 'nav.about',       label: 'About' },
    { key: 'nav.cuisine',     label: 'Cuisine' },
    { key: 'nav.atmosphere',  label: 'Atmosphere' },
    { key: 'nav.events',      label: 'Events' },
    { key: 'nav.reservation', label: 'Reservation' },
    { key: 'nav.contacts',    label: 'Contacts' },
  ]},
  { id: 'hero', label: 'Hero', groups: [
    { imageKey: 'hero-bg.jpg', fields: [
      { key: 'hero.est',     label: 'Est. badge' },
      { key: 'hero.tagline', label: 'Tagline' },
      { key: 'hero.cta',     label: 'CTA button' },
    ]},
  ]},
  { id: 'about', label: 'About', fields: [
    { key: 'about.overline',    label: 'Overline' },
    { key: 'about.title',       label: 'Title' },
    { key: 'about.p1',          label: 'Paragraph 1', multiline: true },
    { key: 'about.p2',          label: 'Paragraph 2', multiline: true },
    { key: 'about.stat1_num',   label: 'Stat 1: number' },
    { key: 'about.stat1_label', label: 'Stat 1: label' },
    { key: 'about.stat2_num',   label: 'Stat 2: number' },
    { key: 'about.stat2_label', label: 'Stat 2: label' },
    { key: 'about.stat3_num',   label: 'Stat 3: number' },
    { key: 'about.stat3_label', label: 'Stat 3: label' },
  ]},
  { id: 'cuisine', label: 'Cuisine', groups: [
    { fields: [
      { key: 'cuisine.overline',  label: 'Overline' },
      { key: 'cuisine.title',     label: 'Title' },
      { key: 'cuisine.subtitle',  label: 'Subtitle', multiline: true },
    ]},
    { label: 'Dish 1', dividerAfter: true, imageKey: 'dish-carpaccio.jpg', fields: [
      { key: 'cuisine.dishes.carpaccio_name', label: 'Name' },
      { key: 'cuisine.dishes.carpaccio_desc', label: 'Description' },
    ]},
    { label: 'Dish 2', dividerAfter: true, imageKey: 'dish-lamb.jpg', fields: [
      { key: 'cuisine.dishes.lamb_name', label: 'Name' },
      { key: 'cuisine.dishes.lamb_desc', label: 'Description' },
    ]},
    { label: 'Dish 3', dividerAfter: true, imageKey: 'dish-chicken.jpg', fields: [
      { key: 'cuisine.dishes.chicken_name', label: 'Name' },
      { key: 'cuisine.dishes.chicken_desc', label: 'Description' },
    ]},
    { label: 'Dish 4', dividerAfter: true, imageKey: 'dish-trout.jpg', fields: [
      { key: 'cuisine.dishes.trout_name', label: 'Name' },
      { key: 'cuisine.dishes.trout_desc', label: 'Description' },
    ]},
    { label: 'Dish 5', dividerAfter: true, imageKey: 'dish-octopus.jpg', fields: [
      { key: 'cuisine.dishes.octopus_name', label: 'Name' },
      { key: 'cuisine.dishes.octopus_desc', label: 'Description' },
    ]},
    { label: 'Dish 6', imageKey: 'dish-turkey.jpg', fields: [
      { key: 'cuisine.dishes.turkey_name', label: 'Name' },
      { key: 'cuisine.dishes.turkey_desc', label: 'Description' },
    ]},
  ]},
  { id: 'atmosphere', label: 'Upcoming Events', groups: [
    { fields: [
      { key: 'atmosphere.overline',  label: 'Overline' },
      { key: 'atmosphere.title',     label: 'Title' },
      { key: 'atmosphere.subtitle',  label: 'Subtitle', multiline: true },
    ]},
    { label: 'Programme 1', cols: 3, dividerAfter: true, fields: [
      { key: 'atmosphere.jazz_time',  label: 'Time' },
      { key: 'atmosphere.jazz_title', label: 'Title' },
      { key: 'atmosphere.jazz_desc',  label: 'Subtitle' },
    ]},
    { label: 'Programme 2', cols: 3, dividerAfter: true, fields: [
      { key: 'atmosphere.dj_time',  label: 'Time' },
      { key: 'atmosphere.dj_title', label: 'Title' },
      { key: 'atmosphere.dj_desc',  label: 'Subtitle' },
    ]},
    { label: 'Programme 3', cols: 3, dividerAfter: true, fields: [
      { key: 'atmosphere.prog3_time',  label: 'Time' },
      { key: 'atmosphere.prog3_title', label: 'Title' },
      { key: 'atmosphere.prog3_desc',  label: 'Subtitle' },
    ]},
    { label: 'Programme 4', cols: 3, dividerAfter: true, fields: [
      { key: 'atmosphere.prog4_time',  label: 'Time' },
      { key: 'atmosphere.prog4_title', label: 'Title' },
      { key: 'atmosphere.prog4_desc',  label: 'Subtitle' },
    ]},
    { label: 'Programme 5', cols: 3, fields: [
      { key: 'atmosphere.prog5_time',  label: 'Time' },
      { key: 'atmosphere.prog5_title', label: 'Title' },
      { key: 'atmosphere.prog5_desc',  label: 'Subtitle' },
    ]},
  ]},
  { id: 'events', label: 'Private Events', fields: [
    { key: 'events.overline',             label: 'Overline' },
    { key: 'events.title',                label: 'Title' },
    { key: 'events.subtitle',             label: 'Subtitle', multiline: true },
    { key: 'events.capacity_label',       label: 'Capacity: unit' },
    { key: 'events.capacity_sub',         label: 'Capacity: caption' },
    { key: 'events.types.corporate',      label: 'Type: corporate' },
    { key: 'events.types.wedding',        label: 'Type: wedding' },
    { key: 'events.types.birthday',       label: 'Type: birthday' },
    { key: 'events.types.reception',      label: 'Type: reception' },
    { key: 'events.cta',                  label: 'Button' },
  ]},
  { id: 'contacts', label: 'Contacts', fields: [
    { key: 'contacts.overline',      label: 'Overline' },
    { key: 'contacts.title',         label: 'Title' },
    { key: 'contacts.address_label', label: 'Address: heading' },
    { key: 'contacts.address',       label: 'Address', multiline: true },
    { key: 'contacts.phone_label',   label: 'Phone: heading' },
    { key: 'contacts.hours_label',   label: 'Hours: heading' },
    { key: 'contacts.hours',         label: 'Opening hours' },
    { key: 'contacts.dress_label',   label: 'Dress code: heading' },
    { key: 'contacts.dress',         label: 'Dress code' },
  ]},
  { id: 'footer', label: 'Footer', fields: [
    { key: 'footer.tagline',   label: 'Tagline' },
    { key: 'footer.copyright', label: 'Copyright' },
  ]},
];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  readonly sections = SECTIONS;

  // Tab state
  activeTab = signal<'texts' | 'images'>('texts');
  activeLang = signal<'ru' | 'en' | 'hy'>('ru');
  activeSectionId = signal(SECTIONS[0].id);

  constructor() {
    const saved = sessionStorage.getItem('admin_section');
    if (saved && SECTIONS.some(s => s.id === saved)) {
      this.activeSectionId.set(saved);
    }
    effect(() => sessionStorage.setItem('admin_section', this.activeSectionId()));
  }

  // Data
  translations = signal<Record<string, Record<string, unknown>>>({});
  flatData = signal<Record<string, Record<string, string>>>({ ru: {}, en: {}, hy: {} });
  images = signal<ImageItem[]>([]);
  imageTimestamps = signal<Record<string, number>>({});

  // Status
  loading = signal(true);
  saving = signal(false);
  saveStatus = signal<'idle' | 'ok' | 'err'>('idle');
  uploadingImage = signal<string | null>(null);

  get activeSection(): Section {
    return this.sections.find(s => s.id === this.activeSectionId()) ?? this.sections[0];
  }

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    this.api.getTranslations().subscribe({
      next: (data) => {
        this.translations.set(data);
        this.flatData.set({
          ru: this.flatten(data['ru'] ?? {}),
          en: this.flatten(data['en'] ?? {}),
          hy: this.flatten(data['hy'] ?? {}),
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) this.redirectToLogin();
      },
    });
    this.api.getImages().subscribe({
      next: (imgs) => this.images.set(imgs),
      error: (err) => { if (err.status === 401) this.redirectToLogin(); },
    });
  }

  private redirectToLogin(): void {
    this.api.handleUnauthorized();
    this.router.navigateByUrl('/admin/login');
  }

  getField(key: string): string {
    return this.flatData()[this.activeLang()]?.[key] ?? '';
  }

  setField(key: string, value: string): void {
    this.flatData.update(fd => ({
      ...fd,
      [this.activeLang()]: { ...fd[this.activeLang()], [key]: value },
    }));
  }

  save(): void {
    this.saving.set(true);
    this.saveStatus.set('idle');
    const payload: Record<string, unknown> = {
      ru: this.unflatten(this.flatData()['ru']),
      en: this.unflatten(this.flatData()['en']),
      hy: this.unflatten(this.flatData()['hy']),
    };
    this.api.saveTranslations(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveStatus.set('ok');
        setTimeout(() => this.saveStatus.set('idle'), 2500);
      },
      error: () => {
        this.saving.set(false);
        this.saveStatus.set('err');
      },
    });
  }

  triggerUpload(imageName: string): void {
    const input = document.getElementById(`upload-${imageName}`) as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: Event, imageName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage.set(imageName);
    this.api.uploadImage(imageName, file).subscribe({
      next: () => {
        this.imageTimestamps.update(ts => ({ ...ts, [imageName]: Date.now() }));
        this.uploadingImage.set(null);
        (event.target as HTMLInputElement).value = '';
      },
      error: () => this.uploadingImage.set(null),
    });
  }

  imageUrl(img: ImageItem): string {
    const ts = this.imageTimestamps()[img.name];
    return ts ? `${img.url}?t=${ts}` : img.url;
  }

  dishImageUrl(name: string): string {
    const ts = this.imageTimestamps()[name];
    const base = `/assets/images/${name}`;
    return ts ? `${base}?t=${ts}` : base;
  }

  triggerDishUpload(imageName: string): void {
    const input = document.getElementById(`dish-upload-${imageName}`) as HTMLInputElement;
    input?.click();
  }

  logout(): void {
    this.api.logout();
    this.router.navigateByUrl('/admin/login');
  }

  private flatten(obj: unknown, prefix = ''): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown> ?? {})) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object') {
        Object.assign(out, this.flatten(v, key));
      } else {
        out[key] = String(v ?? '');
      }
    }
    return out;
  }

  private unflatten(flat: Record<string, string>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(flat)) {
      const parts = key.split('.');
      parts.reduce((cur: Record<string, unknown>, part, idx) => {
        if (idx === parts.length - 1) { cur[part] = val; return cur; }
        if (typeof cur[part] !== 'object' || cur[part] === null) cur[part] = {};
        return cur[part] as Record<string, unknown>;
      }, out);
    }
    return out;
  }
}
