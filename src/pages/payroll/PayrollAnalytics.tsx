import React from 'react';
import { PieChart } from 'lucide-react';

export default function PayrollAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payroll Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">
            View payroll trends and insights
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Content will be implemented later */}
        <p className="text-gray-500">Analytics features coming soon...</p>
      </div>
    </div>
  );
}