import { Injectable, signal } from '@angular/core';
import { Customer, KycDocument, KycStatus, CustomerStatus } from '../models';

const FIRST_NAMES = ['Kwame','Abena','Kofi','Ama','Yaw','Efua','Nana','Adwoa','Kojo','Akua','Fiifi','Esi','Kwabena','Adjoa','Akosua','Kwesi','Maame','Kwadwo','Afia','Kweku'];
const LAST_NAMES  = ['Mensah','Asante','Boateng','Darko','Frimpong','Osei','Adu','Amponsah','Nyarko','Sarpong','Ofori','Asamoah','Bediako','Asare','Owusu','Serwaa','Aidoo','Nkrumah','Appiah','Antwi'];
const CITIES     = ['Kumasi','Accra','Tema','Takoradi','Tamale','Cape Coast','Sunyani','Koforidua','Ho','Wa'];
const REGIONS    = ['Ashanti','Greater Accra','Western','Northern','Central','Eastern','Volta','Brong-Ahafo'];
const BRANCHES   = ['Kumasi Central','Accra Head Office','Tema Industrial','Takoradi Port','Tamale North','Cape Coast','Sunyani'];
const OCCUPATIONS= ['Teacher','Engineer','Trader','Civil Servant','Doctor','Lawyer','Farmer','Nurse','Accountant','Business Owner','Driver','Contractor'];
const MANAGERS   = ['Abena Osei-Bonsu','Kweku Darko','Afia Mensah','Joseph Asante','Nana Appiah'];

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rnd(0, arr.length - 1)]; }
function randomDate(yearsBack: number, yearsForward = 0): Date {
  const now = new Date();
  const ms = (yearsBack + yearsForward) * 365 * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - rnd(yearsForward * 365 * 86400000, ms));
}

function makeKycDocs(kycStatus: KycStatus): KycDocument[] {
  const allDocs: KycDocument[] = [
    { type: 'national_id',      label: 'National ID Card',        status: 'missing' },
    { type: 'passport',         label: 'International Passport',  status: 'missing' },
    { type: 'utility_bill',     label: 'Utility Bill (3 months)', status: 'missing' },
    { type: 'bank_statement',   label: 'Bank Statement',          status: 'missing' },
  ];

  if (kycStatus === 'verified') {
    return allDocs.map(d => ({ ...d, status: 'verified', uploadedDate: randomDate(1) }));
  }
  if (kycStatus === 'pending') {
    return allDocs.map((d, i) => ({
      ...d,
      status: i < 2 ? 'uploaded' : 'missing',
      uploadedDate: i < 2 ? randomDate(0.1) : undefined
    }));
  }
  if (kycStatus === 'rejected') {
    return allDocs.map((d, i) => ({
      ...d,
      status: i === 0 ? 'rejected' : i < 2 ? 'uploaded' : 'missing',
      uploadedDate: i < 2 ? randomDate(0.2) : undefined,
      rejectionReason: i === 0 ? 'Document appears altered or invalid' : undefined
    }));
  }
  return allDocs; // not_started — all missing
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private _customers = signal<Customer[]>(this.generateCustomers(60));

  readonly customers = this._customers.asReadonly();

  private generateCustomers(count: number): Customer[] {
    const kycStatuses: KycStatus[] = ['verified','verified','verified','pending','pending','rejected','not_started'];
    const custStatuses: CustomerStatus[] = ['active','active','active','active','inactive','blacklisted'];

    return Array.from({ length: count }, (_, i) => {
      const firstName = pick(FIRST_NAMES);
      const lastName  = pick(LAST_NAMES);
      const kycStatus = pick(kycStatuses);
      const custStatus = pick(custStatuses);
      const city = pick(CITIES);
      const numAccounts = rnd(1, 3);

      return {
        id: `CU-${String(i + 1).padStart(4, '0')}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rnd(1,99)}@gmail.com`,
        phone: `+233 ${pick(['20','24','27','54','55','59'])} ${rnd(100,999)} ${rnd(1000,9999)}`,
        gender: pick(['male','female','female','male']) as 'male'|'female',
        dateOfBirth: randomDate(65, 18),
        nationality: 'Ghanaian',
        occupation: pick(OCCUPATIONS),
        address: `${rnd(1,200)} ${pick(['High St','Market Rd','Ring Rd','Main St','Station Ave','Ghana Rd'])}`,
        city,
        region: pick(REGIONS),
        status: custStatus,
        kycStatus,
        kycDocuments: makeKycDocs(kycStatus),
        accounts: Array.from({ length: numAccounts }, (_, j) =>
          `GH-${String(i+1).padStart(4,'0')}-${2020+j}-${rnd(1000,9999)}`
        ),
        registeredDate: randomDate(5),
        lastActivity: randomDate(0.5),
        branch: pick(BRANCHES),
        relationshipManager: Math.random() > 0.4 ? pick(MANAGERS) : undefined,
        monthlyIncome: rnd(800, 25000),
        tin: Math.random() > 0.5 ? `GH-TIN-${rnd(10000000, 99999999)}` : undefined,
        notes: Math.random() > 0.7 ? 'VIP customer — handle with priority.' : undefined
      } as Customer;
    }).sort((a, b) => b.registeredDate.getTime() - a.registeredDate.getTime());
  }

  getById(id: string): Customer | undefined {
    return this._customers().find(c => c.id === id);
  }

  addCustomer(customer: Customer): void {
    this._customers.update(list => [customer, ...list]);
  }

  updateCustomer(id: string, updates: Partial<Customer>): void {
    this._customers.update(list =>
      list.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  }

  updateKycStatus(id: string, status: KycStatus): void {
    this.updateCustomer(id, { kycStatus: status });
  }

  get stats() {
    const list = this._customers();
    return {
      total: list.length,
      active: list.filter(c => c.status === 'active').length,
      kycVerified: list.filter(c => c.kycStatus === 'verified').length,
      kycPending: list.filter(c => c.kycStatus === 'pending').length,
      kycRejected: list.filter(c => c.kycStatus === 'rejected').length,
      newThisMonth: list.filter(c => {
        const d = new Date(); d.setDate(1);
        return c.registeredDate >= d;
      }).length
    };
  }

  getFullName(c: Customer): string { return `${c.firstName} ${c.lastName}`; }

  getInitials(c: Customer): string {
    return (c.firstName[0] + c.lastName[0]).toUpperCase();
  }

  getAge(c: Customer): number {
    return Math.floor((Date.now() - c.dateOfBirth.getTime()) / (365.25 * 86400000));
  }
}
