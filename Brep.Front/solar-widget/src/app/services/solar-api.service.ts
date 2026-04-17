import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MockSolarApiService } from '../mock/mock-solar-api.service';
import { SolarPoint } from '../mock/mock-solar';

@Injectable({ providedIn: 'root' })
export class SolarApiService {
  private mock = inject(MockSolarApiService);

  getMonthlySolar(year: number): Observable<SolarPoint[]> {
    return this.mock.getMonthlySolar(year);
  }

  getDailySolar(year: number, month: number): Observable<SolarPoint[]> {
    return this.mock.getDailySolar(year, month);
  }

  getIntradaySolar(year: number, month: number, day: number): Observable<SolarPoint[]> {
    return this.mock.getIntradaySolar(year, month, day);
  }
}
