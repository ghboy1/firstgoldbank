import { Component, inject, signal, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Customer, KycStatus, CustomerStatus } from '../../core/models';
import { KycBadgeComponent } from './components/kyc-badge.component';
import { CustomerDetailComponent } from './components/customer-detail.component';
import { NewCustomerModalComponent } from './components/new-customer-modal.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, TitleCasePipe, DecimalPipe, FormsModule, KycBadgeComponent, CustomerDetailComponent, NewCustomerModalComponent],
  template: `
    <div class="customers-wrap">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title font-serif">Customer Management</h1>
          <p class="page-sub">Manage customer profiles, KYC status, and accounts</p>
        </div>
        <button class="btn-gold add-btn" (click)="showNewModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Customer
        </button>
      </div>

      <!-- Stats -->
      <div class="cstat-grid">
        <div class="cstat-card">
          <p class="cstat-label">Total Customers</p>
          <p class="cstat-value">{{ stats().total | number }}</p>
        </div>
        <div class="cstat-card">
          <p class="cstat-label">Active</p>
          <p class="cstat-value" style="color:var(--green)">{{ stats().active | number }}</p>
        </div>
        <div class="cstat-card">
          <p class="cstat-label">KYC Verified</p>
          <p class="cstat-value" style="color:var(--green)">{{ stats().kycVerified | number }}</p>
        </div>
        <div class="cstat-card">
          <p class="cstat-label">KYC Pending</p>
          <p class="cstat-value" style="color:var(--gold-light)">{{ stats().kycPending | number }}</p>
        </div>
        <div class="cstat-card">
          <p class="cstat-label">KYC Rejected</p>
          <p class="cstat-value" style="color:var(--red)">{{ stats().kycRejected | number }}</p>
        </div>
        <div class="cstat-card">
          <p class="cstat-label">New This Month</p>
          <p class="cstat-value" style="color:var(--blue)">{{ stats().newThisMonth | number }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" [(ngModel)]="searchQuery" placeholder="Search by name, email, phone or ID..." (ngModelChange)="onSearch()"/>
          <span class="search-count" *ngIf="searchQuery">{{ filtered().length }} results</span>
        </div>
        <div class="filter-chips">
          <button *ngFor="let f of kycFilters" class="chip" [class.active]="kycFilter === f.value" (click)="setKycFilter(f.value)">{{ f.label }}</button>
        </div>
        <div class="filter-selects">
          <select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
          <select [(ngModel)]="branchFilter" (ngModelChange)="onSearch()">
            <option value="">All Branches</option>
            <option *ngFor="let b of branches" [value]="b">{{ b }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="table-scroll">
          <table class="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Branch</th>
                <th>KYC Status</th>
                <th>Accounts</th>
                <th>Status</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of paginated(); let i = index"
                class="table-row" [style.animation-delay]="(i * 0.03) + 's'"
                (click)="selectCustomer(c)">
                <td>
                  <div class="cust-cell">
                    <div class="cust-avatar" [class]="'av-' + (c.id.slice(-1))">{{ getInitials(c) }}</div>
                    <div>
                      <p class="cust-name">{{ c.firstName }} {{ c.lastName }}</p>
                      <p class="cust-id">{{ c.id }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="cell-main">{{ c.email }}</p>
                  <p class="cell-sub">{{ c.phone }}</p>
                </td>
                <td>
                  <p class="cell-main">{{ c.branch }}</p>
                  <p class="cell-sub">{{ c.region }}</p>
                </td>
                <td><app-kyc-badge [status]="c.kycStatus" /></td>
                <td><span class="acct-count">{{ c.accounts.length }}</span></td>
                <td>
                  <span class="status-chip" [class]="'sc-' + c.status">{{ c.status | titlecase }}</span>
                </td>
                <td>
                  <p class="cell-main">{{ c.registeredDate | date:'mediumDate' }}</p>
                  <p class="cell-sub">{{ c.lastActivity | date:'mediumDate' }}</p>
                </td>
                <td>
                  <button class="view-btn" (click)="selectCustomer(c); $event.stopPropagation()">View</button>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Empty state -->
          <div class="empty-state" *ngIf="filtered().length === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <p>No customers match your filters</p>
            <button class="btn-ghost" (click)="clearFilters()">Clear Filters</button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages() > 1">
          <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button class="page-btn" [disabled]="currentPage() === 1" (click)="prevPage()">Prev</button>
          <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="nextPage()">Next</button>
        </div>
      </div>

    </div>

    <!-- Customer Detail Panel -->
    <app-customer-detail
      *ngIf="selectedCustomer"
      [customer]="selectedCustomer!"
      (close)="selectedCustomer = null"
      (customerUpdated)="onCustomerUpdated($event)"
    />

    <!-- New Customer Modal -->
    <app-new-customer-modal
      *ngIf="showNewModal"
      (close)="showNewModal = false"
      (saved)="onCustomerSaved($event)"
    />
  `,
  styles: [`
    .customers-wrap { display:flex; flex-direction:column; gap:24px; animation:fadeUp 0.4s ease; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
    .page-title { font-size:26px; font-weight:700; color:var(--text-primary); }
    .page-sub { font-size:13px; color:var(--text-muted); margin-top:4px; }
    .add-btn { display:flex; align-items:center; gap:8px; padding:10px 20px; font-size:13px; border-radius:12px; white-space:nowrap; }

    .cstat-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
    .cstat-card { background:var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:16px; }
    .cstat-label { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px; }
    .cstat-value { font-size:24px; font-weight:700; color:var(--text-primary); font-family:'IBM Plex Mono',monospace; }

    .filters-bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .search-wrap { display:flex; align-items:center; gap:8px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:0 12px; flex:1; min-width:240px; transition:border-color 0.2s; }
    .search-wrap:focus-within { border-color:var(--gold-border); }
    .search-icon { color:var(--text-muted); flex-shrink:0; }
    .search-input { flex:1; border:none; background:transparent; height:40px; font-size:13px; color:var(--text-primary); outline:none; }
    .search-count { font-size:11px; color:var(--gold); white-space:nowrap; font-family:'IBM Plex Mono',monospace; }
    .filter-chips { display:flex; gap:6px; }
    .chip { padding:6px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .chip:hover { border-color:var(--gold-border); color:var(--gold); }
    .chip.active { background:var(--gold-muted); border-color:var(--gold-border); color:var(--gold); }
    .filter-selects { display:flex; gap:8px; }
    .filter-selects select { height:38px; padding:0 10px; font-size:12px; border-radius:8px; }

    .table-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
    .table-scroll { overflow-x:auto; }
    .customers-table { width:100%; border-collapse:collapse; }
    .customers-table th { padding:12px 16px; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; background:var(--bg-secondary); border-bottom:1px solid var(--border); text-align:left; white-space:nowrap; }
    .table-row { border-bottom:1px solid var(--border-subtle); cursor:pointer; transition:background 0.15s; animation:fadeUp 0.3s ease both; }
    .table-row:hover { background:rgba(255,255,255,0.02); }
    .table-row td { padding:14px 16px; vertical-align:middle; }
    .cust-cell { display:flex; align-items:center; gap:10px; }
    .cust-avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .av-1,.av-6 { background:rgba(201,147,58,0.15); color:var(--gold); }
    .av-2,.av-7 { background:rgba(77,158,255,0.15); color:var(--blue); }
    .av-3,.av-8 { background:rgba(13,212,161,0.15); color:var(--green); }
    .av-4,.av-9 { background:rgba(155,109,255,0.15); color:var(--purple); }
    .av-0,.av-5 { background:rgba(255,92,117,0.15); color:var(--red); }
    .cust-name { font-size:13px; font-weight:600; color:var(--text-primary); }
    .cust-id { font-size:11px; color:var(--text-muted); font-family:'IBM Plex Mono',monospace; }
    .cell-main { font-size:13px; color:var(--text-primary); }
    .cell-sub { font-size:11px; color:var(--text-muted); margin-top:2px; }
    .acct-count { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; background:var(--bg-secondary); border:1px solid var(--border); font-size:12px; font-weight:600; color:var(--text-secondary); }
    .status-chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .sc-active { background:var(--green-muted); color:var(--green); }
    .sc-inactive { background:rgba(123,141,184,0.1); color:var(--text-muted); }
    .sc-blacklisted { background:var(--red-muted); color:var(--red); }
    .view-btn { padding:5px 14px; border-radius:8px; background:transparent; border:1px solid var(--border); color:var(--text-secondary); cursor:pointer; font-size:12px; font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .view-btn:hover { border-color:var(--gold-border); color:var(--gold); }
    .empty-state { padding:60px 24px; text-align:center; color:var(--text-muted); }
    .empty-state svg { margin-bottom:12px; opacity:0.3; }
    .empty-state p { font-size:14px; margin-bottom:16px; }
    .btn-ghost { padding:8px 20px; border-radius:10px; background:transparent; border:1px solid var(--border); color:var(--text-secondary); cursor:pointer; font-size:13px; font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .btn-ghost:hover { border-color:var(--gold-border); color:var(--gold); }
    .pagination { display:flex; align-items:center; gap:12px; padding:16px 20px; border-top:1px solid var(--border); justify-content:flex-end; }
    .page-info { font-size:12px; color:var(--text-muted); margin-right:auto; }
    .page-btn { padding:6px 16px; border-radius:8px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-secondary); cursor:pointer; font-size:12px; font-family:'IBM Plex Sans',sans-serif; transition:all 0.15s; }
    .page-btn:hover:not(:disabled) { border-color:var(--gold-border); color:var(--gold); }
    .page-btn:disabled { opacity:0.3; cursor:not-allowed; }

    @media (max-width:1200px) { .cstat-grid { grid-template-columns:repeat(3,1fr); } }
    @media (max-width:768px) { .cstat-grid { grid-template-columns:repeat(2,1fr); } .filter-chips { display:none; } }
  `]
})
export class CustomersComponent {
  private customerService = inject(CustomerService);
  private auth = inject(AuthService);

  searchQuery = '';
  kycFilter: KycStatus | '' = '';
  statusFilter: CustomerStatus | '' = '';
  branchFilter = '';
  currentPage = signal(1);
  pageSize = 15;
  selectedCustomer: Customer | null = null;
  showNewModal = false;

  branches = ['Kumasi Central','Accra Head Office','Tema Industrial','Takoradi Port','Tamale North','Cape Coast','Sunyani'];
  kycFilters = [
    { label: 'All', value: '' as KycStatus | '' },
    { label: 'Verified', value: 'verified' as KycStatus },
    { label: 'Pending', value: 'pending' as KycStatus },
    { label: 'Rejected', value: 'rejected' as KycStatus },
    { label: 'Not Started', value: 'not_started' as KycStatus },
  ];

  stats = computed(() => this.customerService.stats);

  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.customerService.customers().filter((c: Customer) => {
      const name = (c.firstName + ' ' + c.lastName).toLowerCase();
      const matchSearch = !q || name.includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q);
      const matchKyc = !this.kycFilter || c.kycStatus === this.kycFilter;
      const matchStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchBranch = !this.branchFilter || c.branch === this.branchFilter;
      return matchSearch && matchKyc && matchStatus && matchBranch;
    });
  });

  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  onSearch() { this.currentPage.set(1); }
  setKycFilter(v: KycStatus | '') { this.kycFilter = v; this.currentPage.set(1); }
  clearFilters() { this.searchQuery = ''; this.kycFilter = ''; this.statusFilter = ''; this.branchFilter = ''; this.currentPage.set(1); }
  prevPage() { this.currentPage.update(p => p - 1); }
  nextPage() { this.currentPage.update(p => p + 1); }

  selectCustomer(c: Customer) { this.selectedCustomer = c; }
  getInitials(c: Customer) { return this.customerService.getInitials(c); }

  onCustomerUpdated(id: string) {
    const updated = this.customerService.getById(id);
    if (updated) this.selectedCustomer = updated;
  }

  onCustomerSaved(c: Customer) {
    this.selectedCustomer = c;
    this.showNewModal = false;
  }
}
