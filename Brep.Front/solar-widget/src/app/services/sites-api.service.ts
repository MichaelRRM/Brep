import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MockSitesApiService } from '../mock/mock-sites-api.service';
import { Site } from '../mock/sites';

@Injectable({ providedIn: 'root' })
export class SitesApiService {
  private mock = inject(MockSitesApiService);

  getSites(): Observable<Site[]> {
    return this.mock.getSites();
  }
}
