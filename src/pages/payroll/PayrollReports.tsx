import React from 'react';
import { FileText } from 'lucide-react';

export default function PayrollReports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payroll Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate and download payroll reports
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Content will be implemented later */}
        <p className="text-gray-500">Report generation features coming soon...</p>
      </div>
    </div>
  );
}