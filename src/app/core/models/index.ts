// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'branch_manager' | 'bank_teller' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  branch?: string;
  employeeId?: string;
  accountNumber?: string;
  phone?: string;
  lastLogin: Date;
}

// ─── Account ────────────────────────────────────────────────────────────────

export type AccountType = 'savings' | 'current' | 'fixed_deposit' | 'loan';
export type AccountStatus = 'active' | 'dormant' | 'frozen' | 'closed';

export interface Account {
  id: string;
  accountNumber: string;
  customerId: string;
  customerName: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  openedDate: Date;
  branch: string;
  interestRate?: number;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  accountNumber: string;
  customerName: string;
  category: string;
  reference: string;
  branch?: string;
  processedBy?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'gold' | 'green' | 'blue' | 'red' | 'purple';
  prefix?: string;
  suffix?: string;
}

export interface ChartPoint {
  label: string;
  value: number;
  date?: Date;
}

export interface DashboardData {
  stats: {
    totalAssets: number;
    totalCustomers: number;
    dailyTransactions: number;
    pendingApprovals: number;
    monthlyRevenue: number;
    activeLoans: number;
    totalBranches: number;
    activeTellers: number;
  };
  recentTransactions: Transaction[];
  accountSummary: { type: string; count: number; totalBalance: number; color: string }[];
  revenueChart: ChartPoint[];
  transactionChart: ChartPoint[];
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type KycStatus = 'verified' | 'pending' | 'rejected' | 'not_started';
export type CustomerStatus = 'active' | 'inactive' | 'blacklisted';
export type Gender = 'male' | 'female' | 'other';

export interface KycDocument {
  type: 'national_id' | 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  label: string;
  uploadedDate?: Date;
  status: 'uploaded' | 'verified' | 'rejected' | 'missing';
  rejectionReason?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: Date;
  nationality: string;
  occupation: string;
  address: string;
  city: string;
  region: string;
  status: CustomerStatus;
  kycStatus: KycStatus;
  kycDocuments: KycDocument[];
  accounts: string[];
  registeredDate: Date;
  lastActivity: Date;
  branch: string;
  relationshipManager?: string;
  monthlyIncome?: number;
  tin?: string;
  notes?: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

// ─── Nav Item ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles: UserRole[];
  children?: NavItem[];
}
