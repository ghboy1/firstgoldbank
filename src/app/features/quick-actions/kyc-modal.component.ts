import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { QuickActionService } from './quick-action.service';

@Component({
  selector: 'app-kyc-modal',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(255,92,117,0.12);color:var(--red)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div><h2 class="modal-title font-serif">Customer KYC</h2><p class="modal-sub">Review and update customer identity documents</p></div>
          <button class="close-btn" (click)="svc.close()">x</button>
        </div>

        <div class="modal-body">
          <div class="modal-field">
            <label>Customer ID or Account *</label>
            <input type="text" [(ngModel)]="form.customer" placeholder="e.g. CU-0001 or GH-1002-2021-9142" (ngModelChange)="lookup()"/>
          </div>
          <div class="cust-found" *ngIf="customerFound">
            <div class="cf-avatar">AB</div>
            <div><p class="cf-name">Ama Boateng</p><p class="cf-meta">CU-0001 | Savings | Kumasi Central</p></div>
            <span class="kyc-chip kyc-pending" style="margin-left:auto">Pending</span>
          </div>
          <ng-container *ngIf="customerFound">
            <p class="doc-list-title">Document Checklist</p>
            <div *ngFor="let doc of documents" class="kyc-doc-row">
              <div><p class="kdr-name">{{ doc.name }}</p><p class="kdr-req">{{ doc.required ? 'Required' : 'Optional' }}</p></div>
              <select [(ngModel)]="doc.status" class="doc-status-sel"
                [class.sel-verified]="doc.status === 'verified'"
                [class.sel-rejected]="doc.status === 'rejected'"
                [class.sel-received]="doc.status === 'received'">
                <option value="missing">Missing</option>
                <option value="received">Received</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected ✗</option>
              </select>
            </div>
            <div class="modal-field" style="margin-top:16px">
              <label>KYC Decision</label>
              <div class="decision-row">
                <button class="dec-btn dec-approve" [class.active]="form.decision === 'verified'" (click)="form.decision = 'verified'">Approve</button>
                <button class="dec-btn dec-reject" [class.active]="form.decision === 'rejected'" (click)="form.decision = 'rejected'">Reject</button>
                <button class="dec-btn dec-pending" [class.active]="form.decision === 'pending'" (click)="form.decision = 'pending'">Pending</button>
              </div>
            </div>
            <div class="modal-field" *ngIf="form.decision === 'rejected'">
              <label>Rejection Reason *</label>
              <input type="text" [(ngModel)]="form.reason" placeholder="e.g. ID card appears altered"/>
            </div>
          </ng-container>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" (click)="svc.close()">Cancel</button>
          <button class="btn-gold action-btn" [disabled]="!customerFound || !form.decision" (click)="submit()">
            <span *ngIf="!loading()">Update KYC Status</span>
            <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Saving...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cust-found { display:flex; align-items:center; gap:10px; padding:12px 14px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; margin-bottom:16px; }
    .cf-avatar { width:36px; height:36px; border-radius:10px; background:rgba(255,92,117,0.15); color:var(--red); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }
    .cf-name { font-size:13.5px; font-weight:600; color:var(--text-primary); }
    .cf-meta { font-size:11px; color:var(--text-muted); }
    .kyc-chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .kyc-pending { background:var(--gold-muted); color:var(--gold-light); }
    .doc-list-title { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px; }
    .kyc-doc-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-subtle); }
    .kdr-name { font-size:13px; font-weight:500; color:var(--text-primary); }
    .kdr-req { font-size:11px; color:var(--text-muted); }
    .doc-status-sel { padding:4px 8px; border-radius:6px; font-size:12px; cursor:pointer; height:32px; }
    .sel-verified { border-color:var(--green) !important; color:var(--green); }
    .sel-rejected { border-color:var(--red) !important; color:var(--red); }
    .sel-received { border-color:var(--blue) !important; color:var(--blue); }
    .decision-row { display:flex; gap:10px; }
    .dec-btn { flex:1; padding:10px; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid var(--border); background:transparent; font-family:'IBM Plex Sans',sans-serif; color:var(--text-secondary); }
    .dec-approve:hover, .dec-approve.active { background:var(--green-muted); border-color:var(--green); color:var(--green); }
    .dec-reject:hover, .dec-reject.active { background:var(--red-muted); border-color:var(--red); color:var(--red); }
    .dec-pending:hover, .dec-pending.active { background:var(--gold-muted); border-color:var(--gold); color:var(--gold); }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class KycModalComponent {
  svc = inject(QuickActionService);
  loading = signal(false);
  customerFound = false;
  form = { customer: '', decision: '', reason: '' };
  documents = [
    { name: 'National ID Card', required: true, status: 'received' },
    { name: 'International Passport', required: false, status: 'missing' },
    { name: 'Utility Bill (3 months)', required: true, status: 'received' },
    { name: 'Bank Statement', required: false, status: 'missing' },
    { name: 'Passport Photo', required: true, status: 'verified' },
  ];
  lookup() { this.customerFound = this.form.customer.length > 4; }
  async submit() { this.loading.set(true); await new Promise(r => setTimeout(r, 1200)); this.loading.set(false); this.svc.close(); }
  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.svc.close(); }
}
