import React, { useState } from 'react';
import { Calculator, Save } from 'lucide-react';
import { formatCurrency } from '../utils/payrollCalculations';

interface TaxRate {
  min: number;
  max: number | null;
  rate: number;
  deduction: number;
  description: string;
}

// Cape Verde (IRPS) tax brackets
const incomeTaxRates: TaxRate[] = [
  { min: 0, max: 36606, rate: 0, deduction: 0, description: 'Tax Free' },
  { min: 36607, max: 80000, rate: 0.14, deduction: 5125, description: 'First Bracket' },
  { min: 80001, max: 150000, rate: 0.21, deduction: 10725, description: 'Second Bracket' },
  { min: 150001, max: null, rate: 0.25, deduction: 16725, description: 'Third Bracket' },
];

const socialSecurityRates = {
  employee: 0.085,
  employer: 0.15,
};

export default function TaxDeductions() {
  const [grossIncome, setGrossIncome] = useState<string>('');
  const [showCalculation, setShowCalculation] = useState(false);

  const calculateIncomeTax = (amount: number): number => {
    // Find applicable tax bracket
    const bracket = incomeTaxRates.find(
      (b) => amount >= b.min && (!b.max || amount <= b.max)
    );

    if (!bracket || amount <= incomeTaxRates[0].max!) {
      return 0;
    }

    // Calculate tax with deduction
    const tax = Math.round((amount * bracket.rate) - bracket.deduction);
    return Math.max(0, tax);
  };

  const calculateSocialSecurity = (amount: number): number => {
    return Math.round(amount * socialSecurityRates.employee);
  };

  const handleCalculate = () => {
    if (grossIncome) {
      setShowCalculation(true);
    }
  };

  const numericGrossIncome = grossIncome ? parseInt(grossIncome, 10) : 0;
  const incomeTax = calculateIncomeTax(numericGrossIncome);
  const socialSecurity = calculateSocialSecurity(numericGrossIncome);
  const netIncome = numericGrossIncome - incomeTax - socialSecurity;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tax Deductions Calculator</h1>
        <button className="btn btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Calculate Deductions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gross Income (CVE)
              </label>
              <input
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                placeholder="Enter gross income"
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCalculate}
              disabled={!grossIncome}
              className="w-full btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate</span>
            </button>
          </div>

          {showCalculation && grossIncome && (
            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Calculation Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Income</span>
                    <span className="font-medium">{formatCurrency(numericGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Income Tax (IRPS)</span>
                    <span>{incomeTax > 0 ? `-${formatCurrency(incomeTax)}` : formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Social Security (8.5%)</span>
                    <span>-{formatCurrency(socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600 pt-2 border-t">
                    <span>Net Income</span>
                    <span>{formatCurrency(netIncome)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tax Rates Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Tax Rates</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Income Tax Brackets (IRPS)</h3>
              <div className="space-y-2">
                {incomeTaxRates.map((bracket, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : '∞'}
                    </span>
                    <div className="text-right">
                      <span className="font-medium">{(bracket.rate * 100).toFixed(0)}%</span>
                      {bracket.deduction > 0 && (
                        <span className="text-gray-500 text-xs block">
                          Deduction: {formatCurrency(bracket.deduction)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Social Security Contributions</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employee Contribution</span>
                  <span className="font-medium">{(socialSecurityRates.employee * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employer Contribution</span>
                  <span className="font-medium">{(socialSecurityRates.employer * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}