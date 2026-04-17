import { Injectable, computed, signal } from '@angular/core';
import { SITES } from '../data/sites';

@Injectable({ providedIn: 'root' })
export class SiteService {
  readonly sites = SITES;
  readonly selectedSiteId = signal<string>('all');
  readonly site = computed(() => this.sites.find(s => s.id === this.selectedSiteId())!);
  readonly hasBess = computed(() => !!this.site().bessMW);
}
