import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface TimeEntry {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  status: 'regular' | 'dayoff' | 'holiday' | 'sick' | 'vacation';
  notes: string | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

export default function TimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchEmployeeAndEntries();
    }
  }, [user]);

  const fetchEmployeeAndEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the employee data
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, name, email')
        .eq('email', user?.email);

      if (employeeError) throw employeeError;

      // Handle case where no employee record exists
      if (!employeeData || employeeData.length === 0) {
        setError('No employee record found. Please contact your administrator.');
        setLoading(false);
        return;
      }

      const currentEmployee = employeeData[0];
      setEmployee(currentEmployee);

      // Then fetch time entries for this employee
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', currentEmployee.id)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      setEntries(entriesData || []);
      const lastEntry = entriesData?.find(entry => !entry.clock_out);
      if (lastEntry) {
        setCurrentEntry(lastEntry);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!employee) {
      setError('Employee record not found. Please contact your administrator.');
      return;
    }

    try {
      setError(null);
      const now = new Date();
      const { data, error } = await supabase
        .from('time_entries')
        .insert([
          {
            employee_id: employee.id,
            date: now.toISOString().split('T')[0],
            clock_in: now.toTimeString().split(' ')[0],
            status: 'regular'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentEntry(data);
      await fetchEmployeeAndEntries();
    } catch (err: any) {
      console.error('Error clocking in:', err);
      setError(err.message);
    }
  };

  const handleClockOut = async () => {
    if (!currentEntry) return;

    try {
      setError(null);
      const now = new Date();
      const clockOutTime = now.toTimeString().split(' ')[0];
      
      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOutTime,
          total_hours: calculateHours(currentEntry.clock_in, clockOutTime)
        })
        .eq('id', currentEntry.id);

      if (error) throw error;

      setCurrentEntry(null);
      await fetchEmployeeAndEntries();
    } catch (err: any) {
      console.error('Error clocking out:', err);
      setError(err.message);
    }
  };

  const calculateHours = (clockIn: string, clockOut: string): number => {
    const [inHours, inMinutes, inSeconds] = clockIn.split(':').map(Number);
    const [outHours, outMinutes, outSeconds] = clockOut.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(inHours, inMinutes, inSeconds);
    
    const endDate = new Date();
    endDate.setHours(outHours, outMinutes, outSeconds);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading time entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span className="text-lg font-medium">Error</span>
        </div>
        <p className="text-gray-600">{error}</p>
        {error.includes('No employee record found') && (
          <button
            onClick={() => navigate('/employees')}
            className="btn btn-primary"
          >
            Go to Employees
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Time Entries</h1>
        <div className="flex space-x-4">
          {currentEntry ? (
            <button
              onClick={handleClockOut}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Clock Out</span>
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Clock In</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-700">Current Status</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {currentEntry ? 'Clocked In' : 'Not Clocked In'}
          </p>
          {currentEntry && (
            <p className="mt-1 text-sm text-gray-500">
              Since {currentEntry.clock_in}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-700">Today's Hours</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {entries
              .filter(entry => entry.date === new Date().toISOString().split('T')[0])
              .reduce((sum, entry) => sum + (entry.total_hours || 0), 0)
              .toFixed(1)}
          </p>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.clock_in}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.clock_out || 'Active'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.total_hours?.toFixed(2) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    entry.status === 'regular' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}