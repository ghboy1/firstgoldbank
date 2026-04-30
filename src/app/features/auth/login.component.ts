import { Component, signal, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AuthService, MOCK_USERS } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  color: string;
  icon: string;
  emoji: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    description: 'Full system access | All branches | User management',
    color: '#C9933A',
    emoji: 'SA',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
  },
  {
    role: 'branch_manager',
    label: 'Branch Manager',
    description: 'Branch oversight | Team management | Approvals',
    color: '#4D9EFF',
    emoji: 'BM',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  {
    role: 'bank_teller',
    label: 'Bank Teller',
    description: 'Customer service | Transactions | Cash operations',
    color: '#0DD4A1',
    emoji: 'BT',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
  },
  {
    role: 'customer',
    label: 'Customer',
    description: 'My accounts | Transactions | Cards and loans',
    color: '#9B6DFF',
    emoji: 'CU',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  }
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="login-page">
      <div class="bg-grid"></div>

      <div class="login-container">
        <!-- Logo -->
        <div class="login-logo">
          <div class="logo-gem">
            <svg viewBox="0 0 56 56" fill="none">
              <path d="M28 4L52 16V40L28 52L4 40V16L28 4Z" fill="url(#lg)"/>
              <path d="M18 28h20M28 18v20" stroke="#060A14" stroke-width="3.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="lg" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#E8B560"/>
                  <stop offset="100%" stop-color="#A67828"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 class="brand-name">FirstGold Bank</h1>
            <p class="brand-sub">Core Banking System v2.0</p>
          </div>
        </div>

        <!-- Card -->
        <div class="login-card">
          <div class="card-top">
            <h2 class="card-title">Welcome back</h2>
            <p class="card-subtitle">Select your role to continue to the dashboard</p>
          </div>

          <!-- Role Grid -->
          <div class="role-grid">
            <button
              *ngFor="let r of roles"
              class="role-card"
              [class.selected]="selectedRole() === r.role"
              [style.--role-color]="r.color"
              (click)="selectRole(r.role)"
            >
              <div class="role-icon-wrap">
                <span class="role-emoji">{{ r.emoji }}</span>
              </div>
              <div class="role-info">
                <p class="role-label">{{ r.label }}</p>
                <p class="role-desc">{{ r.description }}</p>
              </div>
              <div class="role-check" [class.visible]="selectedRole() === r.role">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </button>
          </div>

          <!-- Selected User Preview -->
          <div class="user-preview" *ngIf="selectedRole()">
            <div class="preview-avatar" [style.background]="selectedColor + '20'" [style.border-color]="selectedColor + '40'">
              <span [style.color]="selectedColor">{{ selectedInitials }}</span>
            </div>
            <div class="preview-info">
              <p class="preview-name">{{ selectedUser?.name }}</p>
              <p class="preview-meta">{{ selectedUser?.email }} | {{ selectedUser?.branch || selectedUser?.accountNumber }}</p>
            </div>
          </div>

          <!-- Login Button -->
          <button
            class="login-btn"
            [disabled]="!selectedRole() || auth.isLoading()"
            (click)="login()"
          >
            <span *ngIf="!auth.isLoading()">
              Continue as {{ selectedRoleLabel }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
            <span *ngIf="auth.isLoading()" class="loading-state">
              <span class="spinner"></span>
              Signing you in...
            </span>
          </button>

          <p class="demo-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Demo system - all data is simulated
          </p>
        </div>

        <!-- Footer -->
        <p class="login-footer">
          (c) 2025 FirstGold Bank Ghana Ltd. All rights reserved.
          <span>Licensed by Bank of Ghana</span>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
      padding: 40px 20px;
    }

    .bg-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .login-container {
      width: 100%;
      max-width: 520px;
      position: relative;
      z-index: 1;
      animation: fadeUp 0.6s ease;
    }

    .login-logo {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      justify-content: center;
    }

    .logo-gem {
      width: 56px; height: 56px;
      filter: drop-shadow(0 4px 16px rgba(201,147,58,0.5));
    }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 26px; font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .brand-sub {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .card-top { margin-bottom: 24px; }
    .card-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 600;
      color: var(--text-primary);
    }
    .card-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }

    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .role-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      position: relative;
      font-family: 'IBM Plex Sans', sans-serif;
    }

    .role-card:hover {
      border-color: rgba(var(--role-color), 0.4);
      background: rgba(var(--role-color), 0.05);
      transform: translateY(-1px);
    }

    .role-card.selected {
      border-color: var(--role-color);
      background: color-mix(in srgb, var(--role-color) 10%, var(--bg-secondary));
      box-shadow: 0 0 0 1px var(--role-color), 0 4px 20px color-mix(in srgb, var(--role-color) 20%, transparent);
    }

    .role-icon-wrap {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    }

    .role-info { flex: 1; }
    .role-label {
      font-size: 14px; font-weight: 600;
      color: var(--text-primary);
    }
    .role-desc {
      font-size: 11px; color: var(--text-muted);
      margin-top: 3px; line-height: 1.4;
    }

    .role-check {
      position: absolute; top: 12px; right: 12px;
      width: 20px; height: 20px;
      border-radius: 50%;
      background: var(--role-color);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s; color: white;
    }
    .role-check.visible { opacity: 1; }

    .user-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 20px;
      animation: fadeIn 0.2s ease;
    }

    .preview-avatar {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 15px;
      border: 1px solid;
      flex-shrink: 0;
    }

    .preview-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .preview-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    .login-btn {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      font-family: 'IBM Plex Sans', sans-serif;
      cursor: pointer;
      transition: all 0.25s ease;
      background: linear-gradient(135deg, var(--gold) 0%, #B8822A 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 20px rgba(201,147,58,0.35);
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(201,147,58,0.5);
    }

    .login-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      box-shadow: none;
    }

    .loading-state {
      display: flex; align-items: center; gap: 10px;
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .demo-note {
      display: flex; align-items: center; justify-content: center;
      gap: 5px;
      font-size: 11.5px; color: var(--text-muted);
      margin-top: 16px;
    }

    .login-footer {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  roles = ROLES;
  selectedRole = signal<UserRole | null>(null);

  get selectedRoleObj() {
    return ROLES.find(r => r.role === this.selectedRole());
  }

  get selectedRoleLabel() {
    return this.selectedRoleObj?.label ?? '';
  }

  get selectedColor() {
    return this.selectedRoleObj?.color ?? '#C9933A';
  }

  get selectedUser() {
    const role = this.selectedRole();
    return role ? MOCK_USERS[role] : null;
  }

  get selectedInitials() {
    const name = this.selectedUser?.name ?? '';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  selectRole(role: UserRole) {
    this.selectedRole.set(role);
  }

  async login() {
    const role = this.selectedRole();
    if (role) await this.auth.login(role);
  }
}
