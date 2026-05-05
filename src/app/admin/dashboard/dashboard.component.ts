import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AdminApiService, type ImageItem } from '../admin-api.service';

interface FieldDef { key: string; label: string; multiline?: boolean; }
interface Section  { id: string; label: string; fields: FieldDef[]; }

const SECTIONS: Section[] = [
  { id: 'nav', label: 'Навигация', fields: [
    { key: 'nav.about',       label: 'О ресторане' },
    { key: 'nav.cuisine',     label: 'Кухня' },
    { key: 'nav.atmosphere',  label: 'Атмосфера' },
    { key: 'nav.events',      label: 'Мероприятия' },
    { key: 'nav.reservation', label: 'Бронирование' },
    { key: 'nav.contacts',    label: 'Контакты' },
  ]},
  { id: 'hero', label: 'Герой', fields: [
    { key: 'hero.tagline', label: 'Подзаголовок' },
    { key: 'hero.cta',     label: 'Кнопка CTA' },
  ]},
  { id: 'about', label: 'О ресторане', fields: [
    { key: 'about.overline',    label: 'Надпись сверху' },
    { key: 'about.title',       label: 'Заголовок' },
    { key: 'about.p1',          label: 'Параграф 1', multiline: true },
    { key: 'about.p2',          label: 'Параграф 2', multiline: true },
    { key: 'about.stat1_num',   label: 'Цифра 1' },
    { key: 'about.stat1_label', label: 'Подпись 1' },
    { key: 'about.stat2_num',   label: 'Цифра 2' },
    { key: 'about.stat2_label', label: 'Подпись 2' },
    { key: 'about.stat3_num',   label: 'Цифра 3' },
    { key: 'about.stat3_label', label: 'Подпись 3' },
  ]},
  { id: 'cuisine', label: 'Кухня', fields: [
    { key: 'cuisine.overline',               label: 'Надпись сверху' },
    { key: 'cuisine.title',                  label: 'Заголовок' },
    { key: 'cuisine.subtitle',               label: 'Подзаголовок', multiline: true },
    { key: 'cuisine.dishes.carpaccio_name',  label: 'Блюдо 1: название' },
    { key: 'cuisine.dishes.carpaccio_desc',  label: 'Блюдо 1: описание' },
    { key: 'cuisine.dishes.lamb_name',       label: 'Блюдо 2: название' },
    { key: 'cuisine.dishes.lamb_desc',       label: 'Блюдо 2: описание' },
    { key: 'cuisine.dishes.chicken_name',    label: 'Блюдо 3: название' },
    { key: 'cuisine.dishes.chicken_desc',    label: 'Блюдо 3: описание' },
    { key: 'cuisine.dishes.trout_name',      label: 'Блюдо 4: название' },
    { key: 'cuisine.dishes.trout_desc',      label: 'Блюдо 4: описание' },
    { key: 'cuisine.dishes.octopus_name',    label: 'Блюдо 5: название' },
    { key: 'cuisine.dishes.octopus_desc',    label: 'Блюдо 5: описание' },
    { key: 'cuisine.dishes.turkey_name',     label: 'Блюдо 6: название' },
    { key: 'cuisine.dishes.turkey_desc',     label: 'Блюдо 6: описание' },
  ]},
  { id: 'atmosphere', label: 'Атмосфера', fields: [
    { key: 'atmosphere.overline',  label: 'Надпись сверху' },
    { key: 'atmosphere.title',     label: 'Заголовок' },
    { key: 'atmosphere.subtitle',  label: 'Подзаголовок', multiline: true },
    { key: 'atmosphere.jazz_title', label: 'Джаз: заголовок' },
    { key: 'atmosphere.jazz_desc',  label: 'Джаз: описание' },
    { key: 'atmosphere.jazz_time',  label: 'Джаз: время' },
    { key: 'atmosphere.dj_title',   label: 'DJ: заголовок' },
    { key: 'atmosphere.dj_desc',    label: 'DJ: описание' },
    { key: 'atmosphere.dj_time',    label: 'DJ: время' },
  ]},
  { id: 'events', label: 'Мероприятия', fields: [
    { key: 'events.overline',             label: 'Надпись сверху' },
    { key: 'events.title',                label: 'Заголовок' },
    { key: 'events.subtitle',             label: 'Подзаголовок', multiline: true },
    { key: 'events.capacity_label',       label: 'Вместимость: ед. изм.' },
    { key: 'events.capacity_sub',         label: 'Вместимость: подпись' },
    { key: 'events.types.corporate',      label: 'Тип: корпоративный' },
    { key: 'events.types.wedding',        label: 'Тип: свадьба' },
    { key: 'events.types.birthday',       label: 'Тип: день рождения' },
    { key: 'events.types.reception',      label: 'Тип: приём' },
    { key: 'events.cta',                  label: 'Кнопка' },
  ]},
  { id: 'contacts', label: 'Контакты', fields: [
    { key: 'contacts.overline',      label: 'Надпись сверху' },
    { key: 'contacts.title',         label: 'Заголовок' },
    { key: 'contacts.address_label', label: 'Адрес: заголовок' },
    { key: 'contacts.address',       label: 'Адрес', multiline: true },
    { key: 'contacts.phone_label',   label: 'Телефон: заголовок' },
    { key: 'contacts.hours_label',   label: 'Часы: заголовок' },
    { key: 'contacts.hours',         label: 'Часы работы' },
    { key: 'contacts.dress_label',   label: 'Дресс-код: заголовок' },
    { key: 'contacts.dress',         label: 'Дресс-код' },
  ]},
  { id: 'footer', label: 'Подвал', fields: [
    { key: 'footer.tagline',   label: 'Слоган' },
    { key: 'footer.copyright', label: 'Копирайт' },
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
