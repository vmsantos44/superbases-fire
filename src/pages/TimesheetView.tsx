import React from 'react';
import TimesheetFilters from '../components/timesheet/TimesheetFilters';
import TimesheetTable from '../components/timesheet/TimesheetTable';
import { useEmployees } from '../hooks/useEmployees';
import { useTimesheetStore } from '../store/timesheetStore';

export default function TimesheetView() {
  const { employees, loading: employeesLoading, error: employeesError } = useEmployees();
  const { loading, error } = useTimesheetStore();

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading employees...</div>
      </div>
    );
  }

  if (employeesError || error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {employeesError?.message || error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Timesheet Records</h1>
      </div>

      <TimesheetFilters employees={employees} />
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Loading timesheets...</div>
        </div>
      ) : (
        <TimesheetTable />
      )}
    </div>
  );
}