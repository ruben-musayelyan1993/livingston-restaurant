import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface ReservationPayload {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `https://api.telegram.org/bot${environment.telegram.botToken}/sendMessage`;

  submit(data: ReservationPayload): Observable<void> {
    const message = this.formatMessage(data);

    return this.http.post(this.apiUrl, {
      chat_id: environment.telegram.chatId,
      text: message,
      parse_mode: 'HTML',
    }).pipe(switchMap(() => of(undefined)));
  }

  private formatMessage(data: ReservationPayload): string {
    const date = new Date(data.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const comment = data.comment?.trim()
      ? `\n💬 <b>Комментарий:</b> ${data.comment}`
      : '';

    return [
      '🍽 <b>Новая заявка на бронирование</b>',
      '',
      `👤 <b>Имя:</b> ${data.name}`,
      `📧 <b>Email:</b> ${data.email}`,
      `📞 <b>Телефон:</b> ${data.phone}`,
      `📅 <b>Дата:</b> ${date}`,
      `👥 <b>Гостей:</b> ${data.guests}`,
      comment,
    ].join('\n');
  }
}
