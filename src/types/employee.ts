export interface Employee {
  id: string;
  name: string;
  email: string;
  taxId: string;
  department: string;
  position: string;
  employmentType: 'Full Time' | 'Part Time' | 'Contract';
  startDate: string;
  workLocation?: string;
  bankInfo?: BankInformation;
  address?: Address;
}

export interface BankInformation {
  bankName: string;
  accountNumber: string;
}

export interface Address {
  street?: string;
  city?: string;
  country: string;
}

export interface Compensation {
  baseSalary: number;
  allowances: {
    foodAllowance: number;
    communicationAllowance: number;
    attendanceBonus: number;
    assiduityBonus: number;
  };
}

export interface PayrollCalculation {
  grossSalary: number;
  deductions: {
    irps: number;
    socialSecurity: number;
  };
  totalDeductions: number;
  netSalary: number;
}

export interface ManualAdjustment {
  type: 'Deduction' | 'Addition';
  amount: number;
  description: string;
  date: string;
}