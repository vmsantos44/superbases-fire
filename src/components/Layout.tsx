import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calculator,
  BarChart3, 
  Settings, 
  LogOut,
  User,
  FileSpreadsheet,
  Table,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../lib/firebase';

const navItems = [
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: FileSpreadsheet, label: 'Upload Timesheet', path: '/timesheet-upload' },
  { icon: Table, label: 'View Timesheets', path: '/timesheet-view' },
  { icon: DollarSign, label: 'Payroll', path: '/payroll' },
  { icon: Calculator, label: 'Tax Deductions', path: '/tax-deductions' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">TimeTrack</h1>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="flex-shrink-0">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {auth.currentUser?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}