import {
  Component, inject, signal, computed, effect, OnDestroy,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { SiteService } from '../services/site.service';
import { SolarApiService } from '../services/solar-api.service';
import { ChartCardComponent } from './chart-card.component';
import { months, SolarPoint } from '../mock/mock-solar';

Chart.register(annotationPlugin);

type ViewMode = 'intraday' | 'daily' | 'monthly';

const SOLAR        = 'hsl(45, 95%, 55%)';
const BESS         = 'hsl(200, 70%, 50%)';
const MUTED        = 'hsl(215, 12%, 35%)';
const NOW_C        = 'hsl(0, 72%, 55%)';
const GRID_L       = 'hsl(220, 15%, 18%)';
const TICK_C       = 'hsl(215, 12%, 35%)';
const TOOLTIP_BG   = 'hsl(220, 18%, 13%)';
const TOOLTIP_BORDER = 'hsl(220, 15%, 20%)';

const years = [2024, 2025, 2026, 2027];

@Component({
  selector: 'app-solar-production',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  template: `
    <app-chart-card [title]="cardTitle()" [subtitle]="cardSubtitle()">
      <ng-container controls>
        @if (view() !== 'intraday') {
          <select
            class="h-6 text-[10px] bg-secondary/50 border border-border/50 rounded px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            [value]="year()"
            (change)="year.set(+$any($event.target).value)">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
        }
        @if (view() === 'daily') {
          <select
            class="h-6 text-[10px] bg-secondary/50 border border-border/50 rounded px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            [value]="month()"
            (change)="month.set(+$any($event.target).value)">
            @for (m of months; track $index) { <option [value]="$index">{{ m }}</option> }
          </select>
        }
        <div class="inline-flex items-center gap-0.5 bg-secondary/30 rounded-md p-0.5">
          @for (v of views; track v.key) {
            <button
              class="text-[10px] px-2.5 h-6 rounded-sm transition-colors text-muted-foreground hover:text-foreground"
              [class.bg-primary]="view() === v.key"
              [class.text-primary-foreground]="view() === v.key"
              (click)="view.set(v.key)">
              {{ v.label }}
            </button>
          }
        </div>
      </ng-container>

      <div style="height: 280px; position: relative;">
        <canvas baseChart
          [type]="chartType()"
          [data]="chartData()"
          [options]="chartOptions()">
        </canvas>
      </div>
    </app-chart-card>
  `,
})
export class SolarProductionComponent implements OnDestroy {
  private siteSvc   = inject(SiteService);
  private solarApi  = inject(SolarApiService);

  readonly view  = signal<ViewMode>('monthly');
  readonly year  = signal(2026);
  readonly month = signal(2);
  readonly now   = signal(new Date());

  readonly years  = years;
  readonly months = months;
  readonly views  = [
    { key: 'intraday' as ViewMode, label: 'Intraday' },
    { key: 'daily'    as ViewMode, label: 'Daily' },
    { key: 'monthly'  as ViewMode, label: 'Monthly' },
  ];

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly params = computed(() => ({
    view:  this.view(),
    year:  this.year(),
    month: this.month(),
    day:   this.now().getDate(),
    site:  this.siteSvc.selectedSiteId(),
  }));

  private readonly rawPoints$ = toObservable(this.params).pipe(
    switchMap(({ view, year, month, day, site }) => {
      if (!site) return EMPTY;
      if (view === 'monthly') return this.solarApi.getMonthlySolar(site, year);
      if (view === 'daily')   return this.solarApi.getDailySolar(site, year, month);
      return this.solarApi.getIntradaySolar(site, year, month, day);
    }),
  );

  private readonly rawPoints = toSignal(this.rawPoints$, { initialValue: [] as SolarPoint[] });

  readonly cardTitle = computed(() => {
    const v = this.view(), y = this.year(), m = this.month(), n = this.now();
    if (v === 'monthly') return `Solar Production — ${y}`;
    if (v === 'daily')   return `Solar Production — ${months[m]} ${y}`;
    const d = n.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const hh = String(n.getHours()).padStart(2, '0');
    const mm = String(n.getMinutes()).padStart(2, '0');
    return `Solar Production — Today ${d} · LIVE ${hh}:${mm}`;
  });

  readonly cardSubtitle = computed(() =>
    this.view() === 'intraday' ? 'MW (15-min, real-time)' : 'MWh'
  );

  readonly chartType = computed(() => 'bar' as const);

  readonly chartData = computed((): ChartConfiguration['data'] => {
    const v = this.view(), n = this.now();
    const hasBess = this.siteSvc.hasBess();

    let points = this.rawPoints();
    if (v === 'intraday') {
      const slotsElapsed = Math.floor((n.getHours() * 60 + n.getMinutes()) / 15) + 1;
      points = points.slice(0, slotsElapsed);
    }

    const labels    = points.map(p => p.label);
    const toGrid    = points.map(p => p.toGrid);
    const toBESS    = points.map(p => p.toBESS);
    const potential = points.map(p => p.potential);

    const datasets: ChartDataset[] = v === 'intraday'
      ? [
          {
            type: 'line', label: 'Potential', data: potential,
            borderColor: MUTED, borderDash: [4, 4], borderWidth: 2,
            fill: true, backgroundColor: 'hsla(215,12%,35%,0.1)', pointRadius: 0,
          } as ChartDataset<'line'>,
          {
            type: 'line', label: 'Solar to Grid', data: toGrid,
            borderColor: SOLAR, backgroundColor: 'hsla(45,95%,55%,0.7)',
            fill: 'origin', stack: 'actual', pointRadius: 0,
          } as ChartDataset<'line'>,
          ...(hasBess ? [{
            type: 'line', label: 'Solar to BESS', data: toBESS,
            borderColor: BESS, backgroundColor: 'hsla(200,70%,50%,0.7)',
            fill: '-1', stack: 'actual', pointRadius: 0,
          } as ChartDataset<'line'>] : []),
        ]
      : [
          {
            type: 'bar', label: 'Solar to Grid', data: toGrid,
            backgroundColor: SOLAR, stack: 'a',
          } as ChartDataset<'bar'>,
          ...(hasBess ? [{
            type: 'bar', label: 'Solar to BESS', data: toBESS,
            backgroundColor: BESS, stack: 'a',
          } as ChartDataset<'bar'>] : []),
          {
            type: 'line', label: 'Potential', data: potential,
            borderColor: MUTED, borderDash: [4, 4], borderWidth: 2,
            pointRadius: 0, fill: false,
          } as ChartDataset<'line'>,
        ];

    return { labels, datasets };
  });

  readonly chartOptions = computed((): ChartConfiguration['options'] => {
    const v = this.view(), n = this.now();
    const nowLabel = v === 'intraday'
      ? `${String(n.getHours()).padStart(2, '0')}:${String(Math.floor(n.getMinutes() / 15) * 15).padStart(2, '0')}`
      : '';

    const annotations: Record<string, object> = {};
    if (v === 'intraday' && nowLabel) {
      annotations['nowLine'] = {
        type: 'line', scaleID: 'x', value: nowLabel,
        borderColor: NOW_C, borderWidth: 1, borderDash: [4, 4],
        label: {
          display: true, content: `NOW ${nowLabel}`, color: NOW_C,
          font: { size: 9 }, position: 'start', backgroundColor: 'transparent',
        },
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: TOOLTIP_BG, borderColor: TOOLTIP_BORDER, borderWidth: 1,
          titleColor: 'hsl(210, 20%, 90%)', bodyColor: 'hsl(210, 20%, 80%)',
        },
        annotation: { annotations },
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: GRID_L },
          ticks: {
            color: TICK_C, font: { size: 10 },
            ...(v === 'intraday' ? { autoSkip: true, maxTicksLimit: 12 } : {}),
          },
        },
        y: {
          stacked: v === 'intraday',
          grid: { color: GRID_L },
          ticks: { color: TICK_C, font: { size: 10 } },
        },
      },
    };
  });

  constructor() {
    effect(() => {
      const isIntraday = this.view() === 'intraday';
      if (isIntraday) {
        this.intervalId = setInterval(() => this.now.set(new Date()), 15000);
      } else {
        if (this.intervalId !== null) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  }
}
