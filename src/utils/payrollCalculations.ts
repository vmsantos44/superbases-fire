export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-CV', {
    style: 'currency',
    currency: 'CVE',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateGrossSalary = (baseSalary: number, allowances: Record<string, number>): number => {
  return baseSalary + Object.values(allowances).reduce((sum, value) => sum + value, 0);
};

export const calculateIncomeTax = (grossSalary: number): number => {
  // Cape Verde income tax calculation (simplified for example)
  return Math.round(grossSalary * 0.095);
};

export const calculateSocialSecurity = (grossSalary: number): number => {
  // Cape Verde social security calculation (8.5% for employees)
  return Math.round(grossSalary * 0.085);
};

export const calculateNetSalary = (grossSalary: number, deductions: number[]): number => {
  const totalDeductions = deductions.reduce((sum, value) => sum + value, 0);
  return grossSalary - totalDeductions;
};