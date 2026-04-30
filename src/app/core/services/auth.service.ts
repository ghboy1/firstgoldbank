import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { User, UserRole } from '../models';

export const MOCK_USERS: Record<UserRole, User> = {
  super_admin: {
    id: 'SA-001',
    name: 'Kwame Mensah',
    email: 'k.mensah@firstgoldbank.gh',
    role: 'super_admin',
    branch: 'Head Office — Accra',
    employeeId: 'EMP-0001',
    phone: '+233 20 000 0001',
    lastLogin: new Date()
  },
  branch_manager: {
    id: 'BM-001',
    name: 'Abena Osei-Bonsu',
    email: 'a.osei@firstgoldbank.gh',
    role: 'branch_manager',
    branch: 'Kumasi Central Branch',
    employeeId: 'EMP-0084',
    phone: '+233 24 000 0084',
    lastLogin: new Date()
  },
  bank_teller: {
    id: 'BT-001',
    name: 'Kofi Agyemang',
    email: 'k.agyemang@firstgoldbank.gh',
    role: 'bank_teller',
    branch: 'Kumasi Central Branch',
    employeeId: 'EMP-0212',
    phone: '+233 27 000 0212',
    lastLogin: new Date()
  },
  customer: {
    id: 'CU-001',
    name: 'Ama Boateng',
    email: 'ama.boateng@gmail.com',
    role: 'customer',
    accountNumber: 'GH-1004-2021-8821',
    phone: '+233 55 000 8821',
    lastLogin: new Date()
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private _currentUser = signal<User | null>(null);
  private _isLoading = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly role = computed(() => this._currentUser()?.role ?? null);

  constructor() {
    // Only access sessionStorage in the browser — not during SSR
    if (isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem('banking_user');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          user.lastLogin = new Date(user.lastLogin);
          this._currentUser.set(user);
        } catch {
          sessionStorage.removeItem('banking_user');
        }
      }
    }
  }

  async login(role: UserRole): Promise<void> {
    this._isLoading.set(true);
    await new Promise(r => setTimeout(r, 800));
    const user = { ...MOCK_USERS[role], lastLogin: new Date() };
    this._currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('banking_user', JSON.stringify(user));
    }
    this._isLoading.set(false);
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this._currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('banking_user');
    }
    this.router.navigate(['/login']);
  }

  hasRole(...roles: UserRole[]): boolean {
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  get displayRole(): string {
    const labels: Record<UserRole, string> = {
      super_admin: 'Super Administrator',
      branch_manager: 'Branch Manager',
      bank_teller: 'Bank Teller',
      customer: 'Customer'
    };
    return this.role() ? labels[this.role()!] : '';
  }

  get roleColor(): string {
    const colors: Record<UserRole, string> = {
      super_admin: '#C9933A',
      branch_manager: '#4D9EFF',
      bank_teller: '#0DD4A1',
      customer: '#9B6DFF'
    };
    return this.role() ? colors[this.role()!] : '#7B8DB8';
  }
}
