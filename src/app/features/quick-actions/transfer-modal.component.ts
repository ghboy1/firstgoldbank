import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { QuickActionService } from './quick-action.service';

type Step = 'form' | 'confirm' | 'success';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DecimalPipe],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(201,147,58,0.12);color:var(--gold)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div>
            <h2 class="modal-title font-serif">New Transfer</h2>
            <p class="modal-sub">Send funds between accounts securely</p>
          </div>
          <button class="close-btn" (click)="svc.close()">x</button>
        </div>

        <div class="modal-body" *ngIf="step() === 'form'">
          <div class="modal-field">
            <label>Transfer Type</label>
            <select [(ngModel)]="form.type">
              <option value="internal">Internal (Same Bank)</option>
              <option value="external">External (Other Bank)</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
          <div class="modal-grid-2">
            <div class="modal-field">
              <label>From Account *</label>
              <select [(ngModel)]="form.fromAccount">
                <option value="">Select account</option>
                <option *ngFor="let a of myAccounts" [value]="a.number">{{ a.label }}</option>
              </select>
            </div>
            <div class="modal-field">
              <label>Recipient Account *</label>
              <input type="text" [(ngModel)]="form.toAccount" placeholder="e.g. GH-1002-2021-9142"/>
            </div>
          </div>
          <div class="modal-field" *ngIf="form.type === 'external'">
            <label>Recipient Bank</label>
            <select [(ngModel)]="form.recipientBank">
              <option value="">Select bank</option>
              <option *ngFor="let b of banks" [value]="b">{{ b }}</option>
            </select>
          </div>
          <div class="modal-field" *ngIf="form.type === 'mobile'">
            <label>Mobile Number *</label>
            <input type="tel" [(ngModel)]="form.mobileNumber" placeholder="+233 XX XXX XXXX"/>
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
              <label>Transfer Date</label>
              <input type="date" [(ngModel)]="form.date" [min]="today"/>
            </div>
          </div>
          <div class="modal-field">
            <label>Narration / Reference</label>
            <input type="text" [(ngModel)]="form.narration" placeholder="e.g. Rent payment for February"/>
          </div>
          <div class="modal-charge-box" *ngIf="form.amount > 0">
            <div class="modal-charge-row"><span>Transfer Amount</span><strong>GHS {{ form.amount | number:'1.2-2' }}</strong></div>
            <div class="modal-charge-row"><span>Transaction Fee</span><strong>GHS {{ fee | number:'1.2-2' }}</strong></div>
            <div class="modal-charge-row total"><span>Total Debit</span><strong>GHS {{ (form.amount + fee) | number:'1.2-2' }}</strong></div>
          </div>
        </div>

        <div class="modal-body" *ngIf="step() === 'confirm'">
          <div class="ta-center mb8" style="color:var(--gold)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h3 class="confirm-title">Confirm Transfer</h3>
          <p class="confirm-sub">Please review the details before proceeding</p>
          <div class="confirm-card">
            <div class="modal-detail-row"><span>From</span><strong>{{ form.fromAccount }}</strong></div>
            <div class="ta-center tc-muted">↓</div>
            <div class="modal-detail-row"><span>To</span><strong>{{ form.toAccount }}</strong></div>
            <div class="divider"></div>
            <div class="modal-detail-row"><span>Amount</span><strong class="amount-large">GHS {{ form.amount | number:'1.2-2' }}</strong></div>
            <div class="modal-detail-row"><span>Fee</span><strong>GHS {{ fee | number:'1.2-2' }}</strong></div>
            <div class="modal-detail-row"><span>Narration</span><strong>{{ form.narration || '—' }}</strong></div>
            <div class="modal-detail-row"><span>Date</span><strong>{{ form.date }}</strong></div>
          </div>
          <div class="pin-section">
            <label>Enter Transaction PIN *</label>
            <div class="pin-row">
              <input *ngFor="let p of [0,1,2,3]" type="password" maxlength="1" class="pin-box"
                [(ngModel)]="pin[p]" (input)="onPinInput($event, p)"/>
            </div>
          </div>
        </div>

        <div class="modal-body modal-success-body" *ngIf="step() === 'success'">
          <div style="color:var(--green);margin-bottom:14px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <h3 class="modal-success-title">Transfer Successful!</h3>
          <p class="modal-success-sub">Your transfer has been processed</p>
          <div class="modal-success-ref ref-gold">REF: TXN{{ refNumber }}</div>
          <div class="modal-detail-card">
            <div class="modal-detail-row"><span>Amount</span><strong>GHS {{ form.amount | number:'1.2-2' }}</strong></div>
            <div class="modal-detail-row"><span>To</span><strong>{{ form.toAccount }}</strong></div>
            <div class="modal-detail-row"><span>Status</span><span class="badge-green-sm">Completed</span></div>
          </div>
        </div>

        <div class="modal-footer">
          <ng-container *ngIf="step() === 'form'">
            <button class="btn-ghost" (click)="svc.close()">Cancel</button>
            <button class="btn-gold action-btn" [disabled]="!formValid()" (click)="step.set('confirm')">Review Transfer</button>
          </ng-container>
          <ng-container *ngIf="step() === 'confirm'">
            <button class="btn-ghost" (click)="step.set('form')">Back</button>
            <button class="btn-gold action-btn" [disabled]="!pinComplete()" (click)="submit()">
              <span *ngIf="!loading()">Confirm &amp; Send</span>
              <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Processing...</span>
            </button>
          </ng-container>
          <ng-container *ngIf="step() === 'success'">
            <button class="btn-ghost" (click)="svc.close()">Close</button>
            <button class="btn-gold action-btn" (click)="reset()">New Transfer</button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-title { text-align:center; font-size:18px; font-weight:700; color:var(--text-primary); font-family:'Playfair Display',serif; }
    .confirm-sub { text-align:center; font-size:13px; color:var(--text-muted); margin:4px 0 20px; }
    .confirm-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px; padding:16px; }
    .amount-large { color:var(--gold); font-size:16px; font-weight:700; font-family:'IBM Plex Mono',monospace; }
    .divider { height:1px; background:var(--border); margin:8px 0; }
    .ta-center { text-align:center; }
    .mb8 { margin-bottom:8px; }
    .tc-muted { color:var(--text-muted); padding:4px 0; }
    .pin-section { margin-top:20px; }
    .pin-section label { font-size:12px; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:10px; }
    .pin-row { display:flex; gap:12px; justify-content:center; }
    .pin-box { width:52px; height:52px; text-align:center; font-size:22px; border-radius:12px; font-family:'IBM Plex Mono',monospace; }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class TransferModalComponent {
  svc = inject(QuickActionService);
  step = signal<Step>('form');
  loading = signal(false);
  refNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
  today = new Date().toISOString().split('T')[0];
  form = { type: 'internal', fromAccount: '', toAccount: '', recipientBank: '', mobileNumber: '', amount: 0, narration: '', date: new Date().toISOString().split('T')[0] };
  pin: string[] = ['', '', '', ''];
  myAccounts = [
    { number: 'GH-1004-2021-8821', label: 'Savings — GH-1004-2021-8821 (GHS 24,350.50)' },
    { number: 'GH-1004-2021-8822', label: 'Current — GH-1004-2021-8822 (GHS 18,200.00)' },
  ];
  banks = ['GCB Bank','Ecobank Ghana','Absa Ghana','Stanbic Bank','Zenith Bank','Access Bank','Cal Bank','UBA Ghana'];
  get fee() { return this.form.amount > 5000 ? 5 : this.form.amount > 1000 ? 2 : 0.5; }
  formValid() { return !!(this.form.fromAccount && this.form.toAccount && this.form.amount > 0); }
  pinComplete() { return this.pin.every(p => p !== ''); }
  onPinInput(e: Event, index: number) {
    const next = (e.target as HTMLElement).nextElementSibling as HTMLInputElement;
    if (next && this.pin[index]) next.focus();
  }
  async submit() { this.loading.set(true); await new Promise(r => setTimeout(r, 1800)); this.loading.set(false); this.step.set('success'); }
  reset() { this.step.set('form'); this.form = { type: 'internal', fromAccount: '', toAccount: '', recipientBank: '', mobileNumber: '', amount: 0, narration: '', date: this.today }; this.pin = ['','','','']; }
  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.svc.close(); }
}
