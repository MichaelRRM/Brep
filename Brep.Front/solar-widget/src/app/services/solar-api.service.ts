import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SolarPoint, months } from '../mock/mock-solar';
import { isoRange } from '../utils/date.utils';

const BASE = 'http://localhost:5070';
const SOLAR_TO_GRID = 'hr/370';

interface DataPointEntry {
  timestamp: string;
  value: number;
}

function toMonthly(entries: DataPointEntry[]): SolarPoint[] {
  const byMonth = new Array(12).fill(0);
  for (const e of entries) {
    byMonth[new Date(e.timestamp).getMonth()] += e.value;
  }
  return months.map((label, i) => ({ label, toGrid: +byMonth[i].toFixed(2), toBESS: 0, potential: 0 }));
}

function toDaily(entries: DataPointEntry[], year: number, month: number): SolarPoint[] {
  const count = new Date(year, month + 1, 0).getDate();
  const byDay = new Array(count).fill(0);
  for (const e of entries) {
    const d = new Date(e.timestamp).getDate() - 1;
    if (d >= 0 && d < count) byDay[d] += e.value;
  }
  return byDay.map((v, i) => ({ label: String(i + 1), toGrid: +v.toFixed(2), toBESS: 0, potential: 0 }));
}

function toIntraday(entries: DataPointEntry[]): SolarPoint[] {
  const slots = new Array(96).fill(0);
  for (const e of entries) {
    const d = new Date(e.timestamp);
    const slot = Math.floor((d.getHours() * 60 + d.getMinutes()) / 15);
    if (slot >= 0 && slot < 96) slots[slot] += e.value;
  }
  return slots.map((v, i) => {
    const hh = String(Math.floor(i / 4)).padStart(2, '0');
    const mm = String((i % 4) * 15).padStart(2, '0');
    return { label: `${hh}:${mm}`, toGrid: +v.toFixed(2), toBESS: 0, potential: 0 };
  });
}

@Injectable({ providedIn: 'root' })
export class SolarApiService {
  private http = inject(HttpClient);

  getMonthlySolar(site: string, year: number): Observable<SolarPoint[]> {
    const { start, end } = isoRange(year);
    return this.http.get<DataPointEntry[]>(`${BASE}/api/datapoint`, {
      params: { site, dataPoint: SOLAR_TO_GRID, start, end, bucketSize: 43200 },
    }).pipe(map(entries => toMonthly(entries)));
  }

  getDailySolar(site: string, year: number, month: number): Observable<SolarPoint[]> {
    const { start, end } = isoRange(year, month);
    return this.http.get<DataPointEntry[]>(`${BASE}/api/datapoint`, {
      params: { site, dataPoint: SOLAR_TO_GRID, start, end, bucketSize: 1440 },
    }).pipe(map(entries => toDaily(entries, year, month)));
  }

  getIntradaySolar(site: string, year: number, month: number, day: number): Observable<SolarPoint[]> {
    const { start, end } = isoRange(year, month, day);
    return this.http.get<DataPointEntry[]>(`${BASE}/api/datapoint`, {
      params: { site, dataPoint: SOLAR_TO_GRID, start, end, bucketSize: 15 },
    }).pipe(map(entries => toIntraday(entries)));
  }
}
