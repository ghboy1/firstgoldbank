import { Component, computed, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles: UserRole[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`, route: '/dashboard', roles: ['super_admin', 'branch_manager', 'bank_teller', 'customer'] },
  { label: 'Customers', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, route: '/customers', roles: ['super_admin', 'branch_manager', 'bank_teller'] },
  { label: 'Accounts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`, route: '/accounts', roles: ['super_admin', 'branch_manager', 'bank_teller', 'customer'] },
  { label: 'Transactions', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, route: '/transactions', roles: ['super_admin', 'branch_manager', 'bank_teller', 'customer'] },
  { label: 'Loans', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`, route: '/loans', roles: ['super_admin', 'branch_manager', 'bank_teller', 'customer'] },
  { label: 'Cards', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`, route: '/cards', roles: ['super_admin', 'branch_manager', 'customer'] },
  { label: 'Teller Station', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`, route: '/teller', roles: ['bank_teller'] },
  { label: 'Branch Performance', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, route: '/branch', roles: ['super_admin', 'branch_manager'] },
  { label: 'Reports', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, route: '/reports', roles: ['super_admin', 'branch_manager'] },
  { label: 'User Management', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, route: '/users', roles: ['super_admin'] },
  { label: 'Settings', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, route: '/settings', roles: ['super_admin', 'branch_manager'] }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="url(#grad)"/>
            <path d="M14 20h12M20 14v12" stroke="#060A14" stroke-width="2.5" stroke-linecap="round"/>
            <defs>
              <linearGradient id="grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#E8B560"/>
                <stop offset="100%" stop-color="#C9933A"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="logo-text" *ngIf="!isCollapsed()">
          <span class="logo-name">FirstGold</span>
          <span class="logo-sub">Banking System</span>
        </div>
        <button class="collapse-btn" (click)="toggleCollapse()" title="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path *ngIf="!isCollapsed()" d="M11 19l-7-7 7-7M4 12h16"/>
            <path *ngIf="isCollapsed()" d="M13 5l7 7-7 7M20 12H4"/>
          </svg>
        </button>
      </div>

      <!-- Role Badge -->
      <div class="role-badge-wrapper" *ngIf="!isCollapsed()">
        <span class="role-pill" [style.background]="auth.roleColor + '18'" [style.color]="auth.roleColor" [style.border-color]="auth.roleColor + '35'">
          {{ auth.displayRole }}
        </span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section-label" *ngIf="!isCollapsed()">NAVIGATION</div>
        <a
          *ngFor="let item of visibleItems()"
          [routerLink]="item.route"
          routerLinkActive="active"
          class="nav-item"
          [title]="isCollapsed() ? item.label : ''"
        >
          <span class="nav-icon" [innerHTML]="item.icon"></span>
          <span class="nav-label" *ngIf="!isCollapsed()">{{ item.label }}</span>
          <span class="nav-badge" *ngIf="item.badge && !isCollapsed()">{{ item.badge }}</span>
        </a>
      </nav>

      <!-- Bottom: Logout -->
      <div class="sidebar-bottom">
        <div class="divider"></div>
        <button class="nav-item logout-btn" (click)="logout()">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span class="nav-label" *ngIf="!isCollapsed()">Sign Out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0; top: 0;
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
    }

    .sidebar.collapsed { width: 72px; }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border-subtle);
      min-height: 68px;
      position: relative;
    }

    .logo-icon {
      width: 36px; height: 36px;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 8px rgba(201,147,58,0.4));
    }

    .logo-text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
    .logo-name {
      font-family: 'Playfair Display', serif;
      font-size: 16px; font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
    }
    .logo-sub {
      font-size: 10px; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.8px;
      white-space: nowrap;
    }

    .collapse-btn {
      width: 28px; height: 28px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
      padding: 5px;
    }
    .collapse-btn:hover { color: var(--gold); border-color: var(--gold-border); }

    .role-badge-wrapper { padding: 12px 16px 4px; }
    .role-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-section-label {
      font-size: 9px;
      color: var(--text-muted);
      letter-spacing: 1.2px;
      font-weight: 600;
      padding: 8px 8px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 10px;
      border-radius: 10px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.18s ease;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      white-space: nowrap;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--gold-muted);
      color: var(--gold-light);
      border: 1px solid var(--gold-border);
    }

    .nav-icon {
      width: 20px; height: 20px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-icon svg { width: 18px; height: 18px; }

    .nav-label { flex: 1; }

    .nav-badge {
      background: var(--red);
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 10px;
    }

    .sidebar-bottom { padding: 10px; }
    .divider { height: 1px; background: var(--border); margin-bottom: 8px; }

    .logout-btn {
      color: var(--text-muted);
    }
    .logout-btn:hover {
      background: var(--red-muted);
      color: var(--red);
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);
  isCollapsed = signal(false);

  visibleItems = computed(() => {
    const role = this.auth.role();
    if (!role) return [];
    return ALL_NAV_ITEMS.filter(item => item.roles.includes(role));
  });

  toggleCollapse() { this.isCollapsed.update(v => !v); }
  logout() { this.auth.logout(); }
}
