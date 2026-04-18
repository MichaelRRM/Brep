import { Component, inject } from '@angular/core';
import { SiteService } from '../services/site.service';

@Component({
  selector: 'app-site-selector',
  standalone: true,
  template: `
    <div class="flex items-center justify-end gap-2 px-4 py-3">
      <select
        class="h-6 text-[10px] bg-secondary border border-border/50 rounded px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        [value]="selectedSiteId()"
        (change)="selectedSiteId.set($any($event.target).value)">
        @for (s of sites(); track s.id) {
          <option [value]="s.id">{{ s.name }}</option>
        }
      </select>
    </div>
  `,
})
export class SiteSelectorComponent {
  private svc = inject(SiteService);
  readonly sites = this.svc.sites;
  readonly selectedSiteId = this.svc.selectedSiteId;
}
