import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';

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

  submit(data: ReservationPayload): Observable<void> {
    return this.http.post('/api/reservation', data).pipe(switchMap(() => of(undefined)));
  }
}
