import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, DecimalPipe } from '@angular/common';
import { QuickActionService } from './quick-action.service';

@Component({
  selector: 'app-loan-modal',
  standalone: true,
  imports: [FormsModule, NgIf, DecimalPipe],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(155,109,255,0.12);color:var(--purple)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div><h2 class="modal-title font-serif">Loan Application</h2><p class="modal-sub">Submit a new loan request for processing</p></div>
          <button class="close-btn" (click)="svc.close()">x</button>
        </div>

        <div class="modal-body" *ngIf="!success()">
          <div class="modal-grid-2">
            <div class="modal-field">
              <label>Customer ID *</label>
              <input type="text" [(ngModel)]="form.customer" placeholder="e.g. CU-0001"/>
            </div>
            <div class="modal-field">
              <label>Loan Type *</label>
              <select [(ngModel)]="form.loanType" (ngModelChange)="onTypeChange()">
                <option value="">Select type</option>
                <option value="personal">Personal Loan</option>
                <option value="business">Business Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="vehicle">Vehicle Loan</option>
                <option value="education">Education Loan</option>
                <option value="emergency">Emergency Loan</option>
              </select>
            </div>
          </div>
          <div class="modal-grid-2">
            <div class="modal-field">
              <label>Loan Amount (GHS) *</label>
              <div class="modal-prefix-wrap">
                <span class="modal-prefix">GHS</span>
                <input type="number" [(ngModel)]="form.amount" placeholder="0.00" class="modal-prefix-input" (ngModelChange)="calc()"/>
              </div>
            </div>
            <div class="modal-field">
              <label>Tenure *</label>
              <select [(ngModel)]="form.tenure" (ngModelChange)="calc()">
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="60">60 months</option>
              </select>
            </div>
          </div>
          <div class="modal-field">
            <label>Purpose of Loan *</label>
            <input type="text" [(ngModel)]="form.purpose" placeholder="e.g. Purchase of commercial vehicle"/>
          </div>
          <div class="modal-field">
            <label>Collateral / Security</label>
            <input type="text" [(ngModel)]="form.collateral" placeholder="e.g. Land title deed, vehicle, guarantor"/>
          </div>
          <div class="loan-calc" *ngIf="form.amount > 0">
            <p class="calc-title">Loan Summary</p>
            <div class="calc-grid">
              <div class="calc-item"><p class="calc-val">{{ interestRate }}%</p><p class="calc-key">Interest p.a.</p></div>
              <div class="calc-item"><p class="calc-val">GHS {{ monthlyPayment | number:'1.2-2' }}</p><p class="calc-key">Monthly Payment</p></div>
              <div class="calc-item"><p class="calc-val">GHS {{ totalRepayable | number:'1.2-2' }}</p><p class="calc-key">Total Repayable</p></div>
              <div class="calc-item"><p class="calc-val">GHS {{ totalInterest | number:'1.2-2' }}</p><p class="calc-key">Total Interest</p></div>
            </div>
          </div>
        </div>

        <div class="modal-body modal-success-body" *ngIf="success()">
          <div style="color:var(--purple);margin-bottom:14px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3 class="modal-success-title">Application Submitted!</h3>
          <p class="modal-success-sub">Loan application is under review</p>
          <div class="modal-success-ref ref-purple">REF: LN{{ refNo }}</div>
          <div class="modal-detail-card">
            <div class="modal-detail-row"><span>Customer</span><strong>{{ form.customer }}</strong></div>
            <div class="modal-detail-row"><span>Amount</span><strong>GHS {{ form.amount | number:'1.2-2' }}</strong></div>
            <div class="modal-detail-row"><span>Type</span><strong>{{ form.loanType }}</strong></div>
            <div class="modal-detail-row"><span>Status</span><span class="badge-pending-sm">Under Review</span></div>
            <div class="modal-detail-row"><span>Decision by</span><strong>Within 2 business days</strong></div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" (click)="svc.close()">{{ success() ? 'Close' : 'Cancel' }}</button>
          <button class="btn-gold action-btn" *ngIf="!success()" [disabled]="!formValid()" (click)="submit()">
            <span *ngIf="!loading()">Submit Application</span>
            <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Submitting...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-calc { background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; padding:16px; margin-top:4px; }
    .calc-title { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; }
    .calc-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .calc-item { text-align:center; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:12px; }
    .calc-val { font-size:15px; font-weight:700; color:var(--text-primary); font-family:'IBM Plex Mono',monospace; }
    .calc-key { font-size:11px; color:var(--text-muted); margin-top:4px; }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class LoanModalComponent {
  svc = inject(QuickActionService);
  success = signal(false);
  loading = signal(false);
  refNo = Math.floor(Math.random() * 9000000000) + 1000000000;
  form = { customer: '', loanType: '', amount: 0, tenure: '12', purpose: '', collateral: '' };
  interestRate = 22;
  monthlyPayment = 0;
  totalRepayable = 0;
  totalInterest = 0;
  onTypeChange() {
    const rates: Record<string, number> = { personal: 25, business: 22, mortgage: 18, vehicle: 20, education: 16, emergency: 28 };
    this.interestRate = rates[this.form.loanType] ?? 22;
    this.calc();
  }
  calc() {
    if (this.form.amount <= 0) return;
    const r = this.interestRate / 100 / 12;
    const n = parseInt(this.form.tenure);
    this.monthlyPayment = this.form.amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    this.totalRepayable = this.monthlyPayment * n;
    this.totalInterest = this.totalRepayable - this.form.amount;
  }
  formValid() { return !!(this.form.customer && this.form.loanType && this.form.amount > 0 && this.form.purpose); }
  async submit() { this.loading.set(true); await new Promise(r => setTimeout(r, 1600)); this.loading.set(false); this.success.set(true); }
  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.svc.close(); }
}
