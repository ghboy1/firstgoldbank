import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NgFor } from '@angular/common';
import { ChartPoint } from '../../../core/models';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="chart-wrap">
      <div class="chart-header">
        <div>
          <h3 class="chart-title font-serif">{{ title }}</h3>
          <p class="chart-subtitle">{{ subtitle }}</p>
        </div>
        <div class="chart-legend">
          <span class="legend-dot" [style.background]="color"></span>
          <span class="legend-label">{{ legendLabel }}</span>
        </div>
      </div>

      <!-- Y-axis labels + Chart -->
      <div class="chart-body">
        <div class="y-labels">
          <span *ngFor="let y of yLabels">{{ y }}</span>
        </div>

        <div class="chart-svg-wrap">
          <svg [attr.viewBox]="'0 0 ' + svgW + ' ' + svgH" preserveAspectRatio="none" class="chart-svg">
            <defs>
              <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [style.stop-color]="color" stop-opacity="0.25"/>
                <stop offset="100%" [style.stop-color]="color" stop-opacity="0.01"/>
              </linearGradient>
              <!-- Vertical grid lines -->
            </defs>

            <!-- Grid lines -->
            <line
              *ngFor="let y of gridYs"
              x1="0" [attr.y1]="y" [attr.x2]="svgW" [attr.y2]="y"
              stroke="rgba(255,255,255,0.04)" stroke-width="1"
            />

            <!-- Area fill -->
            <path [attr.d]="areaPath" fill="url(#area-grad)" />

            <!-- Line -->
            <path [attr.d]="linePath" [attr.stroke]="color" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Data points -->
            <circle
              *ngFor="let pt of points; let i = index"
              [attr.cx]="pt[0]" [attr.cy]="pt[1]" r="3.5"
              [attr.fill]="color" stroke="var(--bg-card)" stroke-width="2"
              class="data-point"
            />
          </svg>

          <!-- X-axis labels -->
          <div class="x-labels">
            <span *ngFor="let d of data">{{ d.label }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrap {
      width: 100%;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .chart-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .chart-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

    .chart-legend {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px; color: var(--text-secondary);
    }

    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

    .chart-body {
      display: flex;
      gap: 10px;
    }

    .y-labels {
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-muted);
      font-family: 'IBM Plex Mono', monospace;
      padding-bottom: 20px;
      min-width: 44px;
      text-align: right;
    }

    .chart-svg-wrap {
      flex: 1;
      min-width: 0;
    }

    .chart-svg {
      width: 100%;
      height: 160px;
      display: block;
      overflow: visible;
    }

    .data-point {
      transition: r 0.15s;
      cursor: pointer;
    }
    .data-point:hover { r: 5; }

    .x-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 10px;
      color: var(--text-muted);
      font-family: 'IBM Plex Mono', monospace;
    }
  `]
})
export class AreaChartComponent implements OnChanges {
  @Input() data: ChartPoint[] = [];
  @Input() title = '';
  @Input() subtitle = '';
  @Input() color = '#C9933A';
  @Input() legendLabel = '';
  @Input() format: 'currency' | 'number' = 'number';

  svgW = 600;
  svgH = 160;
  pad = { top: 8, bottom: 4, left: 4, right: 4 };

  points: [number, number][] = [];
  linePath = '';
  areaPath = '';
  yLabels: string[] = [];
  gridYs: number[] = [];

  ngOnChanges() {
    this.compute();
  }

  compute() {
    if (!this.data.length) return;
    const vals = this.data.map(d => d.value);
    const minV = Math.min(...vals) * 0.9;
    const maxV = Math.max(...vals) * 1.05;
    const range = maxV - minV || 1;
    const w = this.svgW - this.pad.left - this.pad.right;
    const h = this.svgH - this.pad.top - this.pad.bottom;
    const step = w / (this.data.length - 1);

    this.points = this.data.map((d, i) => [
      this.pad.left + i * step,
      this.pad.top + h - ((d.value - minV) / range) * h
    ]);

    let line = `M${this.points[0][0]},${this.points[0][1]}`;
    for (let i = 1; i < this.points.length; i++) {
      const cx = (this.points[i][0] + this.points[i - 1][0]) / 2;
      line += ` C${cx},${this.points[i - 1][1]} ${cx},${this.points[i][1]} ${this.points[i][0]},${this.points[i][1]}`;
    }
    this.linePath = line;

    const last = this.points[this.points.length - 1];
    this.areaPath = line + ` L${last[0]},${this.svgH} L${this.points[0][0]},${this.svgH} Z`;

    // Y-axis labels
    const ticks = 4;
    this.yLabels = Array.from({ length: ticks + 1 }, (_, i) => {
      const v = minV + (maxV - minV) * (i / ticks);
      return this.format === 'currency'
        ? (v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'K')
        : v.toLocaleString();
    });

    this.gridYs = Array.from({ length: 5 }, (_, i) =>
      this.pad.top + (h * i) / 4
    );
  }
}
