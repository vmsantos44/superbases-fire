import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, User2, Plus, Search } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency } from '../utils/payrollCalculations';
import { useEmployees } from '../hooks/useEmployees';

interface NewEmployee {
  name: string;
  email: string;
  employee_id: string;
  tax_id: string;
  department: string;
  position: string;
  employment_type: 'Full Time' | 'Part Time' | 'Contract';
  work_location: string;
  compensation: {
    base_salary: number;
    food_allowance: number;
    communication_allowance: number;
    attendance_bonus: number;
    assiduity_bonus: number;
  };
}

const defaultEmployee: NewEmployee = {
  name: '',
  email: '',
  employee_id: '',
  tax_id: '',
  department: '',
  position: '',
  employment_type: 'Full Time',
  work_location: '',
  compensation: {
    base_salary: 0,
    food_allowance: 0,
    communication_allowance: 0,
    attendance_bonus: 0,
    assiduity_bonus: 0
  }
};

export default function Employees() {
  const navigate = useNavigate();
  const { employees, loading, error, refetchEmployees } = useEmployees();
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>(defaultEmployee);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('compensation.')) {
      const field = name.split('.')[1];
      setNewEmployee(prev => ({
        ...prev,
        compensation: {
          ...prev.compensation,
          [field]: parseFloat(value) || 0
        }
      }));
    } else {
      setNewEmployee(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const employeesRef = collection(db, 'employees');
      await addDoc(employeesRef, {
        ...newEmployee,
        start_date: Timestamp.fromDate(new Date()),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      
      setShowModal(false);
      setNewEmployee(defaultEmployee);
      refetchEmployees();
    } catch (err) {
      console.error('Error adding employee:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Error loading employees</h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/employee/${employee.id}`)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <User2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-500">{employee.employee_id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Building2 className="w-4 h-4 mr-2" />
                <span>{employee.position}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{employee.work_location}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Base Salary</span>
                  <span className="font-medium">
                    {formatCurrency(employee.compensation.base_salary)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold">Add New Employee</h2>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    required
                    value={newEmployee.employee_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                  <input
                    type="text"
                    name="tax_id"
                    required
                    value={newEmployee.tax_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={newEmployee.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    required
                    value={newEmployee.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  <select
                    name="employment_type"
                    required
                    value={newEmployee.employment_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Location</label>
                  <input
                    type="text"
                    name="work_location"
                    required
                    value={newEmployee.work_location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                    <input
                      type="number"
                      name="compensation.base_salary"
                      required
                      value={newEmployee.compensation.base_salary}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Food Allowance</label>
                    <input
                      type="number"
                      name="compensation.food_allowance"
                      value={newEmployee.compensation.food_allowance}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Communication Allowance</label>
                    <input
                      type="number"
                      name="compensation.communication_allowance"
                      value={newEmployee.compensation.communication_allowance}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attendance Bonus</label>
                    <input
                      type="number"
                      name="compensation.attendance_bonus"
                      value={newEmployee.compensation.attendance_bonus}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assiduity Bonus</label>
                    <input
                      type="number"
                      name="compensation.assiduity_bonus"
                      value={newEmployee.compensation.assiduity_bonus}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}