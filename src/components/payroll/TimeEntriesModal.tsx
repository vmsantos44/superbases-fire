import React, { useState, useMemo } from 'react';
import { X, Calendar, ChevronDown, ChevronUp, Filter, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/payrollCalculations';

interface TimeEntry {
  entry_date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number;
  break_time: number;
  overtime_hours: number;
  status: string;
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  breakHours: number;
  dayoffCount: number;
  expectedHours: number;
  variance: number;
  earnings: {
    regular: number;
    overtime: number;
    total: number;
  };
  entries: TimeEntry[];
}

interface TimeEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntries: TimeEntry[];
  employeeName: string;
  startDate: string;
  endDate: string;
  baseSalary: number;
  hourlyRate: number;
}

const EXPECTED_DAILY_HOURS = 8;
const EXPECTED_WEEKLY_HOURS = 40;
const OVERTIME_MULTIPLIER = 1.5;

const createWeeklySummary = (
  entries: TimeEntry[],
  weekStart: string,
  weekEnd: string,
  hourlyRate: number
): WeeklySummary => {
  const regularHours = entries
    .filter(e => e.status === 'regular')
    .reduce((sum, entry) => sum + Math.min(entry.total_hours, EXPECTED_DAILY_HOURS), 0);

  const overtimeHours = entries
    .filter(e => e.status === 'regular')
    .reduce((sum, entry) => sum + entry.overtime_hours, 0);

  const breakHours = entries
    .reduce((sum, entry) => sum + entry.break_time, 0);

  const dayoffCount = entries.filter(e => e.status === 'dayoff').length;
  const workdays = 5 - dayoffCount; // Assuming Monday-Friday work week
  const expectedHours = workdays * EXPECTED_DAILY_HOURS;

  return {
    weekStart,
    weekEnd,
    totalHours: regularHours + overtimeHours,
    regularHours,
    overtimeHours,
    breakHours,
    dayoffCount,
    expectedHours,
    variance: (regularHours + overtimeHours) - expectedHours,
    earnings: {
      regular: regularHours * hourlyRate,
      overtime: overtimeHours * hourlyRate * OVERTIME_MULTIPLIER,
      total: (regularHours * hourlyRate) + (overtimeHours * hourlyRate * OVERTIME_MULTIPLIER)
    },
    entries
  };
};

export default function TimeEntriesModal({
  isOpen,
  onClose,
  timeEntries,
  employeeName,
  startDate,
  endDate,
  baseSalary,
  hourlyRate
}: TimeEntriesModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const months = useMemo(() => {
    const uniqueMonths = new Set(
      timeEntries.map(entry => entry.entry_date.substring(0, 7))
    );
    return Array.from(uniqueMonths).sort();
  }, [timeEntries]);

  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => 
      selectedMonth === 'all' || entry.entry_date.startsWith(selectedMonth)
    );
  }, [timeEntries, selectedMonth]);

  const weeklySummaries = useMemo(() => {
    const summaries: WeeklySummary[] = [];
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      a.entry_date.localeCompare(b.entry_date)
    );

    let currentWeek: TimeEntry[] = [];
    let currentWeekStart = '';

    sortedEntries.forEach(entry => {
      const entryDate = new Date(entry.entry_date);
      const weekStart = new Date(entryDate);
      weekStart.setDate(entryDate.getDate() - entryDate.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      if (weekStartStr !== currentWeekStart && currentWeek.length > 0) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() - 1);
        summaries.push(createWeeklySummary(
          currentWeek,
          currentWeekStart,
          weekEnd.toISOString().split('T')[0],
          hourlyRate
        ));
        currentWeek = [];
      }

      currentWeekStart = weekStartStr;
      currentWeek.push(entry);
    });

    if (currentWeek.length > 0) {
      const lastWeekEnd = new Date(currentWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
      summaries.push(createWeeklySummary(
        currentWeek,
        currentWeekStart,
        lastWeekEnd.toISOString().split('T')[0],
        hourlyRate
      ));
    }

    return summaries;
  }, [filteredEntries, hourlyRate]);

  const periodTotals = useMemo(() => {
    return weeklySummaries.reduce((totals, week) => ({
      regularHours: totals.regularHours + week.regularHours,
      overtimeHours: totals.overtimeHours + week.overtimeHours,
      breakHours: totals.breakHours + week.breakHours,
      expectedHours: totals.expectedHours + week.expectedHours,
      earnings: totals.earnings + week.earnings.total
    }), {
      regularHours: 0,
      overtimeHours: 0,
      breakHours: 0,
      expectedHours: 0,
      earnings: 0
    });
  }, [weeklySummaries]);

  const toggleWeek = (weekStart: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekStart)) {
      newExpanded.delete(weekStart);
    } else {
      newExpanded.add(weekStart);
    }
    setExpandedWeeks(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attendance & Earnings Detail</h2>
            <p className="text-sm text-gray-500">
              {employeeName} • {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Period Summary */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Regular Hours</div>
              <div className="text-lg font-semibold">{periodTotals.regularHours.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Expected: {periodTotals.expectedHours}</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Overtime Hours</div>
              <div className="text-lg font-semibold">{periodTotals.overtimeHours.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Rate: {OVERTIME_MULTIPLIER}x</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Break Hours</div>
              <div className="text-lg font-semibold">{periodTotals.breakHours.toFixed(1)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Hourly Rate</div>
              <div className="text-lg font-semibold">{formatCurrency(hourlyRate)}</div>
              <div className="text-xs text-gray-400">Base: {formatCurrency(baseSalary)}/mo</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Period Earnings</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(periodTotals.earnings)}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="all">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString(undefined, { 
                    year: 'numeric',
                    month: 'long'
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weekly Summaries */}
        <div className="overflow-auto flex-1 p-4">
          <div className="space-y-4">
            {weeklySummaries.map((week) => (
              <div key={week.weekStart} className="border rounded-lg">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleWeek(week.weekStart)}
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Week of {new Date(week.weekStart).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {week.entries.length} entries • {week.dayoffCount} days off
                    </p>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="grid grid-cols-3 gap-6 text-right">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {week.totalHours.toFixed(1)} hrs
                        </p>
                        <p className="text-xs text-gray-500">
                          Expected: {week.expectedHours}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {week.overtimeHours.toFixed(1)} OT
                        </p>
                        <p className="text-xs text-gray-500">
                          {week.breakHours.toFixed(1)} break
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(week.earnings.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          +{formatCurrency(week.earnings.overtime)} OT
                        </p>
                      </div>
                    </div>
                    {expandedWeeks.has(week.weekStart) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedWeeks.has(week.weekStart) && (
                  <div className="border-t">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clock In/Out
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Break
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overtime
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Earnings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {week.entries.map((entry, index) => {
                          const regularHours = Math.min(entry.total_hours, EXPECTED_DAILY_HOURS);
                          const dailyEarnings = (regularHours * hourlyRate) + 
                            (entry.overtime_hours * hourlyRate * OVERTIME_MULTIPLIER);

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(entry.entry_date).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {entry.status === 'dayoff' ? (
                                  <span className="text-gray-500">-</span>
                                ) : (
                                  <>
                                    {entry.clock_in} - {entry.clock_out}
                                  </>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {entry.total_hours.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {entry.break_time.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {entry.overtime_hours > 0 ? (
                                  <span className="text-orange-600">
                                    +{entry.overtime_hours.toFixed(2)}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {entry.status === 'dayoff' ? (
                                  <span className="text-gray-500">-</span>
                                ) : (
                                  formatCurrency(dailyEarnings)
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  entry.status === 'regular'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {entry.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}