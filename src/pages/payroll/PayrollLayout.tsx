import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calculator, DollarSign, FileText, Settings, PieChart } from 'lucide-react';

const payrollNavItems = [
  {
    path: '/payroll/calculator',
    label: 'Payroll Calculator',
    icon: Calculator,
    description: 'Calculate employee payroll and deductions'
  },
  {
    path: '/payroll/processing',
    label: 'Payroll Processing',
    icon: DollarSign,
    description: 'Process and approve payroll runs'
  },
  {
    path: '/payroll/reports',
    label: 'Reports',
    icon: FileText,
    description: 'Generate payroll and tax reports'
  },
  {
    path: '/payroll/analytics',
    label: 'Analytics',
    icon: PieChart,
    description: 'Payroll analytics and insights'
  },
  {
    path: '/payroll/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configure payroll rules and settings'
  }
];

export default function PayrollLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage employee payroll, process payments, and generate reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Cards */}
        {location.pathname === '/payroll' && (
          <>
            {payrollNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {item.label}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Sub-pages will be rendered here */}
      <Outlet />
    </div>
  );
}