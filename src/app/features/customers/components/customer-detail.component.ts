import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { Customer, KycStatus } from '../../../core/models';
import { CustomerService } from '../../../core/services/customer.service';
import { KycBadgeComponent } from './kyc-badge.component';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, TitleCasePipe, DecimalPipe, KycBadgeComponent],
  template: `
    <div class="detail-backdrop" (click)="onBackdrop($event)">
      <div class="detail-panel">

        <!-- Header -->
        <div class="dp-header">
          <button class="dp-close" (click)="close.emit()">x</button>
          <div class="dp-avatar" [class]="'dav-' + (customer.id.slice(-1))">{{ initials }}</div>
          <div class="dp-title-wrap">
            <h2 class="dp-name font-serif">{{ customer.firstName }} {{ customer.lastName }}</h2>
            <p class="dp-id">{{ customer.id }}</p>
          </div>
          <app-kyc-badge [status]="customer.kycStatus" />
        </div>

        <!-- Status Bar -->
        <div class="dp-statusbar">
          <span class="sb-pill" [class]="'sp-' + customer.status">{{ customer.status | titlecase }}</span>
          <span class="sb-item">{{ customer.branch }}</span>
          <span class="sb-item">{{ customer.accounts.length }} account(s)</span>
          <span class="sb-item">Since {{ customer.registeredDate | date:'mediumDate' }}</span>
        </div>

        <!-- Tabs -->
        <div class="dp-tabs">
          <button *ngFor="let t of tabs" class="dp-tab" [class.active]="activeTab === t" (click)="activeTab = t">{{ t }}</button>
        </div>

        <div class="dp-body">

          <!-- PROFILE TAB -->
          <div *ngIf="activeTab === 'Profile'">
            <p class="section-title">Personal Details</p>
            <div class="info-grid">
              <div class="info-row"><span>Full Name</span><strong>{{ customer.firstName }} {{ customer.lastName }}</strong></div>
              <div class="info-row"><span>Gender</span><strong>{{ customer.gender | titlecase }}</strong></div>
              <div class="info-row"><span>Date of Birth</span><strong>{{ customer.dateOfBirth | date:'mediumDate' }}</strong></div>
              <div class="info-row"><span>Age</span><strong>{{ age }} years</strong></div>
              <div class="info-row"><span>Nationality</span><strong>{{ customer.nationality }}</strong></div>
              <div class="info-row"><span>Occupation</span><strong>{{ customer.occupation }}</strong></div>
              <div class="info-row" *ngIf="customer.tin"><span>TIN</span><strong class="mono">{{ customer.tin }}</strong></div>
              <div class="info-row" *ngIf="customer.monthlyIncome"><span>Monthly Income</span><strong>GHS {{ customer.monthlyIncome | number:'1.0-0' }}</strong></div>
            </div>

            <p class="section-title">Contact Information</p>
            <div class="info-grid">
              <div class="info-row"><span>Email</span><strong>{{ customer.email }}</strong></div>
              <div class="info-row"><span>Phone</span><strong>{{ customer.phone }}</strong></div>
              <div class="info-row"><span>Address</span><strong>{{ customer.address }}</strong></div>
              <div class="info-row"><span>City</span><strong>{{ customer.city }}</strong></div>
              <div class="info-row"><span>Region</span><strong>{{ customer.region }}</strong></div>
            </div>

            <p class="section-title">Banking Details</p>
            <div class="info-grid">
              <div class="info-row"><span>Branch</span><strong>{{ customer.branch }}</strong></div>
              <div class="info-row" *ngIf="customer.relationshipManager"><span>Rel. Manager</span><strong>{{ customer.relationshipManager }}</strong></div>
              <div class="info-row"><span>Last Activity</span><strong>{{ customer.lastActivity | date:'mediumDate' }}</strong></div>
              <div class="info-row"><span>Registered</span><strong>{{ customer.registeredDate | date:'mediumDate' }}</strong></div>
            </div>

            <div class="notes-box" *ngIf="customer.notes">
              <p class="section-title">Notes</p>
              <p class="notes-text">{{ customer.notes }}</p>
            </div>

            <div *ngIf="customer.accounts.length > 0" style="margin-top:16px">
              <p class="section-title">Linked Accounts</p>
              <div class="acct-pills">
                <span *ngFor="let a of customer.accounts" class="acct-pill mono">{{ a }}</span>
              </div>
            </div>
          </div>

          <!-- KYC TAB -->
          <div *ngIf="activeTab === 'KYC Documents'">
            <div class="kyc-summary" [class]="'ks-' + customer.kycStatus">
              <app-kyc-badge [status]="customer.kycStatus" />
              <span class="ks-msg">{{ kycMessage }}</span>
            </div>
            <div *ngFor="let doc of customer.kycDocuments" class="kyc-doc-card">
              <div class="kdc-top">
                <div>
                  <p class="kdc-label">{{ doc.label }}</p>
                  <p class="kdc-date" *ngIf="doc.uploadedDate">Uploaded {{ doc.uploadedDate | date:'mediumDate' }}</p>
                  <p class="kdc-date" *ngIf="!doc.uploadedDate">Not uploaded</p>
                </div>
                <span class="kdc-status" [class]="'kdcs-' + doc.status">{{ doc.status | titlecase }}</span>
              </div>
              <p class="kdc-rejection" *ngIf="doc.rejectionReason">Reason: {{ doc.rejectionReason }}</p>
            </div>
            <div class="kyc-actions">
              <button class="kya-btn kya-approve" (click)="updateKyc('verified')">Approve KYC</button>
              <button class="kya-btn kya-reject" (click)="updateKyc('rejected')">Reject KYC</button>
              <button class="kya-btn kya-pending" (click)="updateKyc('pending')">Mark Pending</button>
            </div>
          </div>

          <!-- ACTIVITY TAB -->
          <div *ngIf="activeTab === 'Activity'">
            <div *ngFor="let ev of activityEvents" class="activity-row">
              <div class="act-dot" [class]="'ad-' + ev.type"></div>
              <div class="act-body">
                <p class="act-title">{{ ev.title }}</p>
                <p class="act-meta">{{ ev.desc }} | {{ ev.time }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="dp-footer">
          <button class="dpf-btn">Edit Profile</button>
          <button class="dpf-btn">+ Open Account</button>
          <button class="dpf-btn dpf-primary">New Transaction</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .detail-backdrop { position:fixed; inset:0; z-index:400; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); display:flex; justify-content:flex-end; animation:fadeIn 0.2s ease; }
    .detail-panel { width:560px; max-width:100vw; height:100vh; background:var(--bg-card); border-left:1px solid var(--border); display:flex; flex-direction:column; animation:slideInRight 0.3s ease; overflow:hidden; }
    .dp-header { display:flex; align-items:center; gap:12px; padding:20px; border-bottom:1px solid var(--border); flex-shrink:0; }
    .dp-close { width:32px; height:32px; border-radius:8px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-muted); cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
    .dp-close:hover { color:var(--red); border-color:var(--red); }
    .dp-avatar { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; flex-shrink:0; }
    .dav-1,.dav-6 { background:rgba(201,147,58,0.15); color:var(--gold); }
    .dav-2,.dav-7 { background:rgba(77,158,255,0.15); color:var(--blue); }
    .dav-3,.dav-8 { background:rgba(13,212,161,0.15); color:var(--green); }
    .dav-4,.dav-9 { background:rgba(155,109,255,0.15); color:var(--purple); }
    .dav-0,.dav-5 { background:rgba(255,92,117,0.15); color:var(--red); }
    .dp-name { font-size:17px; font-weight:700; color:var(--text-primary); }
    .dp-id { font-size:11px; color:var(--text-muted); font-family:'IBM Plex Mono',monospace; }
    .dp-statusbar { display:flex; align-items:center; gap:10px; padding:10px 20px; background:var(--bg-secondary); border-bottom:1px solid var(--border); flex-wrap:wrap; flex-shrink:0; }
    .sb-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .sp-active { background:var(--green-muted); color:var(--green); }
    .sp-inactive { background:rgba(123,141,184,0.1); color:var(--text-muted); }
    .sp-blacklisted { background:var(--red-muted); color:var(--red); }
    .sb-item { font-size:12px; color:var(--text-muted); }
    .dp-tabs { display:flex; gap:2px; padding:12px 20px 0; border-bottom:1px solid var(--border); flex-shrink:0; }
    .dp-tab { padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; background:transparent; border:none; color:var(--text-muted); border-bottom:2px solid transparent; margin-bottom:-1px; font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .dp-tab.active { color:var(--gold); border-bottom-color:var(--gold); }
    .dp-body { flex:1; overflow-y:auto; padding:20px; }
    .section-title { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin:18px 0 10px; }
    .section-title:first-child { margin-top:0; }
    .info-grid { display:flex; flex-direction:column; gap:1px; background:var(--border); border-radius:10px; overflow:hidden; border:1px solid var(--border); }
    .info-row { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--bg-secondary); font-size:13px; }
    .info-row span { color:var(--text-secondary); }
    .info-row strong { color:var(--text-primary); text-align:right; }
    .mono { font-family:'IBM Plex Mono',monospace; }
    .notes-box { background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; padding:14px; }
    .notes-text { font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .acct-pills { display:flex; flex-wrap:wrap; gap:8px; }
    .acct-pill { padding:4px 12px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:20px; font-size:11px; color:var(--text-secondary); }
    .kyc-summary { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:10px; margin-bottom:16px; border:1px solid; }
    .ks-verified { background:var(--green-muted); border-color:rgba(13,212,161,0.2); }
    .ks-pending { background:var(--gold-muted); border-color:rgba(201,147,58,0.2); }
    .ks-rejected { background:var(--red-muted); border-color:rgba(255,92,117,0.2); }
    .ks-not_started { background:var(--bg-secondary); border-color:var(--border); }
    .ks-msg { font-size:12px; color:var(--text-secondary); }
    .kyc-doc-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:10px; }
    .kdc-top { display:flex; align-items:flex-start; justify-content:space-between; }
    .kdc-label { font-size:13px; font-weight:600; color:var(--text-primary); }
    .kdc-date { font-size:11px; color:var(--text-muted); margin-top:3px; }
    .kdc-status { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; flex-shrink:0; }
    .kdcs-uploaded { background:var(--blue-muted); color:var(--blue); }
    .kdcs-verified { background:var(--green-muted); color:var(--green); }
    .kdcs-rejected { background:var(--red-muted); color:var(--red); }
    .kdcs-missing { background:var(--bg-secondary); color:var(--text-muted); border:1px solid var(--border); }
    .kdc-rejection { font-size:11px; color:var(--red); margin-top:6px; }
    .kyc-actions { display:flex; gap:10px; margin-top:16px; }
    .kya-btn { flex:1; padding:10px; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid var(--border); background:transparent; font-family:'IBM Plex Sans',sans-serif; color:var(--text-secondary); }
    .kya-approve:hover { background:var(--green-muted); border-color:var(--green); color:var(--green); }
    .kya-reject:hover { background:var(--red-muted); border-color:var(--red); color:var(--red); }
    .kya-pending:hover { background:var(--gold-muted); border-color:var(--gold); color:var(--gold); }
    .activity-row { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-subtle); }
    .act-dot { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
    .ad-transaction { background:var(--green); }
    .ad-login { background:var(--blue); }
    .ad-kyc { background:var(--gold); }
    .ad-account { background:var(--purple); }
    .act-title { font-size:13px; font-weight:500; color:var(--text-primary); }
    .act-meta { font-size:11px; color:var(--text-muted); margin-top:2px; }
    .dp-footer { display:flex; gap:10px; padding:16px 20px; border-top:1px solid var(--border); flex-shrink:0; }
    .dpf-btn { flex:1; padding:10px; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid var(--border); background:transparent; font-family:'IBM Plex Sans',sans-serif; color:var(--text-secondary); }
    .dpf-btn:hover { border-color:var(--gold-border); color:var(--gold); }
    .dpf-primary { background:var(--gold-muted); border-color:var(--gold-border); color:var(--gold); }
  `]
})
export class CustomerDetailComponent {
  @Input() customer!: Customer;
  @Output() close = new EventEmitter<void>();
  @Output() customerUpdated = new EventEmitter<string>();

  private customerService = inject(CustomerService);

  activeTab = 'Profile';
  tabs = ['Profile', 'KYC Documents', 'Activity'];

  get initials() { return this.customerService.getInitials(this.customer); }
  get age() { return this.customerService.getAge(this.customer); }

  get kycMessage(): string {
    const map: Record<string, string> = {
      verified: 'All documents verified. Customer is fully KYC compliant.',
      pending: 'Documents submitted and under review.',
      rejected: 'KYC verification failed. Documents need re-submission.',
      not_started: 'Customer has not submitted any KYC documents yet.',
    };
    return map[this.customer.kycStatus] ?? '';
  }

  activityEvents = [
    { type: 'transaction', title: 'Transfer Sent', desc: 'GHS 1,200 to ACC-0023', time: '2 hours ago' },
    { type: 'login', title: 'Login', desc: 'Mobile app | Kumasi', time: '3 hours ago' },
    { type: 'kyc', title: 'KYC Document Uploaded', desc: 'National ID submitted', time: '2 days ago' },
    { type: 'transaction', title: 'Cash Deposit', desc: 'GHS 5,000 at Kumasi Central', time: '3 days ago' },
    { type: 'account', title: 'Account Opened', desc: 'Savings account created', time: '1 week ago' },
    { type: 'login', title: 'Login', desc: 'Web browser | Accra', time: '1 week ago' },
    { type: 'transaction', title: 'Withdrawal', desc: 'GHS 800 ATM withdrawal', time: '2 weeks ago' },
    { type: 'kyc', title: 'KYC Started', desc: 'Onboarding form completed', time: '1 month ago' },
  ];

  updateKyc(status: KycStatus) {
    this.customerService.updateKycStatus(this.customer.id, status);
    this.customerUpdated.emit(this.customer.id);
  }

  onBackdrop(e: MouseEvent) {
    if ((e.target as Element).classList.contains('detail-backdrop')) this.close.emit();
  }
}
