import { Component, Input, signal, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Transaction } from '../../../core/models';

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, DecimalPipe, TitleCasePipe],
  template: `
    <div class="table-wrap">
      <div class="table-header">
        <h3 class="table-title font-serif">Recent Transactions</h3>
        <div class="table-controls">
          <div class="filter-tabs">
            <button
              *ngFor="let f of filters"
              class="filter-tab"
              [class.active]="activeFilter() === f"
              (click)="setFilter(f)"
            >{{ f }}</button>
          </div>
          <button class="btn-ghost view-all">
            View All
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let txn of filteredTransactions(); let i = index" class="table-row" [style.animation-delay]="i * 0.03 + 's'">
              <td>
                <div class="txn-info">
                  <div class="txn-type-icon" [class]="'icon-' + txn.type">
                    <svg *ngIf="txn.type === 'credit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    <svg *ngIf="txn.type === 'debit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                  </div>
                  <div>
                    <p class="txn-desc">{{ txn.description }}</p>
                    <p class="txn-ref mono">{{ txn.reference }}</p>
                  </div>
                </div>
              </td>
              <td>
                <div class="customer-cell">
                  <div class="cust-avatar">{{ txn.customerName[0] }}</div>
                  <span class="cust-name">{{ txn.customerName }}</span>
                </div>
              </td>
              <td>
                <span class="date-cell">{{ txn.date | date:'MMM d, y' }}</span>
                <span class="time-cell">{{ txn.date | date:'HH:mm' }}</span>
              </td>
              <td>
                <span class="account-num mono">{{ txn.accountNumber }}</span>
              </td>
              <td>
                <span
                  class="amount-cell"
                  [class.credit]="txn.type === 'credit'"
                  [class.debit]="txn.type === 'debit'"
                >
                  {{ txn.type === 'credit' ? '+' : '-' }} GHS {{ txn.amount | number:'1.2-2' }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="'status-' + txn.status">
                  <span class="status-dot"></span>
                  {{ txn.status | titlecase }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="!filteredTransactions().length">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>No {{ activeFilter().toLowerCase() }} transactions found</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-wrap { width: 100%; }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .table-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }

    .table-controls {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }

    .filter-tab {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-family: 'IBM Plex Sans', sans-serif;
      transition: all 0.15s;
    }

    .filter-tab.active {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .view-all {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
    }

    .table-container { overflow-x: auto; border-radius: var(--radius-sm); }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 700px;
    }

    .data-table th {
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.02);
    }

    .table-row {
      animation: fadeUp 0.3s ease both;
      transition: background 0.15s;
    }

    .table-row:hover { background: rgba(255,255,255,0.025); }

    .table-row td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
    }

    .txn-info { display: flex; align-items: center; gap: 10px; }
    .txn-type-icon {
      width: 30px; height: 30px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .icon-credit { background: var(--green-muted); color: var(--green); }
    .icon-debit { background: var(--red-muted); color: var(--red); }

    .txn-desc { font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .txn-ref { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .mono { font-family: 'IBM Plex Mono', monospace; }

    .customer-cell { display: flex; align-items: center; gap: 8px; }
    .cust-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    .cust-name { font-size: 13px; color: var(--text-primary); }

    .date-cell { display: block; font-size: 12.5px; color: var(--text-primary); }
    .time-cell { display: block; font-size: 11px; color: var(--text-muted); margin-top: 1px; font-family: 'IBM Plex Mono', monospace; }

    .account-num { font-size: 11.5px; color: var(--text-secondary); }

    .amount-cell {
      font-weight: 700;
      font-size: 13.5px;
      font-family: 'IBM Plex Mono', monospace;
    }
    .amount-cell.credit { color: var(--green); }
    .amount-cell.debit { color: var(--red); }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-completed { background: var(--green-muted); color: var(--green); }
    .status-pending { background: var(--gold-muted); color: var(--gold-light); }
    .status-failed { background: var(--red-muted); color: var(--red); }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px;
      color: var(--text-muted);
      font-size: 14px;
    }
  `]
})
export class TransactionTableComponent {
  @Input() transactions: Transaction[] = [];

  filters = ['All', 'Credit', 'Debit', 'Pending', 'Failed'];
  activeFilter = signal('All');

  filteredTransactions = computed(() => {
    const f = this.activeFilter();
    return this.transactions.filter(t => {
      if (f === 'All') return true;
      if (f === 'Credit') return t.type === 'credit';
      if (f === 'Debit') return t.type === 'debit';
      if (f === 'Pending') return t.status === 'pending';
      if (f === 'Failed') return t.status === 'failed';
      return true;
    });
  });

  setFilter(f: string) { this.activeFilter.set(f); }
}
