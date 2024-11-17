// Firebase types
export interface FirebaseEmployee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  tax_id: string;
  department: string;
  position: string;
  employment_type: 'Full Time' | 'Part Time' | 'Contract';
  start_date: string;
  work_location: string | null;
  compensation: {
    base_salary: number;
    food_allowance: number;
    communication_allowance: number;
    attendance_bonus: number;
    assiduity_bonus: number;
  };
  banking: {
    bank_name: string;
    account_number: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

export interface FirebaseTimeEntry {
  id: string;
  employee_id: string;
  date: Date;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number;
  break_time: number;
  overtime_hours: number;
  status: 'regular' | 'dayoff';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PayrollRun {
  id: string;
  employee_id: string;
  period_start: Date;
  period_end: Date;
  base_salary: number;
  allowances: {
    food: number;
    communication: number;
    attendance: number;
    assiduity: number;
  };
  deductions: {
    irps: number;
    social_security: number;
  };
  total_gross: number;
  total_net: number;
  status: 'draft' | 'approved' | 'paid';
  created_at: Date;
  updated_at: Date;
}