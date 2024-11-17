import React from 'react';
import { Settings } from 'lucide-react';

export default function PayrollSettings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payroll Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure payroll rules and settings
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Content will be implemented later */}
        <p className="text-gray-500">Settings configuration coming soon...</p>
      </div>
    </div>
  );
}