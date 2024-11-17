import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import TimesheetUpload from './pages/TimesheetUpload';
import TimesheetView from './pages/TimesheetView';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import TaxDeductions from './pages/TaxDeductions';
import PayrollLayout from './pages/payroll/PayrollLayout';
import PayrollCalculator from './pages/payroll/PayrollCalculator';
import PayrollProcessing from './pages/payroll/PayrollProcessing';
import PayrollReports from './pages/payroll/PayrollReports';
import PayrollAnalytics from './pages/payroll/PayrollAnalytics';
import PayrollSettings from './pages/payroll/PayrollSettings';
import { useAuthStore } from './store/authStore';
import { initializeFirebaseData } from './lib/initFirebase';

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Initialize sample data when user logs in
      if (user) {
        try {
          await initializeFirebaseData();
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const user = auth.currentUser;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/employees" /> : <LoginForm />}
        />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="timesheet-upload" element={<TimesheetUpload />} />
          <Route path="timesheet-view" element={<TimesheetView />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employee/:id" element={<EmployeeProfile />} />
          <Route path="tax-deductions" element={<TaxDeductions />} />
          <Route path="payroll" element={<PayrollLayout />}>
            <Route index element={<PayrollLayout />} />
            <Route path="calculator" element={<PayrollCalculator />} />
            <Route path="processing" element={<PayrollProcessing />} />
            <Route path="reports" element={<PayrollReports />} />
            <Route path="analytics" element={<PayrollAnalytics />} />
            <Route path="settings" element={<PayrollSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}