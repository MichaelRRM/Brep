import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Site, SITES } from './sites';

@Injectable({ providedIn: 'root' })
export class MockSitesApiService {
  getSites(): Observable<Site[]> {
    return of(SITES);
  }
}
