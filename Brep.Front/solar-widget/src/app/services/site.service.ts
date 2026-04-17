import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SitesApiService } from './sites-api.service';
import { Site } from '../mock/sites';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private api = inject(SitesApiService);

  readonly sites = toSignal(this.api.getSites(), { initialValue: [] as Site[] });
  readonly selectedSiteId = signal<string>(this.sites()[0]?.id ?? '');
  readonly site = computed(() => this.sites().find(s => s.id === this.selectedSiteId()) ?? this.sites()[0]);
  readonly hasBess = computed(() => !!this.site()?.bessMW);
}
