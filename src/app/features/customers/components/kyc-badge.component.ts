import { Component, Input } from '@angular/core';
import { KycStatus } from '../../../core/models';

@Component({
  selector: 'app-kyc-badge',
  standalone: true,
  template: `
    <span class="kyc-badge" [class]="'kyc-' + status">
      <span class="kyc-dot"></span>
      <span class="kyc-label">{{ label }}</span>
    </span>
  `,
  styles: [`
    .kyc-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
    .kyc-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
    .kyc-verified { background:var(--green-muted); color:var(--green); }
    .kyc-verified .kyc-dot { background:var(--green); }
    .kyc-pending { background:var(--gold-muted); color:var(--gold-light); }
    .kyc-pending .kyc-dot { background:var(--gold-light); }
    .kyc-rejected { background:var(--red-muted); color:var(--red); }
    .kyc-rejected .kyc-dot { background:var(--red); }
    .kyc-not_started { background:rgba(123,141,184,0.1); color:var(--text-muted); }
    .kyc-not_started .kyc-dot { background:var(--text-muted); }
  `]
})
export class KycBadgeComponent {
  @Input() status: KycStatus = 'not_started';
  get label() {
    return { verified: 'KYC Verified', pending: 'KYC Pending', rejected: 'KYC Rejected', not_started: 'Not Started' }[this.status] ?? 'Unknown';
  }
}
