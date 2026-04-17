import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SolarPoint, generateMonthlySolar, generateDailySolar, generateIntradaySolar } from './mock-solar';

@Injectable({ providedIn: 'root' })
export class MockSolarApiService {
  getMonthlySolar(year: number): Observable<SolarPoint[]> {
    return of(generateMonthlySolar(year));
  }

  getDailySolar(year: number, month: number): Observable<SolarPoint[]> {
    return of(generateDailySolar(year, month));
  }

  getIntradaySolar(year: number, month: number, day: number): Observable<SolarPoint[]> {
    return of(generateIntradaySolar(year, month, day));
  }
}
