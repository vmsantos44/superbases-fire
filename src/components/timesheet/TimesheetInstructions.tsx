import React from 'react';
import { Download } from 'lucide-react';

export default function TimesheetInstructions() {
  const handleDownloadSample = () => {
    const element = document.createElement('a');
    const file = new Blob([sampleTimesheet], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'sample_timesheet.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900">File Format Requirements</h3>
        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
          <li>Use CSV (.csv) or Excel (.xlsx, .xls) files</li>
          <li>First row must contain column headers</li>
          <li>Dates must be in YYYY-MM-DD format</li>
          <li>Times must be in HH:MM format (24-hour)</li>
          <li>For days off, use "Day Off" for both clock in/out</li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Required Columns</h3>
        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
          <li>ID Funcional (Employee ID)</li>
          <li>Nome (Name)</li>
          <li>Data (Date)</li>
          <li>Entrada (Clock In)</li>
          <li>Saída (Clock Out)</li>
          <li>Total Horas (Total Hours)</li>
          <li>Total Pausa (Break Time)</li>
          <li>Horas Extra (Overtime Hours)</li>
          <li>Status (regular/dayoff)</li>
          <li>Observação (Notes - optional)</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Verify employee IDs before upload</li>
          <li>Maximum 1000 entries per upload</li>
          <li>All times must be in 24-hour format</li>
          <li>Download and check the sample file format</li>
        </ul>
      </div>

      <button
        onClick={handleDownloadSample}
        className="mt-4 btn btn-secondary flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Download Sample CSV</span>
      </button>
    </div>
  );
}