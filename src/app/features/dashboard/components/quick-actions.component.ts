import { Component, inject, computed } from '@angular/core';
import { NgFor } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { QuickActionService, QuickActionType } from '../../../features/quick-actions/quick-action.service';
import { UserRole } from '../../../core/models';

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  roles: UserRole[];
  description: string;
  action: QuickActionType;
}

const ACTIONS: QuickAction[] = [
  { label: 'New Transfer', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>', color: '#C9933A', description: 'Send funds between accounts', roles: ['super_admin','branch_manager','bank_teller','customer'], action: 'new_transfer' },
  { label: 'Open Account', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>', color: '#4D9EFF', description: 'Create a new bank account', roles: ['super_admin','branch_manager','bank_teller'], action: 'open_account' },
  { label: 'Cash Deposit', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>', color: '#0DD4A1', description: 'Process cash deposit', roles: ['bank_teller','super_admin','branch_manager'], action: 'cash_deposit' },
  { label: 'Loan Application', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', color: '#9B6DFF', description: 'Submit a loan request', roles: ['super_admin','branch_manager','bank_teller','customer'], action: 'loan_application' },
  { label: 'Account Statement', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>', color: '#FF9F43', description: 'Download account statement', roles: ['super_admin','branch_manager','bank_teller','customer'], action: 'account_statement' },
  { label: 'Customer KYC', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', color: '#FF5C75', description: 'Verify customer identity', roles: ['super_admin','branch_manager','bank_teller'], action: 'customer_kyc' },
];

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="qa-wrap">
      <h3 class="qa-title font-serif">Quick Actions</h3>
      <p class="qa-subtitle">Frequently used operations</p>
      <div class="qa-grid">
        <button *ngFor="let action of visibleActions()" class="qa-btn"
          [style.--action-color]="action.color" (click)="open(action.action)">
          <div class="qa-icon"><span [innerHTML]="action.icon"></span></div>
          <span class="qa-label">{{ action.label }}</span>
          <span class="qa-desc">{{ action.description }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .qa-wrap { width:100%; }
    .qa-title { font-size:16px; font-weight:600; color:var(--text-primary); }
    .qa-subtitle { font-size:12px; color:var(--text-muted); margin-top:3px; margin-bottom:18px; }
    .qa-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .qa-btn { display:flex; flex-direction:column; align-items:flex-start; gap:8px; padding:14px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; cursor:pointer; transition:all 0.2s ease; text-align:left; font-family:'IBM Plex Sans',sans-serif; }
    .qa-btn:hover { border-color:var(--action-color); background:color-mix(in srgb,var(--action-color) 8%,var(--bg-secondary)); transform:translateY(-2px); box-shadow:0 4px 20px color-mix(in srgb,var(--action-color) 20%,transparent); }
    .qa-btn:active { transform:translateY(0); }
    .qa-icon { width:36px; height:36px; border-radius:10px; background:color-mix(in srgb,var(--action-color) 15%,transparent); display:flex; align-items:center; justify-content:center; color:var(--action-color); }
    .qa-icon span { display:flex; align-items:center; }
    .qa-icon :ng-deep svg { width:16px; height:16px; }
    .qa-label { font-size:13px; font-weight:600; color:var(--text-primary); }
    .qa-desc { font-size:11px; color:var(--text-muted); line-height:1.3; }
  `]
})
export class QuickActionsComponent {
  auth = inject(AuthService);
  qa = inject(QuickActionService);
  visibleActions = computed(() => {
    const role = this.auth.role();
    if (!role) return [];
    return ACTIONS.filter(a => a.roles.includes(role));
  });
  open(action: QuickActionType) { this.qa.open(action); }
}
