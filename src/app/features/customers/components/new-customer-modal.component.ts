import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, TitleCasePipe, DecimalPipe } from '@angular/common';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, Gender, KycDocument, KycStatus } from '../../../core/models';

@Component({
  selector: 'app-new-customer-modal',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, TitleCasePipe, DecimalPipe],
  template: `
    <div class="modal-backdrop" (click)="onBackdrop($event)">
      <div class="modal-box ncm-box">
        <div class="modal-header">
          <div class="mh-icon" style="background:rgba(201,147,58,0.12);color:var(--gold)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h2 class="modal-title font-serif">New Customer</h2>
            <p class="modal-sub">Register a new customer in the system</p>
          </div>
          <button class="close-btn" (click)="close.emit()">x</button>
        </div>

        <!-- Step indicator -->
        <div class="step-bar">
          <div *ngFor="let s of steps; let i = index" class="step-item">
            <div class="step-circle" [class.done]="currentStep() > i + 1" [class.active]="currentStep() === i + 1">
              <span *ngIf="currentStep() <= i + 1">{{ i + 1 }}</span>
              <span *ngIf="currentStep() > i + 1">OK</span>
            </div>
            <span class="step-label">{{ s }}</span>
            <div class="step-line" *ngIf="i < steps.length - 1"></div>
          </div>
        </div>

        <div class="modal-body">

          <!-- Step 1: Personal Info -->
          <div *ngIf="currentStep() === 1">
            <div class="modal-grid-2">
              <div class="modal-field"><label>First Name *</label><input type="text" [(ngModel)]="form.firstName" placeholder="e.g. Kwame"/></div>
              <div class="modal-field"><label>Last Name *</label><input type="text" [(ngModel)]="form.lastName" placeholder="e.g. Mensah"/></div>
            </div>
            <div class="modal-field"><label>Email *</label><input type="email" [(ngModel)]="form.email" placeholder="kwame.mensah@gmail.com"/></div>
            <div class="modal-grid-2">
              <div class="modal-field"><label>Phone *</label><input type="tel" [(ngModel)]="form.phone" placeholder="+233 XX XXX XXXX"/></div>
              <div class="modal-field">
                <label>Gender *</label>
                <select [(ngModel)]="form.gender">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="modal-grid-2">
              <div class="modal-field"><label>Date of Birth *</label><input type="date" [(ngModel)]="form.dateOfBirth"/></div>
              <div class="modal-field"><label>Nationality</label><input type="text" [(ngModel)]="form.nationality" placeholder="Ghanaian"/></div>
            </div>
            <div class="modal-field">
              <label>Occupation *</label>
              <select [(ngModel)]="form.occupation">
                <option value="">Select occupation</option>
                <option *ngFor="let o of occupations" [value]="o">{{ o }}</option>
              </select>
            </div>
          </div>

          <!-- Step 2: Address & Branch -->
          <div *ngIf="currentStep() === 2">
            <div class="modal-field"><label>Home Address *</label><input type="text" [(ngModel)]="form.address" placeholder="e.g. 12 Market Road"/></div>
            <div class="modal-grid-2">
              <div class="modal-field"><label>City *</label><input type="text" [(ngModel)]="form.city" placeholder="e.g. Kumasi"/></div>
              <div class="modal-field">
                <label>Region *</label>
                <select [(ngModel)]="form.region">
                  <option value="">Select region</option>
                  <option *ngFor="let r of regions" [value]="r">{{ r }}</option>
                </select>
              </div>
            </div>
            <div class="modal-field">
              <label>Branch *</label>
              <select [(ngModel)]="form.branch">
                <option value="">Select branch</option>
                <option *ngFor="let b of branches" [value]="b">{{ b }}</option>
              </select>
            </div>
            <div class="modal-grid-2">
              <div class="modal-field">
                <label>Monthly Income (GHS)</label>
                <div class="modal-prefix-wrap">
                  <span class="modal-prefix">GHS</span>
                  <input type="number" [(ngModel)]="form.monthlyIncome" placeholder="0" class="modal-prefix-input"/>
                </div>
              </div>
              <div class="modal-field"><label>TIN (optional)</label><input type="text" [(ngModel)]="form.tin" placeholder="GH-TIN-XXXXXXXX"/></div>
            </div>
            <div class="modal-field"><label>Notes</label><input type="text" [(ngModel)]="form.notes" placeholder="Any additional notes"/></div>
          </div>

          <!-- Step 3: KYC Documents -->
          <div *ngIf="currentStep() === 3">
            <div class="kyc-intro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              KYC documents must be verified within 30 days of account opening.
            </div>
            <div *ngFor="let doc of kycDocs" class="kyc-row">
              <div>
                <p class="kyc-doc-name">{{ doc.label }}</p>
                <p class="kyc-doc-status" [class]="'kds-' + doc.status">{{ doc.status | titlecase }}</p>
              </div>
              <div class="kyc-toggles">
                <button class="kyc-tog" [class.active]="doc.status === 'uploaded'" (click)="doc.status = 'uploaded'">Received</button>
                <button class="kyc-tog kyc-tog-verify" [class.active]="doc.status === 'verified'" (click)="doc.status = 'verified'">Verified</button>
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div *ngIf="currentStep() === 4">
            <p class="review-section">Personal Information</p>
            <div class="review-card">
              <div class="review-row"><span>Name</span><strong>{{ form.firstName }} {{ form.lastName }}</strong></div>
              <div class="review-row"><span>Email</span><strong>{{ form.email }}</strong></div>
              <div class="review-row"><span>Phone</span><strong>{{ form.phone }}</strong></div>
              <div class="review-row"><span>Gender</span><strong>{{ form.gender | titlecase }}</strong></div>
              <div class="review-row"><span>Occupation</span><strong>{{ form.occupation }}</strong></div>
            </div>
            <p class="review-section">Contact &amp; Branch</p>
            <div class="review-card">
              <div class="review-row"><span>Address</span><strong>{{ form.address }}, {{ form.city }}</strong></div>
              <div class="review-row"><span>Region</span><strong>{{ form.region }}</strong></div>
              <div class="review-row"><span>Branch</span><strong>{{ form.branch }}</strong></div>
              <div class="review-row" *ngIf="form.monthlyIncome"><span>Income</span><strong>GHS {{ form.monthlyIncome | number }}</strong></div>
            </div>
            <p class="review-section">KYC Documents</p>
            <div class="review-card">
              <div *ngFor="let doc of kycDocs" class="review-row">
                <span>{{ doc.label }}</span>
                <strong [class]="'kds-' + doc.status">{{ doc.status | titlecase }}</strong>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn-ghost" *ngIf="currentStep() > 1" (click)="previousStep()">Back</button>
          <button class="btn-ghost" *ngIf="currentStep() === 1" (click)="close.emit()">Cancel</button>
          <button class="btn-gold action-btn" *ngIf="currentStep() < 4" [disabled]="!stepValid()" (click)="nextStep()">Continue</button>
          <button class="btn-gold action-btn" *ngIf="currentStep() === 4" (click)="submit()">
            <span *ngIf="!loading()">Register Customer</span>
            <span *ngIf="loading()" class="modal-spinner-row"><span class="modal-spinner"></span>Saving...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ncm-box { max-width:600px; }
    .step-bar { display:flex; align-items:center; padding:16px 24px; border-bottom:1px solid var(--border); flex-shrink:0; }
    .step-item { display:flex; align-items:center; gap:6px; flex:1; }
    .step-item:last-child { flex:0; }
    .step-circle { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-muted); transition:all 0.2s; }
    .step-circle.active { background:var(--gold-muted); border-color:var(--gold-border); color:var(--gold); }
    .step-circle.done { background:var(--green-muted); border-color:var(--green); color:var(--green); }
    .step-label { font-size:11px; color:var(--text-muted); white-space:nowrap; }
    .step-line { flex:1; height:1px; background:var(--border); margin:0 6px; }
    .kyc-intro { display:flex; align-items:flex-start; gap:8px; padding:12px; background:var(--blue-muted); border:1px solid rgba(77,158,255,0.2); border-radius:8px; font-size:12.5px; color:var(--blue); margin-bottom:16px; }
    .kyc-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-subtle); }
    .kyc-doc-name { font-size:13px; font-weight:500; color:var(--text-primary); }
    .kyc-doc-status { font-size:11px; margin-top:3px; }
    .kds-missing { color:var(--text-muted); }
    .kds-uploaded { color:var(--blue); }
    .kds-verified { color:var(--green); }
    .kyc-toggles { display:flex; gap:8px; }
    .kyc-tog { padding:5px 12px; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .kyc-tog.active { background:var(--blue-muted); border-color:var(--blue); color:var(--blue); }
    .kyc-tog-verify.active { background:var(--green-muted); border-color:var(--green); color:var(--green); }
    .review-section { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin:16px 0 8px; }
    .review-section:first-child { margin-top:0; }
    .review-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; overflow:hidden; }
    .review-row { display:flex; justify-content:space-between; align-items:center; padding:9px 14px; font-size:13px; border-bottom:1px solid var(--border-subtle); }
    .review-row:last-child { border-bottom:none; }
    .review-row span { color:var(--text-secondary); }
    .review-row strong { color:var(--text-primary); }
    .action-btn { padding:9px 22px; font-size:13px; }
  `]
})
export class NewCustomerModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Customer>();

  private customerService = inject(CustomerService);

  currentStep = signal(1);
  loading = signal(false);

  steps = ['Personal Info', 'Address & Branch', 'KYC Docs', 'Review'];
  occupations = ['Teacher','Engineer','Doctor','Lawyer','Trader','Farmer','Civil Servant','Entrepreneur','Accountant','Nurse'];
  regions = ['Ashanti','Greater Accra','Western','Eastern','Central','Northern','Upper East','Upper West','Volta','Brong-Ahafo'];
  branches = ['Kumasi Central','Accra Head Office','Tema Industrial','Takoradi Port','Tamale North','Cape Coast','Sunyani'];

  form = { firstName: '', lastName: '', email: '', phone: '', gender: '', dateOfBirth: '', nationality: 'Ghanaian', occupation: '', address: '', city: '', region: '', branch: '', monthlyIncome: 0, tin: '', notes: '' };

  kycDocs: KycDocument[] = [
    { type: 'national_id', label: 'National ID Card', status: 'missing' },
    { type: 'passport', label: 'International Passport', status: 'missing' },
    { type: 'utility_bill', label: 'Utility Bill', status: 'missing' },
    { type: 'bank_statement', label: 'Bank Statement', status: 'missing' },
  ];

  stepValid(): boolean {
    if (this.currentStep() === 1) return !!(this.form.firstName && this.form.lastName && this.form.email && this.form.phone && this.form.gender && this.form.dateOfBirth && this.form.occupation);
    if (this.currentStep() === 2) return !!(this.form.address && this.form.city && this.form.region && this.form.branch);
    return true;
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(1, step - 1));
  }

  nextStep(): void {
    if (this.stepValid()) {
      this.currentStep.update(step => Math.min(this.steps.length, step + 1));
    }
  }

  async submit() {
    this.loading.set(true);
    await new Promise(r => setTimeout(r, 1200));
    const verifiedCount = this.kycDocs.filter(d => d.status === 'verified').length;
    const receivedCount = this.kycDocs.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
    const kycStatus: KycStatus = verifiedCount === 4 ? 'verified' : receivedCount > 0 ? 'pending' : 'not_started';
    const id = 'CU-' + String(Math.floor(Math.random() * 9000) + 1000);
    const customer: Customer = {
      id,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phone: this.form.phone,
      gender: this.form.gender as Gender,
      dateOfBirth: new Date(this.form.dateOfBirth),
      nationality: this.form.nationality,
      occupation: this.form.occupation,
      address: this.form.address,
      city: this.form.city,
      region: this.form.region,
      branch: this.form.branch,
      monthlyIncome: this.form.monthlyIncome,
      tin: this.form.tin || undefined,
      notes: this.form.notes || undefined,
      status: 'active',
      kycStatus,
      kycDocuments: this.kycDocs.map(d => ({
        ...d,
        uploadedDate: d.status !== 'missing' ? new Date() : undefined
      })),
      accounts: [],
      registeredDate: new Date(),
      lastActivity: new Date(),
    };
    this.customerService.addCustomer(customer);
    this.loading.set(false);
    this.saved.emit(customer);
  }

  onBackdrop(e: MouseEvent) { if ((e.target as Element).classList.contains('modal-backdrop')) this.close.emit(); }
}
