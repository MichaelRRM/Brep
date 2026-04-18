import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Site } from '../mock/sites';

const BASE = 'http://localhost:5070';

@Injectable({ providedIn: 'root' })
export class SitesApiService {
  private http = inject(HttpClient);

  getSites(): Observable<Site[]> {
    return this.http.get<string[]>(`${BASE}/sites`).pipe(
      map(ids => ids.map(id => ({ id, name: id, solarMWp: 0 }))),
    );
  }
}
