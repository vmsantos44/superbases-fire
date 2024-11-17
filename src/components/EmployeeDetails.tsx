import React from 'react';
import { Employee, Compensation, PayrollCalculation } from '../types/employee';
import { calculatePayroll, formatCurrency } from '../utils/payrollCalculations';

interface EmployeeDetailsProps {
  employee: Employee;
  compensation: Compensation;
}

export default function EmployeeDetails({ employee, compensation }: EmployeeDetailsProps) {
  const payroll: PayrollCalculation = calculatePayroll(
    compensation.baseSalary,
    compensation.allowances
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Employee ID</label>
              <p className="font-medium">{employee.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-medium">{employee.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tax ID</label>
              <p className="font-medium">{employee.taxId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{employee.email}</p>
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Employment Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Department</label>
              <p className="font-medium">{employee.department}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Position</label>
              <p className="font-medium">{employee.position}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Employment Type</label>
              <p className="font-medium">{employee.employmentType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <p className="font-medium">{new Date(employee.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        {/* Salary Breakdown */}
        <section className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Salary Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Base Salary</label>
                <p className="font-medium">{formatCurrency(compensation.baseSalary)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Allowances & Bonuses</label>
                <ul className="space-y-2 mt-2">
                  <li className="flex justify-between">
                    <span>Food Allowance</span>
                    <span>{formatCurrency(compensation.allowances.foodAllowance)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Communication Allowance</span>
                    <span>{formatCurrency(compensation.allowances.communicationAllowance)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Attendance Bonus</span>
                    <span>{formatCurrency(compensation.allowances.attendanceBonus)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Assiduity Bonus</span>
                    <span>{formatCurrency(compensation.allowances.assiduityBonus)}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Deductions</label>
                <ul className="space-y-2 mt-2">
                  <li className="flex justify-between">
                    <span>IRPS (Income Tax)</span>
                    <span className="text-red-600">
                      -{formatCurrency(payroll.deductions.irps)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Social Security (8%)</span>
                    <span className="text-red-600">
                      -{formatCurrency(payroll.deductions.socialSecurity)}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(payroll.grossSalary)}</span>
                </div>
                <div className="flex justify-between font-semibold text-red-600">
                  <span>Total Deductions</span>
                  <span>-{formatCurrency(payroll.totalDeductions)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-green-600 mt-2">
                  <span>Net Salary</span>
                  <span>{formatCurrency(payroll.netSalary)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}