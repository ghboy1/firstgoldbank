import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { DashboardData } from '../../core/models';
import { StatCardComponent } from './components/stat-card.component';
import { AreaChartComponent } from './components/area-chart.component';
import { TransactionTableComponent } from './components/transaction-table.component';
import { DonutChartComponent } from './components/donut-chart.component';
import { QuickActionsComponent } from './components/quick-actions.component';

interface StatCardDef {
  title: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'gold' | 'green' | 'blue' | 'red' | 'purple';
  format: 'currency' | 'number' | 'plain';
  prefix: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgFor,
    StatCardComponent, AreaChartComponent,
    TransactionTableComponent, DonutChartComponent, QuickActionsComponent
  ],
  template: `
    <div class="dashboard">

      <!-- Welcome Banner -->
      <div class="welcome-banner animate-fade-up stagger-1">
        <div class="welcome-text">
          <p class="welcome-greeting">{{ greeting }}, {{ firstName }}</p>
          <h2 class="welcome-title font-serif">Here's what's happening at <span class="gold-gradient">FirstGold Bank</span> today</h2>
        </div>
        <div class="welcome-actions">
          <div class="live-indicator">
            <span class="live-dot"></span>
            <span>Live Data</span>
          </div>
          <button class="btn-gold welcome-btn" (click)="refreshData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Role Banner -->
      <div class="role-context animate-fade-up stagger-2"
           [style.border-color]="auth.roleColor + '30'"
           [style.background]="auth.roleColor + '08'">
        <div class="rc-left">
          <span class="rc-dot" [style.background]="auth.roleColor"></span>
          <span class="rc-role" [style.color]="auth.roleColor">{{ auth.displayRole }}</span>
          <span class="rc-sep">|</span>
          <span class="rc-branch">{{ auth.currentUser()?.branch || auth.currentUser()?.accountNumber }}</span>
        </div>
        <div class="rc-right">
          <span class="rc-note">{{ roleNote }}</span>
        </div>
      </div>

      <!-- KPI Stats -->
      <div class="stats-grid animate-fade-up stagger-2">
        <app-stat-card
          *ngFor="let card of statCards()"
          [title]="card.title"
          [value]="card.value"
          [change]="card.change"
          [changeLabel]="card.changeLabel"
          [icon]="card.icon"
          [color]="card.color"
          [format]="card.format"
          [prefix]="card.prefix"
        />
      </div>

      <!-- Charts Row -->
      <div class="charts-row animate-fade-up stagger-3">
        <div class="card chart-card chart-large">
          <app-area-chart
            [data]="dashData()?.revenueChart || []"
            title="Revenue Overview"
            subtitle="Monthly revenue trend — current fiscal year"
            color="#C9933A"
            legendLabel="Revenue (GHS)"
            format="currency"
          />
        </div>
        <div class="card chart-card chart-small">
          <app-donut-chart [data]="accountSummary()" />
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-row animate-fade-up stagger-4">
        <div class="card txn-card">
          <app-transaction-table [transactions]="dashData()?.recentTransactions || []" />
        </div>
        <div class="right-col">
          <div class="card side-card">
            <app-quick-actions />
          </div>
          <div class="card side-card">
            <app-area-chart
              [data]="dashData()?.transactionChart || []"
              title="Transaction Volume"
              subtitle="Daily count — last 14 days"
              color="#4D9EFF"
              legendLabel="Transactions"
              format="number"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 24px; }

    .welcome-banner {
      display: flex; justify-content: space-between; align-items: flex-end;
      gap: 16px; flex-wrap: wrap;
    }
    .welcome-greeting { font-size: 13px; color: var(--text-muted); letter-spacing: 0.3px; }
    .welcome-title {
      font-size: 22px; font-weight: 600; color: var(--text-primary);
      margin-top: 5px; line-height: 1.3; max-width: 560px;
    }
    .welcome-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

    .live-indicator {
      display: flex; align-items: center; gap: 7px; padding: 6px 12px;
      background: var(--green-muted); border: 1px solid rgba(13,212,161,0.2);
      border-radius: 20px; font-size: 12px; color: var(--green); font-weight: 500;
    }
    .live-dot {
      width: 7px; height: 7px; border-radius: 50%; background: var(--green);
      animation: pulse-green 2s infinite;
    }
    @keyframes pulse-green {
      0%,100% { box-shadow: 0 0 0 0 rgba(13,212,161,0.5); }
      50% { box-shadow: 0 0 0 6px rgba(13,212,161,0); }
    }
    .welcome-btn {
      padding: 9px 18px; border-radius: 10px; font-size: 13px;
      display: flex; align-items: center; gap: 7px;
    }

    .role-context {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 16px; border: 1px solid; border-radius: 10px;
      flex-wrap: wrap; gap: 8px;
    }
    .rc-left { display: flex; align-items: center; gap: 8px; }
    .rc-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .rc-role { font-size: 12px; font-weight: 600; }
    .rc-sep { color: var(--text-muted); font-size: 12px; }
    .rc-branch { font-size: 12px; color: var(--text-secondary); }
    .rc-note { font-size: 12px; color: var(--text-muted); }

    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }

    .charts-row { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
    @media (max-width: 1100px) { .charts-row { grid-template-columns: 1fr; } }

    .chart-card { padding: 24px; }

    .bottom-row { display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }
    @media (max-width: 1100px) { .bottom-row { grid-template-columns: 1fr; } }

    .txn-card { padding: 24px; }
    .right-col { display: flex; flex-direction: column; gap: 16px; }
    .side-card { padding: 22px; }

    .card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius);
    }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private mockData = inject(MockDataService);

  dashData = signal<DashboardData | null>(null);

  accountSummary = computed(() => this.dashData()?.accountSummary ?? []);

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get firstName(): string {
    return this.auth.currentUser()?.name.split(' ')[0] ?? '';
  }

  get roleNote(): string {
    const notes: Record<string, string> = {
      super_admin: 'You have full access to all system modules and configurations.',
      branch_manager: 'Viewing Kumasi Central Branch data and team performance.',
      bank_teller: 'Your teller session is active. Cash limit: GHS 50,000.',
      customer: 'Your personal banking portal — secure & encrypted.'
    };
    return notes[this.auth.role() ?? ''] ?? '';
  }

  statCards = computed((): StatCardDef[] => {
    const data = this.dashData();
    if (!data) return [];
    const s = data.stats;
    const role = this.auth.role();

    if (role === 'customer') {
      return [
        { title: 'Total Balance', value: s.totalAssets, change: 4.2, changeLabel: 'this month',
          color: 'gold', format: 'currency', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>` },
        { title: 'My Transactions', value: s.dailyTransactions, change: 12.5, changeLabel: 'this month',
          color: 'blue', format: 'number', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>` },
        { title: 'Active Accounts', value: 3, change: 0, changeLabel: 'no change',
          color: 'green', format: 'number', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>` },
        { title: 'Pending Approvals', value: s.pendingApprovals, change: -1, changeLabel: 'vs last week',
          color: 'red', format: 'number', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` }
      ];
    }

    if (role === 'bank_teller') {
      return [
        { title: "Today's Transactions", value: s.dailyTransactions, change: 8.3, changeLabel: 'vs yesterday',
          color: 'gold', format: 'number', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>` },
        { title: 'Total Volume (GHS)', value: 284500, change: 15.2, changeLabel: 'vs yesterday',
          color: 'green', format: 'currency', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
        { title: 'Customers Served', value: 31, change: 5.2, changeLabel: 'vs yesterday',
          color: 'blue', format: 'number', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
        { title: 'Cash on Hand (GHS)', value: 32800, change: -3.1, changeLabel: 'vs start of day',
          color: 'purple', format: 'currency', prefix: '',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` }
      ];
    }

    return [
      { title: role === 'branch_manager' ? 'Branch Assets (GHS)' : 'Total Assets (GHS)',
        value: s.totalAssets, change: 6.8, changeLabel: 'vs last month',
        color: 'gold', format: 'currency', prefix: '',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
      { title: 'Total Customers', value: s.totalCustomers, change: 3.4, changeLabel: 'vs last month',
        color: 'blue', format: 'number', prefix: '',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
      { title: 'Daily Transactions', value: s.dailyTransactions, change: 9.1, changeLabel: 'vs yesterday',
        color: 'green', format: 'number', prefix: '',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
      { title: 'Pending Approvals', value: s.pendingApprovals, change: -12.5, changeLabel: 'vs yesterday',
        color: 'red', format: 'number', prefix: '',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` }
    ];
  });

  ngOnInit() { this.loadData(); }

  loadData() {
    const role = this.auth.role();
    if (role) this.dashData.set(this.mockData.getDashboardData(role));
  }

  refreshData() {
    this.dashData.set(null);
    setTimeout(() => this.loadData(), 400);
  }
}
