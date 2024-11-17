import React from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Calendar, MapPin, Banknote, User2, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/payrollCalculations';
import { useEmployee } from '../hooks/useEmployees';

export default function EmployeeProfile() {
  const { id } = useParams();
  const { employee, loading, error } = useEmployee(id!);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading employee details...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-red-600">Employee not found</h2>
        <p className="text-gray-600 mt-2">{error?.message}</p>
      </div>
    );
  }

  const { compensation, banking, address } = employee;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 rounded-full p-3">
            <User2 className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <div className="flex items-center space-x-2 text-gray-500">
              <CreditCard className="w-4 h-4" />
              <span>{employee.employee_id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="font-medium">{employee.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{new Date(employee.start_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Compensation Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Salary</span>
              <span className="font-medium">{formatCurrency(compensation.base_salary)}</span>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Allowances</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Food Allowance</span>
                  <span>{formatCurrency(compensation.food_allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Communication Allowance</span>
                  <span>{formatCurrency(compensation.communication_allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Attendance Bonus</span>
                  <span>{formatCurrency(compensation.attendance_bonus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assiduity Bonus</span>
                  <span>{formatCurrency(compensation.assiduity_bonus)}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total Compensation</span>
                <span>{formatCurrency(
                  compensation.base_salary +
                  compensation.food_allowance +
                  compensation.communication_allowance +
                  compensation.attendance_bonus +
                  compensation.assiduity_bonus
                )}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {address.street}, {address.city}, {address.country}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Banknote className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Banking Information</p>
                <p className="font-medium">{banking.bank_name}</p>
                <p className="text-sm text-gray-500">Account: {banking.account_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}