import React, { useState, useEffect } from 'react';
import { Calendar, Calculator, Eye } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TimeEntry } from '../../types/timeEntry';
import { formatCurrency } from '../../utils/payrollCalculations';
import TimeEntriesModal from '../../components/payroll/TimeEntriesModal';

interface PayrollCalculation {
  regularHours: number;
  overtimeHours: number;
  weekendHours: number;
  holidayHours: number;
  totalAmount: number;
  deductions: {
    breakTime: number;
    irps: number;
    socialSecurity: number;
  };
  netAmount: number;
}

const calculateHourlyRate = (monthlySalary: number): number => {
  const averageWorkDaysPerMonth = 22;
  const hoursPerDay = 8;
  return monthlySalary / (averageWorkDaysPerMonth * hoursPerDay);
};

export default function PayrollCalculator() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTimeEntries, setShowTimeEntries] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<{
    baseSalary: number;
    hourlyRate: number;
  }>({
    baseSalary: 0,
    hourlyRate: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const employeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEmployees(employeesData);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmployeePayroll = async () => {
    if (!selectedEmployee || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        throw new Error('Start date must be before end date');
      }

      // Get time entries
      const timeEntriesRef = collection(db, 'time_entries');
      const entriesQuery = query(
        timeEntriesRef,
        where('employee_id', '==', selectedEmployee),
        where('entry_date', '>=', Timestamp.fromDate(start)),
        where('entry_date', '<=', Timestamp.fromDate(end)),
        orderBy('entry_date', 'asc')
      );

      const entriesSnapshot = await getDocs(entriesQuery);
      const entries = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        entry_date: doc.data().entry_date.toDate().toISOString().split('T')[0]
      })) as TimeEntry[];

      // Get employee data
      const employeeDoc = employees.find(emp => emp.id === selectedEmployee);
      if (!employeeDoc) throw new Error('Employee not found');

      const baseSalary = employeeDoc.compensation.base_salary;
      const hourlyRate = calculateHourlyRate(baseSalary);

      setTimeEntries(entries);
      setSelectedEmployeeData({
        baseSalary,
        hourlyRate
      });

      // Calculate totals
      const result: PayrollCalculation = {
        regularHours: 0,
        overtimeHours: 0,
        weekendHours: 0,
        holidayHours: 0,
        totalAmount: baseSalary,
        deductions: {
          breakTime: 0,
          irps: 0,
          socialSecurity: 0
        },
        netAmount: 0
      };

      entries.forEach(entry => {
        if (entry.status === 'regular') {
          result.regularHours += entry.total_hours;
        }
      });

      setCalculation(result);

    } catch (err: any) {
      console.error('Error calculating payroll:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employee = employees.find(emp => emp.id === e.target.value);
    setSelectedEmployee(e.target.value);
    setSelectedEmployeeName(employee?.name || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Calculator</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={calculateEmployeePayroll}
              disabled={!selectedEmployee || !startDate || !endDate || loading}
              className="w-full btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Payroll</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {calculation && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Regular Hours</span>
                </div>
                <p className="text-2xl font-bold">{calculation.regularHours.toFixed(1)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Base Salary</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(selectedEmployeeData.baseSalary)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Hourly Rate</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(selectedEmployeeData.hourlyRate)}</p>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowTimeEntries(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TimeEntriesModal
        isOpen={showTimeEntries}
        onClose={() => setShowTimeEntries(false)}
        timeEntries={timeEntries}
        employeeName={selectedEmployeeName}
        startDate={startDate}
        endDate={endDate}
        baseSalary={selectedEmployeeData.baseSalary}
        hourlyRate={selectedEmployeeData.hourlyRate}
      />
    </div>
  );
}