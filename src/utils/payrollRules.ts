// Previous code remains the same...

export const calculatePayroll = (
  timeEntries: TimeEntry[],
  rules: PayrollRules = defaultPayrollRules,
  baseSalary: number
): PayrollCalculation => {
  const hourlyRate = calculateHourlyRate(baseSalary);
  
  const result: PayrollCalculation = {
    regularHours: 0,
    overtimeHours: 0,
    weekendHours: 0,
    holidayHours: 0,
    totalAmount: baseSalary, // Start with base salary
    deductions: {
      breakTime: 0,
      irps: 0,
      socialSecurity: 0,
    },
    netAmount: 0,
  };

  // Process each time entry
  timeEntries.forEach(entry => {
    if (entry.status === 'dayoff') return;

    const date = new Date(entry.entry_date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Calculate net hours after break deduction
    let netHours = entry.total_hours;
    if (rules.breakDeduction && entry.break_time >= rules.minimumBreakHours) {
      netHours -= entry.break_time;
      result.deductions.breakTime += entry.break_time * hourlyRate;
    }
    
    // Calculate regular and overtime hours
    if (isWeekend) {
      result.weekendHours += netHours;
      result.totalAmount += netHours * hourlyRate * rules.weekendMultiplier;
    } else {
      if (netHours <= rules.maxRegularHours) {
        result.regularHours += netHours;
      } else {
        result.regularHours += rules.maxRegularHours;
        const overtime = Math.min(netHours - rules.maxRegularHours, rules.maxOvertimeHours);
        result.overtimeHours += overtime;
        result.totalAmount += overtime * hourlyRate * rules.overtimeMultiplier;
      }
    }
  });

  // Calculate deductions
  result.deductions.irps = calculateIRPS(result.totalAmount);
  result.deductions.socialSecurity = result.totalAmount * 0.085; // 8.5% for social security

  // Calculate net amount
  result.netAmount = result.totalAmount - 
    (result.deductions.breakTime + 
     result.deductions.irps + 
     result.deductions.socialSecurity);

  return result;
};

// Helper function to calculate hourly rate from monthly salary
export const calculateHourlyRate = (monthlySalary: number): number => {
  const averageWorkDaysPerMonth = 22; // Typical working days in a month
  const hoursPerDay = 8;
  return monthlySalary / (averageWorkDaysPerMonth * hoursPerDay);
};