import { Injectable } from '@angular/core';
import {
  Account, Transaction, DashboardData, ChartPoint, Notification
} from '../models';
import { UserRole } from '../models';

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - rnd(0, daysBack));
  d.setHours(rnd(8, 17), rnd(0, 59), rnd(0, 59));
  return d;
}

function fmtRef(): string {
  return 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

const NAMES = [
  'Kwesi Asante', 'Akosua Frimpong', 'Yaw Darko', 'Efua Mensah',
  'Nana Adu', 'Adwoa Boateng', 'Kojo Nyarko', 'Abena Amponsah',
  'Fiifi Aidoo', 'Akua Sarpong', 'Kwame Ofori', 'Esi Asamoah',
  'Kofi Bediako', 'Adjoa Asare', 'Kwabena Owusu', 'Maame Serwaa'
];

const CATEGORIES = [
  'Transfer', 'Deposit', 'Withdrawal', 'Loan Repayment',
  'Utility Bill', 'Salary', 'Mobile Money', 'ATM Withdrawal',
  'POS Payment', 'Bank Charges', 'Interest Credit'
];

const BRANCHES = [
  'Kumasi Central', 'Accra Head Office', 'Tema Industrial',
  'Takoradi Port', 'Tamale North', 'Cape Coast', 'Sunyani'
];

const ACCOUNT_NUMBERS = Array.from({ length: 20 }, (_, i) =>
  `GH-${1000 + i}-${2020 + rnd(0, 4)}-${8000 + rnd(0, 999)}`
);

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ─── Transactions ──────────────────────────────────────────────────────────

  getTransactions(limit = 50): Transaction[] {
    return Array.from({ length: limit }, (_, i) => {
      const type = Math.random() > 0.45 ? 'credit' : 'debit';
      const status = Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'failed');
      const name = NAMES[rnd(0, NAMES.length - 1)];
      const category = CATEGORIES[rnd(0, CATEGORIES.length - 1)];
      const amount = parseFloat((Math.random() * 9800 + 200).toFixed(2));
      return {
        id: `TXN-${(i + 1).toString().padStart(5, '0')}`,
        date: randomDate(30),
        description: `${category} — ${name}`,
        amount,
        type,
        status,
        accountNumber: ACCOUNT_NUMBERS[rnd(0, ACCOUNT_NUMBERS.length - 1)],
        customerName: name,
        category,
        reference: fmtRef(),
        branch: BRANCHES[rnd(0, BRANCHES.length - 1)],
        processedBy: type === 'debit' ? `Teller ${rnd(1, 12)}` : 'System'
      } as Transaction;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // ─── Accounts ─────────────────────────────────────────────────────────────

  getAccounts(limit = 20): Account[] {
    const types: Account['type'][] = ['savings', 'current', 'fixed_deposit', 'loan'];
    const statuses: Account['status'][] = ['active', 'active', 'active', 'dormant', 'frozen'];
    return Array.from({ length: limit }, (_, i) => {
      const type = types[rnd(0, types.length - 1)];
      return {
        id: `ACC-${(i + 1).toString().padStart(4, '0')}`,
        accountNumber: ACCOUNT_NUMBERS[i] || `GH-${2000 + i}-2023-${5000 + i}`,
        customerId: `CU-${(i + 1).toString().padStart(4, '0')}`,
        customerName: NAMES[rnd(0, NAMES.length - 1)],
        type,
        balance: parseFloat((Math.random() * 98000 + 500).toFixed(2)),
        currency: 'GHS',
        status: statuses[rnd(0, statuses.length - 1)],
        openedDate: randomDate(1825),
        branch: BRANCHES[rnd(0, BRANCHES.length - 1)],
        interestRate: type === 'savings' ? 8.5 : type === 'fixed_deposit' ? 14.0 : undefined
      } as Account;
    });
  }

  // ─── Chart Data ───────────────────────────────────────────────────────────

  getRevenueChart(): ChartPoint[] {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    let base = 180000;
    return months.map(label => {
      base = base + rnd(-20000, 40000);
      return { label, value: Math.max(120000, base) };
    });
  }

  getTransactionVolumeChart(): ChartPoint[] {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    });
    return days.map(label => ({
      label,
      value: rnd(120, 680)
    }));
  }

  getAccountTypeDistribution() {
    return [
      { type: 'Savings', count: 4821, totalBalance: 12_400_000, color: '#C9933A' },
      { type: 'Current', count: 2340, totalBalance: 28_700_000, color: '#4D9EFF' },
      { type: 'Fixed Deposit', count: 892, totalBalance: 45_200_000, color: '#0DD4A1' },
      { type: 'Loan', count: 1203, totalBalance: 18_900_000, color: '#FF5C75' }
    ];
  }

  // ─── Dashboard Stats by Role ───────────────────────────────────────────────

  getDashboardData(role: UserRole): DashboardData {
    const baseStats = {
      totalAssets: 105_280_450.75,
      totalCustomers: 9_256,
      dailyTransactions: 1_847,
      pendingApprovals: 23,
      monthlyRevenue: 2_340_800,
      activeLoans: 1_203,
      totalBranches: 7,
      activeTellers: 42
    };

    // Adjust stats per role scope
    const stats = role === 'branch_manager'
      ? { ...baseStats, totalCustomers: 1_240, dailyTransactions: 263, totalAssets: 15_400_000, pendingApprovals: 4 }
      : role === 'bank_teller'
      ? { ...baseStats, totalCustomers: 0, dailyTransactions: 47, totalAssets: 0, pendingApprovals: 0 }
      : role === 'customer'
      ? { ...baseStats, totalCustomers: 0, dailyTransactions: 12, totalAssets: 47_820.50, pendingApprovals: 1 }
      : baseStats;

    return {
      stats,
      recentTransactions: this.getTransactions(12),
      accountSummary: this.getAccountTypeDistribution(),
      revenueChart: this.getRevenueChart(),
      transactionChart: this.getTransactionVolumeChart()
    };
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  getNotifications(): Notification[] {
    return [
      {
        id: 'N1', title: 'Large Transaction Alert',
        message: 'Transaction of GHS 85,000 detected on account GH-1002-2021-9142.',
        time: new Date(Date.now() - 1000 * 60 * 5), read: false, type: 'warning'
      },
      {
        id: 'N2', title: 'New Loan Application',
        message: 'Kwesi Asante has submitted a loan application for GHS 50,000.',
        time: new Date(Date.now() - 1000 * 60 * 22), read: false, type: 'info'
      },
      {
        id: 'N3', title: 'Daily Report Ready',
        message: 'The end-of-day report for February 21 is now available.',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false, type: 'success'
      },
      {
        id: 'N4', title: 'System Maintenance',
        message: 'Scheduled maintenance on Sunday Feb 23, 02:00–04:00 GMT.',
        time: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true, type: 'info'
      },
      {
        id: 'N5', title: 'Compliance Deadline',
        message: 'KYC update deadline for 34 customers is Feb 28.',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true, type: 'error'
      }
    ];
  }

  // ─── Customer Specific ────────────────────────────────────────────────────

  getMyAccounts() {
    return [
      { type: 'savings', accountNumber: 'GH-1004-2021-8821', balance: 24_350.50, status: 'active', currency: 'GHS' },
      { type: 'current', accountNumber: 'GH-1004-2021-8822', balance: 18_200.00, status: 'active', currency: 'GHS' },
      { type: 'fixed_deposit', accountNumber: 'GH-1004-2021-8823', balance: 50_000.00, status: 'active', currency: 'GHS', interestRate: 14 }
    ];
  }

  // ─── Branch Performance ───────────────────────────────────────────────────

  getBranchPerformance() {
    return BRANCHES.map(branch => ({
      branch,
      customers: rnd(800, 2000),
      transactions: rnd(200, 800),
      revenue: rnd(200000, 800000),
      tellers: rnd(4, 12),
      satisfaction: parseFloat((rnd(82, 98) + Math.random()).toFixed(1))
    }));
  }
}
