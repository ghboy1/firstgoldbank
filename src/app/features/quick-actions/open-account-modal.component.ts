import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { QuickActionService } from './quick-action.service';

@Component({
  selector: 'app-open-account-modal',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DecimalPipe],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(77,158,255,0.12);color:var(--blue)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <h2 class="modal-title font-serif">Open New Account</h2>
            <p class="modal-sub">Create a savings, current, or fixed deposit account</p>
          </div>
          <button class="close-btn" (click)="svc.close()">x</button>
        </div>

        <div class="modal-body" *ngIf="step() === 'form'">
          <div class="modal-field">
            <label>Customer ID or Name *</label>
            <input type="text" [(ngModel)]="form.customer" placeholder="Search by CU-XXXX or full name"/>
          </div>
          <div class="modal-field">
            <label>Account Type *</label>
            <div class="acct-type-grid">
              <button *ngFor="let t of accountTypes" class="acct-type-btn"
                [class.selected]="form.accountType === t.value"
                (click)="form.accountType = t.value">
                <span class="at-icon" [innerHTML]="t.icon"></span>
                <span class="at-label">{{ t.label }}</span>
                <span class="at-desc">{{ t.desc }}</span>
              </button>
            </div>
          </div>
          <div class="modal-grid-2">
            <div class="modal-field">
              <label>Currency *</label>
              <select [(ngModel)]="form.currency">
                <option value="GHS">GHS — Ghanaian Cedi</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div class="modal-field">
              <label>Branch *</label>
              <select [(ngModel)]="form.branch">
                <option value="">Select branch</option>
                <option *ngFor="let b of branches" [value]="b">{{ b }}</option>
              </select>
            </div>
          </div>
          <div class="modal-field">
            <label>Initial Deposit ({{ form.currency }}) *</label>
            <div class="modal-prefix-wrap">
              <span class="modal-prefix">{{ form.currency }}</span>
              <input type="number" [(ngModel)]="form.initialDeposit" placeholder="0.00" class="modal-prefix-input"/>
            </div>
          </div>
          <div class="modal-field" *ngIf="form.accountType === 'fixed_deposit'">
            <label>Tenor (months) *</label>
            <select [(ngModel)]="form.tenor">
              <option value="3">3 months — 10.5% p.a.</option>
              <option value="6">6 months — 12.0% p.a.</option>
              <option value="12">12 months — 14.0% p.a.</option>
              <option value="24">24 months — 15.5% p.a.</option>
            </select>
          </div>
          <div class="info-box" *ngIf="form.accountType">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ accountInfo }}
          </div>
          <div class="modal-field">
            <label>Relationship Manager (optional)</label>
            <select [(ngModel)]="form.manager">
              <option value="">Assign manager</option>
              <option *ngFor="let m of managers" [value]="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <div class="modal-body modal-success-body" *ngIf="step() === 'success'">
          <div style="color:var(--blue);margin-bottom:14px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <h3 class="modal-success-title">Account Opened!</h3>
          <p class="modal-success-sub">New account has been created successfully</p>
          <div class="acct-badge">{{ generatedAccountNo }}</div>
          <div class="modal-detail-card">
            <div class="modal-detail-row"><span>Customer</span><strong>{{ form.customer }}</strong></div>
            <div class="modal-detail-row"><span>Account Type</span><strong>{{ form.accountType }}</strong></div>
            <div class="modal-detail-row"><span>Currency</span><strong>{{ form.currency }}</strong></div>
            <div class="modal-detail-row"><span>Initial Deposit</span><strong>{{ form.currency }} {{ form.initialDeposit | number:'1.2-2' }}</strong></div>
            <div class="modal-detail-row"><span>Branch</span><strong>{{ form.branch }}</strong></div>
            <div class="modal-detail-row"><span>Status</span><span class="badge-green-sm">Active</span></div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" (click)="svc.close()">{{ step() === 'success' ? 'Close' : 'Cancel' }}</button>
          <button class="btn-gold action-btn" *ngIf="step() === 'form'" [disabled]="!formValid()" (click)="submit()">
            <span *ngIf="!loading()">Open Account</span>
            <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Creating...</span>
          </button>
          <button class="btn-gold action-btn" *ngIf="step() === 'success'" (click)="step.set('form')">Open Another</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .acct-type-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .acct-type-btn { display:flex; flex-direction:column; gap:4px; align-items:flex-start; padding:14px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; cursor:pointer; text-align:left; transition:all 0.2s; font-family:'IBM Plex Sans',sans-serif; }
    .acct-type-btn:hover { border-color:var(--blue); background:rgba(77,158,255,0.05); }
    .acct-type-btn.selected { border-color:var(--blue); background:var(--blue-muted); }
    .at-icon { color:var(--blue); }
    .at-label { font-size:13px; font-weight:600; color:var(--text-primary); }
    .at-desc { font-size:11px; color:var(--text-muted); }
    .info-box { display:flex; align-items:flex-start; gap:8px; padding:12px; background:var(--blue-muted); border:1px solid rgba(77,158,255,0.2); border-radius:8px; font-size:12.5px; color:var(--blue); margin-bottom:14px; }
    .acct-badge { display:inline-block; background:var(--blue-muted); color:var(--blue); border:1px solid rgba(77,158,255,0.3); padding:6px 16px; border-radius:20px; font-size:14px; margin-bottom:20px; font-family:'IBM Plex Mono',monospace; letter-spacing:1px; }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class OpenAccountModalComponent {
  svc = inject(QuickActionService);
  step = signal<'form' | 'success'>('form');
  loading = signal(false);
  generatedAccountNo = 'GH-' + (Math.floor(1000 + Math.random() * 9000)) + '-2025-' + (Math.floor(1000 + Math.random() * 9000));
  form = { customer: '', accountType: '', currency: 'GHS', branch: '', initialDeposit: 0, tenor: '12', manager: '' };
  accountTypes = [
    { value: 'savings', label: 'Savings', desc: '8.5% p.a. interest', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' },
    { value: 'current', label: 'Current', desc: 'Unlimited transactions', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' },
    { value: 'fixed_deposit', label: 'Fixed Deposit', desc: 'Up to 15.5% p.a.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
    { value: 'joint', label: 'Joint Account', desc: 'Two or more holders', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>' },
  ];
  branches = ['Kumasi Central','Accra Head Office','Tema Industrial','Takoradi Port','Tamale North','Cape Coast','Sunyani'];
  managers = ['Abena Osei-Bonsu','Kweku Darko','Afia Mensah','Joseph Asante','Nana Appiah'];
  get accountInfo(): string {
    const map: Record<string, string> = {
      savings: 'Minimum opening balance: GHS 100. Interest credited monthly.',
      current: 'Minimum opening balance: GHS 500. Cheque book available.',
      fixed_deposit: 'Funds locked for chosen tenor. Early withdrawal incurs 2% penalty.',
      joint: 'All account holders must be present for account opening.'
    };
    return map[this.form.accountType] ?? '';
  }
  formValid() { return !!(this.form.customer && this.form.accountType && this.form.branch && this.form.initialDeposit > 0); }
  async submit() { this.loading.set(true); await new Promise(r => setTimeout(r, 1500)); this.loading.set(false); this.step.set('success'); }
  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.svc.close(); }
}
