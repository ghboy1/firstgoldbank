import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { QuickActionService } from './quick-action.service';

@Component({
  selector: 'app-statement-modal',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(255,159,67,0.12);color:#FF9F43">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div><h2 class="modal-title font-serif">Account Statement</h2><p class="modal-sub">Generate and download account statements</p></div>
          <button class="close-btn" (click)="svc.close()">x</button>
        </div>

        <div class="modal-body" *ngIf="!generated()">
          <div class="modal-field">
            <label>Account Number *</label>
            <select [(ngModel)]="form.account">
              <option value="">Select account</option>
              <option value="GH-1004-2021-8821">Savings — GH-1004-2021-8821</option>
              <option value="GH-1004-2021-8822">Current — GH-1004-2021-8822</option>
              <option value="GH-1004-2021-8823">Fixed Deposit — GH-1004-2021-8823</option>
            </select>
          </div>
          <div class="modal-grid-2">
            <div class="modal-field"><label>From Date *</label><input type="date" [(ngModel)]="form.from"/></div>
            <div class="modal-field"><label>To Date *</label><input type="date" [(ngModel)]="form.to" [max]="today"/></div>
          </div>
          <div class="modal-field">
            <label>Statement Format</label>
            <div class="format-grid">
              <button *ngFor="let f of formats" class="format-btn" [class.selected]="form.format === f.value" (click)="form.format = f.value">
                <span class="fmt-icon">{{ f.icon }}</span>
                <span class="fmt-label">{{ f.label }}</span>
              </button>
            </div>
          </div>
          <div class="modal-field">
            <label>Delivery Method</label>
            <div class="delivery-opts">
              <label class="radio-opt"><input type="radio" [(ngModel)]="form.delivery" value="download"/> Download now</label>
              <label class="radio-opt"><input type="radio" [(ngModel)]="form.delivery" value="email"/> Send to email</label>
              <label class="radio-opt"><input type="radio" [(ngModel)]="form.delivery" value="branch"/> Pick up at branch</label>
            </div>
          </div>
        </div>

        <div class="modal-body modal-success-body" *ngIf="generated()">
          <div style="color:#FF9F43;margin-bottom:14px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="12 17 12 11"/><polyline points="9 14 12 17 15 14"/></svg>
          </div>
          <h3 class="modal-success-title">Statement Ready!</h3>
          <p class="modal-success-sub">Your account statement has been generated</p>
          <div class="file-card">
            <div class="fc-icon">📄</div>
            <div class="fc-info">
              <p class="fc-name">Statement_{{ form.account }}_{{ form.from }}_{{ form.to }}.{{ form.format }}</p>
              <p class="fc-size">{{ form.format.toUpperCase() }} | ~{{ form.format === 'pdf' ? '248 KB' : '45 KB' }}</p>
            </div>
            <button class="fc-dl-btn">⬇ Download</button>
          </div>
          <p class="email-note" *ngIf="form.delivery === 'email'">A copy was sent to the customer's registered email.</p>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" (click)="svc.close()">{{ generated() ? 'Close' : 'Cancel' }}</button>
          <button class="btn-gold action-btn" *ngIf="!generated()" [disabled]="!formValid()" (click)="generate()">
            <span *ngIf="!loading()">Generate Statement</span>
            <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Generating...</span>
          </button>
          <button class="btn-gold action-btn" *ngIf="generated()" (click)="generated.set(false)">New Statement</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .format-grid { display:flex; gap:10px; }
    .format-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; cursor:pointer; font-family:'IBM Plex Sans',sans-serif; font-size:12px; font-weight:500; color:var(--text-secondary); transition:all 0.15s; }
    .format-btn:hover { border-color:rgba(255,159,67,0.5); color:#FF9F43; }
    .format-btn.selected { border-color:#FF9F43; background:rgba(255,159,67,0.08); color:#FF9F43; }
    .fmt-icon { font-size:20px; }
    .fmt-label { font-size:12px; }
    .delivery-opts { display:flex; flex-direction:column; gap:10px; }
    .radio-opt { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary); cursor:pointer; }
    .radio-opt input { accent-color:#FF9F43; }
    .file-card { display:flex; align-items:center; gap:12px; padding:14px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; text-align:left; margin-bottom:14px; }
    .fc-icon { font-size:28px; flex-shrink:0; }
    .fc-info { flex:1; min-width:0; }
    .fc-name { font-size:11px; font-weight:500; color:var(--text-primary); word-break:break-all; font-family:'IBM Plex Mono',monospace; }
    .fc-size { font-size:11px; color:var(--text-muted); margin-top:3px; }
    .fc-dl-btn { padding:6px 14px; background:var(--gold-muted); border:1px solid var(--gold-border); color:var(--gold); border-radius:8px; cursor:pointer; font-size:12px; white-space:nowrap; transition:all 0.15s; font-family:'IBM Plex Sans',sans-serif; }
    .fc-dl-btn:hover { background:var(--gold); color:white; }
    .email-note { font-size:12px; color:var(--text-muted); }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class StatementModalComponent {
  svc = inject(QuickActionService);
  generated = signal(false);
  loading = signal(false);
  today = new Date().toISOString().split('T')[0];
  form = { account: '', from: '', to: new Date().toISOString().split('T')[0], format: 'pdf', delivery: 'download' };
  formats = [{ value: 'pdf', label: 'PDF', icon: '📄' }, { value: 'xlsx', label: 'Excel', icon: '📊' }, { value: 'csv', label: 'CSV', icon: '📋' }];
  formValid() { return !!(this.form.account && this.form.from && this.form.to); }
  async generate() { this.loading.set(true); await new Promise(r => setTimeout(r, 1200)); this.loading.set(false); this.generated.set(true); }
  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.svc.close(); }
}
