import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface PrivateEventPayload {
  name: string;
  company?: string;
  eventType: string;
  guests: number;
  date: string;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class PrivateEventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `https://api.telegram.org/bot${environment.telegram.botToken}/sendMessage`;

  submit(data: PrivateEventPayload): Observable<void> {
    return this.http.post(this.apiUrl, {
      chat_id: environment.telegram.chatId,
      text: this.formatMessage(data),
      parse_mode: 'HTML',
    }).pipe(switchMap(() => of(undefined)));
  }

  private readonly typeLabels: Record<string, string> = {
    wedding:   'Свадьба',
    birthday:  'День рождения',
    corporate: 'Корпоратив',
    other:     'Другое',
  };

  private formatMessage(data: PrivateEventPayload): string {
    const date = new Date(data.date).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const type = this.typeLabels[data.eventType] ?? data.eventType;
    const lines = [
      '🎉 <b>Новая заявка на частное мероприятие</b>',
      '',
      `👤 <b>Имя:</b> ${data.name}`,
    ];
    if (data.company?.trim()) lines.push(`🏢 <b>Компания:</b> ${data.company}`);
    lines.push(
      `🎭 <b>Тип мероприятия:</b> ${type}`,
      `👥 <b>Гостей:</b> ${data.guests}`,
      `📅 <b>Дата:</b> ${date}`,
    );
    if (data.comment?.trim()) lines.push(`💬 <b>Комментарий:</b> ${data.comment}`);
    return lines.join('\n');
  }
}
