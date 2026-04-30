import { Injectable, signal } from '@angular/core';

export type QuickActionType =
  | 'new_transfer'
  | 'open_account'
  | 'cash_deposit'
  | 'loan_application'
  | 'account_statement'
  | 'customer_kyc'
  | null;

@Injectable({ providedIn: 'root' })
export class QuickActionService {
  activeAction = signal<QuickActionType>(null);
  open(action: QuickActionType) { this.activeAction.set(action); }
  close() { this.activeAction.set(null); }
}
