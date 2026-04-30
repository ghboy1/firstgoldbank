import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, DecimalPipe } from '@angular/common';
import { QuickActionService } from './quick-action.service';

@Component({
  selector: 'app-cash-deposit-modal',
  standalone: true,
  imports: [FormsModule, NgIf, DecimalPipe],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(13,212,161,0.12);color:var(--green)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </div>
          <div><h2 class="modal-title font-serif">Cash Deposit</h2><p class="modal-sub">Process a cash deposit to any account</p></div>
          <button class="close-btn" (click)="svc.close()">x</button>
        </div>

        <div class="modal-body" *ngIf="!success()">
          <div class="modal-field">
            <label>Account Number *</label>
            <input type="text" [(ngModel)]="form.account" placeholder="e.g. GH-1002-2021-9142"/>
          </div>
          <div class="acct-preview" *ngIf="form.account.length > 10">
            <div class="ap-avatar">KM</div>
            <div><p class="ap-name">Kwame Mensah</p><p class="ap-type">Savings Account | Active</p></div>
            <span class="badge-green-sm" style="margin-left:auto">Verified</span>
          </div>
          <div class="modal-grid-2">
            <div class="modal-field">
              <label>Amount (GHS) *</label>
              <div class="modal-prefix-wrap">
                <span class="modal-prefix">GHS</span>
                <input type="number" [(ngModel)]="form.amount" placeholder="0.00" class="modal-prefix-input"/>
              </div>
            </div>
            <div class="modal-field">
              <label>Denomination</label>
              <select [(ngModel)]="form.denomination">
                <option value="mixed">Mixed Notes</option>
                <option value="200">GHS 200 Notes</option>
                <option value="100">GHS 100 Notes</option>
                <option value="50">GHS 50 Notes</option>
              </select>
            </div>
          </div>
          <div class="modal-field">
            <label>Source of Funds *</label>
            <select [(ngModel)]="form.source">
              <option value="">Select source</option>
              <option value="salary">Salary / Income</option>
              <option value="business">Business Proceeds</option>
              <option value="savings">Personal Savings</option>
              <option value="gift">Gift / Donation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="modal-field">
            <label>Narration</label>
            <input type="text" [(ngModel)]="form.narration" placeholder="Optional deposit description"/>
          </div>
          <div class="teller-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Teller: <strong>Kofi Agyemang</strong> | Limit remaining: <strong>GHS 50,000</strong>
          </div>
        </div>

        <div class="modal-body modal-success-body" *ngIf="success()">
          <div style="color:var(--green);margin-bottom:14px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <h3 class="modal-success-title">Deposit Successful!</h3>
          <p class="modal-success-sub">Cash deposit processed. Receipt generated.</p>
          <div class="modal-success-ref ref-green">REF: DEP{{ refNo }}</div>
          <div class="modal-detail-card">
            <div class="modal-detail-row"><span>Account</span><strong>{{ form.account }}</strong></div>
            <div class="modal-detail-row"><span>Amount</span><strong style="color:var(--green)">+ GHS {{ form.amount | number:'1.2-2' }}</strong></div>
            <div class="modal-detail-row"><span>Teller</span><strong>Kofi Agyemang</strong></div>
            <div class="modal-detail-row"><span>Status</span><span class="badge-green-sm">Completed</span></div>
          </div>
          <button class="print-btn" style="margin-top:14px">🖨 Print Receipt</button>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" (click)="svc.close()">{{ success() ? 'Close' : 'Cancel' }}</button>
          <button class="btn-gold action-btn" *ngIf="!success()" [disabled]="!formValid()" (click)="submit()">
            <span *ngIf="!loading()">Process Deposit</span>
            <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Processing...</span>
          </button>
          <button class="btn-gold action-btn" *ngIf="success()" (click)="reset()">New Deposit</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .acct-preview { display:flex; align-items:center; gap:10px; padding:12px 14px; background:var(--green-muted); border:1px solid rgba(13,212,161,0.2); border-radius:10px; margin-bottom:14px; }
    .ap-avatar { width:34px; height:34px; border-radius:8px; background:rgba(13,212,161,0.2); color:var(--green); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; }
    .ap-name { font-size:13px; font-weight:600; color:var(--text-primary); }
    .ap-type { font-size:11px; color:var(--text-muted); }
    .teller-box { display:flex; align-items:center; gap:6px; padding:10px 14px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; font-size:12px; color:var(--text-muted); }
    .teller-box strong { color:var(--text-primary); }
    .print-btn { padding:8px 20px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; color:var(--text-secondary); cursor:pointer; font-size:13px; font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .print-btn:hover { border-color:var(--gold-border); color:var(--gold); }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class CashDepositModalComponent {
  svc = inject(QuickActionService);
  success = signal(false);
  loading = signal(false);
  refNo = Math.floor(Math.random() * 9000000000) + 1000000000;
  form = { account: '', amount: 0, denomination: 'mixed', source: '', narration: '' };
  formValid() { return !!(this.form.account && this.form.amount > 0 && this.form.source); }
  async submit() { this.loading.set(true); await new Promise(r => setTimeout(r, 1400)); this.loading.set(false); this.success.set(true); }
  reset() { this.success.set(false); this.form = { account: '', amount: 0, denomination: 'mixed', source: '', narration: '' }; }
  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.svc.close(); }
}
