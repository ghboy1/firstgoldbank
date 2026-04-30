import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  template: `
    <div class="stat-card" [class]="'color-' + color">
      <div class="stat-header">
        <div class="stat-icon-wrap">
          <span class="stat-icon" [innerHTML]="icon"></span>
        </div>
        <div class="stat-change" [class.positive]="change >= 0" [class.negative]="change < 0">
          <span class="change-arrow">{{ change >= 0 ? '↑' : '↓' }}</span>
          {{ absChange }}% {{ changeLabel }}
        </div>
      </div>
      <div class="stat-body">
        <p class="stat-value">{{ formattedValue }}</p>
        <p class="stat-title">{{ title }}</p>
      </div>
      <div class="stat-sparkline">
        <svg [attr.viewBox]="'0 0 ' + sparkW + ' 40'" preserveAspectRatio="none">
          <defs>
            <linearGradient [id]="'grad-' + uid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [style.stop-color]="accentColor" stop-opacity="0.35"/>
              <stop offset="100%" [style.stop-color]="accentColor" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path [attr.d]="areaPath" [attr.fill]="'url(#grad-' + uid + ')'" />
          <path [attr.d]="linePath" [attr.stroke]="accentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .stat-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12); }
    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: var(--accent-line);
    }
    .color-gold { --accent-line: linear-gradient(90deg, transparent, var(--gold), transparent); }
    .color-green { --accent-line: linear-gradient(90deg, transparent, var(--green), transparent); }
    .color-blue { --accent-line: linear-gradient(90deg, transparent, var(--blue), transparent); }
    .color-red { --accent-line: linear-gradient(90deg, transparent, var(--red), transparent); }
    .color-purple { --accent-line: linear-gradient(90deg, transparent, var(--purple), transparent); }

    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .stat-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(255,255,255,0.06);
      display: flex; align-items: center; justify-content: center;
    }
    .stat-icon { display: flex; align-items: center; }
    .stat-icon svg { width: 20px; height: 20px; }

    .stat-change {
      display: flex; align-items: center; gap: 3px;
      font-size: 11.5px; font-weight: 600;
      padding: 3px 8px; border-radius: 20px;
    }
    .stat-change.positive { background: var(--green-muted); color: var(--green); }
    .stat-change.negative { background: var(--red-muted); color: var(--red); }
    .change-arrow { font-size: 12px; }

    .stat-value {
      font-size: 26px; font-weight: 700; color: var(--text-primary);
      font-family: 'IBM Plex Mono', monospace; letter-spacing: -0.5px; line-height: 1;
    }
    .stat-title { font-size: 12.5px; color: var(--text-secondary); margin-top: 5px; font-weight: 500; }

    .stat-sparkline {
      position: absolute; bottom: 0; left: 0; right: 0; height: 40px; opacity: 0.7;
    }
    .stat-sparkline svg { width: 100%; height: 100%; }
  `]
})
export class StatCardComponent implements OnInit {
  @Input() title = '';
  @Input() value = 0;
  @Input() change = 0;
  @Input() changeLabel = 'vs last month';
  @Input() icon = '';
  @Input() color: 'gold' | 'green' | 'blue' | 'red' | 'purple' = 'gold';
  @Input() prefix = '';
  @Input() format: 'currency' | 'number' | 'plain' = 'number';

  uid = Math.random().toString(36).slice(2, 8);
  sparkData: number[] = [];
  sparkW = 200;

  get absChange() { return Math.abs(this.change).toFixed(1); }

  get formattedValue(): string {
    if (this.format === 'currency') {
      return 'GHS ' + this.value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return this.value.toLocaleString();
  }

  get accentColor(): string {
    const map: Record<string, string> = {
      gold: '#C9933A', green: '#0DD4A1', blue: '#4D9EFF', red: '#FF5C75', purple: '#9B6DFF'
    };
    return map[this.color];
  }

  get linePath(): string { return this.buildPath(false); }
  get areaPath(): string { return this.buildPath(true); }

  ngOnInit() {
    const trend = this.change >= 0 ? 1 : -1;
    this.sparkData = Array.from({ length: 12 }, (_, i) =>
      20 + i * trend * 1.2 + (Math.random() * 10 - 5)
    );
  }

  buildPath(area: boolean): string {
    const data = this.sparkData;
    if (!data.length) return '';
    const minV = Math.min(...data), maxV = Math.max(...data);
    const range = maxV - minV || 1;
    const h = 40;
    const step = this.sparkW / (data.length - 1);
    const pts = data.map((v, i) => [i * step, h - 4 - ((v - minV) / range) * (h - 8)]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i][0] + pts[i - 1][0]) / 2;
      d += ` C${cx},${pts[i - 1][1]} ${cx},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
    }
    if (area) d += ` L${pts[pts.length-1][0]},${h} L${pts[0][0]},${h} Z`;
    return d;
  }
}
