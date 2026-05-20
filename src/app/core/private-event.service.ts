import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';

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

  submit(data: PrivateEventPayload): Observable<void> {
    return this.http.post('/api/private-event', data).pipe(switchMap(() => of(undefined)));
  }
}
