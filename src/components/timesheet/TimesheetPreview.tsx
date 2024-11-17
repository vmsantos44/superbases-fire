import React from 'react';
import { TimeEntry } from '../../types/timeEntry';

interface TimesheetPreviewProps {
  entries: TimeEntry[];
}

export default function TimesheetPreview({ entries }: TimesheetPreviewProps) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        Preview ({entries.length} entries)
      </h3>
      <div className="bg-gray-50 rounded-lg overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Employee ID
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Clock In
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Clock Out
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Hours
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Break
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky top-0 bg-gray-100">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {entry.employee_id}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {entry.entry_date}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {entry.status === 'dayoff' ? 'Day Off' : entry.clock_in}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {entry.status === 'dayoff' ? 'Day Off' : entry.clock_out}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {entry.total_hours.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {entry.break_time.toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      entry.status === 'regular'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
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