import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="bg-card border border-border rounded-lg overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 class="text-sm font-medium">{{ title() }}</h3>
          <p class="text-[10px] text-muted-foreground mt-0.5">{{ subtitle() }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[controls]" />
        </div>
      </div>
      <div class="p-4 relative">
        <ng-content />
        @if (loading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[1px] z-10">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly loading = input(false);
}
