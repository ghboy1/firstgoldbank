import { Component, Input, OnChanges, signal } from '@angular/core';
import { NgFor, DecimalPipe } from '@angular/common';

interface Segment {
  type: string;
  count: number;
  totalBalance: number;
  color: string;
  pct: number;
  offset: number;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [NgFor, DecimalPipe],
  template: `
    <div class="donut-wrap">
      <h3 class="chart-title font-serif">Account Portfolio</h3>
      <p class="chart-subtitle">Distribution by account type</p>

      <div class="donut-body">
        <div class="donut-svg-wrap">
          <svg viewBox="0 0 200 200" class="donut-svg">
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="28"/>

            <circle
              *ngFor="let seg of segments(); let i = index"
              cx="100" cy="100" r="70"
              fill="none"
              [attr.stroke]="seg.color"
              stroke-width="28"
              [attr.stroke-dasharray]="seg.pct * 4.4 + ' ' + ((1 - seg.pct) * 4.4 + 4.4)"
              [attr.stroke-dashoffset]="-(seg.offset * 4.4) + 110"
              stroke-linecap="butt"
              style="transition: stroke-dasharray 0.8s ease"
            />

            <!-- Center text -->
            <text x="100" y="94" text-anchor="middle" fill="#EEF2FF" font-size="22" font-weight="700" font-family="'IBM Plex Mono'">
              {{ totalAccounts() | number }}
            </text>
            <text x="100" y="112" text-anchor="middle" fill="#7B8DB8" font-size="10" font-family="'IBM Plex Sans'">
              Total Accounts
            </text>
          </svg>
        </div>

        <div class="donut-legend">
          <div *ngFor="let seg of segments()" class="legend-row">
            <div class="legend-color-bar" [style.background]="seg.color"></div>
            <div class="legend-text">
              <div class="legend-type">{{ seg.type }}</div>
              <div class="legend-detail">
                <span class="legend-count">{{ seg.count | number }}</span>
                <span class="legend-bal">GHS {{ formatBal(seg.totalBalance) }}</span>
              </div>
            </div>
            <div class="legend-pct" [style.color]="seg.color">{{ (seg.pct * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .donut-wrap { width: 100%; }
    .chart-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .chart-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 3px; margin-bottom: 20px; }

    .donut-body {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .donut-svg-wrap {
      flex-shrink: 0;
      width: 160px;
    }
    .donut-svg { width: 100%; height: 100%; }

    .donut-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .legend-color-bar {
      width: 3px;
      height: 36px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .legend-text { flex: 1; min-width: 0; }
    .legend-type { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .legend-detail { display: flex; gap: 8px; margin-top: 2px; }
    .legend-count { font-size: 11px; color: var(--text-secondary); }
    .legend-bal {
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'IBM Plex Mono', monospace;
    }

    .legend-pct {
      font-size: 13px;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
    }
  `]
})
export class DonutChartComponent implements OnChanges {
  @Input() data: { type: string; count: number; totalBalance: number; color: string }[] = [];

  segments = signal<Segment[]>([]);
  totalAccounts = signal(0);

  ngOnChanges() {
    const total = this.data.reduce((s, d) => s + d.count, 0);
    this.totalAccounts.set(total);
    let offset = 0;
    this.segments.set(this.data.map(d => {
      const pct = d.count / total;
      const seg = { ...d, pct, offset };
      offset += pct;
      return seg;
    }));
  }

  formatBal(v: number): string {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(0) + 'K';
    return v.toFixed(0);
  }
}
