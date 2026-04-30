import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { QuickActionService } from '../../features/quick-actions/quick-action.service';
import { TransferModalComponent } from '../../features/quick-actions/transfer-modal.component';
import { OpenAccountModalComponent } from '../../features/quick-actions/open-account-modal.component';
import { CashDepositModalComponent } from '../../features/quick-actions/cash-deposit-modal.component';
import { LoanModalComponent } from '../../features/quick-actions/loan-modal.component';
import { StatementModalComponent } from '../../features/quick-actions/statement-modal.component';
import { KycModalComponent } from '../../features/quick-actions/kyc-modal.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, NgIf,
    SidebarComponent, HeaderComponent,
    TransferModalComponent,
    OpenAccountModalComponent,
    CashDepositModalComponent,
    LoanModalComponent,
    StatementModalComponent,
    KycModalComponent,
  ],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="layout-main" id="main-content">
        <app-header />
        <main class="layout-content">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-transfer-modal      *ngIf="qa.activeAction() === 'new_transfer'" />
    <app-open-account-modal  *ngIf="qa.activeAction() === 'open_account'" />
    <app-cash-deposit-modal  *ngIf="qa.activeAction() === 'cash_deposit'" />
    <app-loan-modal          *ngIf="qa.activeAction() === 'loan_application'" />
    <app-statement-modal     *ngIf="qa.activeAction() === 'account_statement'" />
    <app-kyc-modal           *ngIf="qa.activeAction() === 'customer_kyc'" />
  `,
  styles: [`
    .layout { display:flex; min-height:100vh; }
    .layout-main { flex:1; margin-left:var(--sidebar-width); display:flex; flex-direction:column; min-height:100vh; background:var(--bg-primary); transition:margin-left 0.3s ease; }
    .layout-content { flex:1; padding:28px; max-width:1600px; width:100%; }
    @media (max-width:768px) { .layout-main { margin-left:0; } .layout-content { padding:16px; } }
  `]
})
export class MainLayoutComponent {
  qa = inject(QuickActionService);
}
