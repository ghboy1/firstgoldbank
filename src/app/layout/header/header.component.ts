import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { Notification } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, NgIf],
  template: `
    <header class="header">
      <!-- Page Title Area -->
      <div class="header-left">
        <div class="page-info">
          <h1 class="page-title font-serif">Dashboard</h1>
          <p class="page-date">{{ now | date:'EEEE, MMMM d, y' }}</p>
        </div>
      </div>

      <!-- Search -->
      <div class="header-search">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input type="text" placeholder="Search accounts, customers, transactions..." class="search-input"/>
        <span class="search-kbd">Ctrl K</span>
      </div>

      <!-- Right actions -->
      <div class="header-right">
        <!-- Notifications -->
        <div class="relative">
          <button class="icon-btn" (click)="toggleNotifications()" [class.active]="showNotifications()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-dot" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
          </button>

          <!-- Notification Dropdown -->
          <div class="dropdown notif-panel" *ngIf="showNotifications()">
            <div class="dropdown-header">
              <span>Notifications</span>
              <button class="mark-all-btn" (click)="markAllRead()">Mark all read</button>
            </div>
            <div class="notif-list">
              <div
                *ngFor="let n of notifications()"
                class="notif-item"
                [class.unread]="!n.read"
              >
                <span class="notif-type-dot" [ngClass]="'dot-' + n.type"></span>
                <div class="notif-content">
                  <p class="notif-title">{{ n.title }}</p>
                  <p class="notif-msg">{{ n.message }}</p>
                  <p class="notif-time">{{ timeAgo(n.time) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="header-divider"></div>

        <!-- User Menu -->
        <div class="relative">
          <button class="user-btn" (click)="toggleUserMenu()">
            <div class="user-avatar" [style.background]="auth.roleColor + '25'" [style.border-color]="auth.roleColor + '50'">
              <span [style.color]="auth.roleColor">{{ initials() }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ auth.currentUser()?.name }}</span>
              <span class="user-role" [style.color]="auth.roleColor">{{ auth.displayRole }}</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="chevron" [class.rotated]="showUserMenu()">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <!-- User Dropdown -->
          <div class="dropdown user-menu" *ngIf="showUserMenu()">
            <div class="user-menu-header">
              <div class="user-avatar large" [style.background]="auth.roleColor + '25'" [style.border-color]="auth.roleColor + '50'">
                <span [style.color]="auth.roleColor">{{ initials() }}</span>
              </div>
              <div>
                <p class="um-name">{{ auth.currentUser()?.name }}</p>
                <p class="um-email">{{ auth.currentUser()?.email }}</p>
              </div>
            </div>
            <div class="um-divider"></div>
            <button class="um-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </button>
            <button class="um-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Preferences
            </button>
            <div class="um-divider"></div>
            <button class="um-item logout" (click)="auth.logout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 0 28px;
      position: sticky; top: 0;
      z-index: 50;
      backdrop-filter: blur(20px);
    }

    .header-left { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .page-title { font-size: 20px; font-weight: 600; color: var(--text-primary); line-height: 1; }
    .page-date { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

    .header-search {
      flex: 1;
      max-width: 420px;
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0 14px;
      gap: 10px;
      height: 40px;
      transition: border-color 0.2s;
    }
    .header-search:focus-within { border-color: var(--gold-border); }
    .search-icon { color: var(--text-muted); display: flex; align-items: center; }
    .search-icon svg { width: 16px; height: 16px; }
    .search-input {
      flex: 1; border: none; background: transparent;
      font-size: 13px; color: var(--text-primary);
      font-family: 'IBM Plex Sans', sans-serif;
      box-shadow: none;
    }
    .search-kbd {
      font-size: 10px; color: var(--text-muted);
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: 'IBM Plex Mono', monospace;
    }

    .header-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .header-divider { width: 1px; height: 28px; background: var(--border); margin: 0 4px; }

    .icon-btn {
      width: 40px; height: 40px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      position: relative;
      transition: all 0.2s;
    }
    .icon-btn:hover, .icon-btn.active {
      border-color: var(--gold-border);
      color: var(--gold);
      background: var(--gold-muted);
    }

    .notif-dot {
      position: absolute; top: 6px; right: 6px;
      background: var(--red);
      color: white; font-size: 9px; font-weight: 700;
      width: 16px; height: 16px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg-secondary);
    }

    .relative { position: relative; }

    .dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      z-index: 200;
      animation: fadeUp 0.2s ease;
    }

    .notif-panel { width: 360px; }
    .dropdown-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 600; font-size: 14px;
    }
    .mark-all-btn {
      font-size: 12px; color: var(--gold); background: none;
      border: none; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
    }
    .mark-all-btn:hover { color: var(--gold-light); }

    .notif-list { max-height: 340px; overflow-y: auto; }
    .notif-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
      transition: background 0.15s;
    }
    .notif-item:hover { background: rgba(255,255,255,0.02); }
    .notif-item.unread { background: rgba(201,147,58,0.04); }

    .notif-type-dot {
      width: 8px; height: 8px;
      border-radius: 50%; flex-shrink: 0; margin-top: 5px;
    }
    .dot-info { background: var(--blue); }
    .dot-warning { background: var(--gold); animation: pulse-gold 2s infinite; }
    .dot-success { background: var(--green); }
    .dot-error { background: var(--red); }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .notif-msg { font-size: 12px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4; }
    .notif-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

    .user-btn {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 6px 12px;
      cursor: pointer;
      transition: all 0.2s;
      max-width: 220px;
    }
    .user-btn:hover { border-color: var(--gold-border); background: var(--gold-muted); }

    .user-avatar {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px;
      border: 1px solid;
      flex-shrink: 0;
    }
    .user-avatar.large { width: 44px; height: 44px; font-size: 16px; border-radius: 10px; }

    .user-info { display: flex; flex-direction: column; text-align: left; gap: 1px; min-width: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 10.5px; font-weight: 500; }

    .chevron { color: var(--text-muted); transition: transform 0.2s; flex-shrink: 0; }
    .chevron.rotated { transform: rotate(180deg); }

    .user-menu { width: 240px; }
    .user-menu-header { display: flex; gap: 12px; align-items: center; padding: 16px; }
    .um-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .um-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .um-divider { height: 1px; background: var(--border); margin: 4px 0; }
    .um-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px;
      width: 100%; text-align: left;
      background: none; border: none;
      color: var(--text-secondary);
      font-size: 13px; font-family: 'IBM Plex Sans', sans-serif;
      cursor: pointer; transition: all 0.15s;
    }
    .um-item:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
    .um-item.logout:hover { background: var(--red-muted); color: var(--red); }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  private mockData = inject(MockDataService);

  now = new Date();
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notifications = signal<Notification[]>(this.mockData.getNotifications());
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    const target = e.target as Element;
    if (!target.closest('app-header')) {
      this.showNotifications.set(false);
      this.showUserMenu.set(false);
    }
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  markAllRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  timeAgo(date: Date): string {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  }
}
