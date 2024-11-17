import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, Download, RefreshCw } from 'lucide-react';
import { collection, query, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as XLSX from 'xlsx';
import TimesheetPreview from '../components/timesheet/TimesheetPreview';
import TimesheetInstructions from '../components/timesheet/TimesheetInstructions';
import { parseCSV, parseExcel } from '../utils/timesheetParser';
import type { TimeEntry } from '../types/timeEntry';
import { sampleTimesheet } from '../data/sampleTimesheet';

interface Employee {
  id: string;
  employee_id: string;
}

const BATCH_SIZE = 50;

export default function TimesheetUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TimeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchEmployeeIds();
  }, [retryCount]);

  const fetchEmployeeIds = async () => {
    try {
      const employeesRef = collection(db, 'employees');
      const querySnapshot = await getDocs(query(employeesRef));
      
      const mapping: Record<string, string> = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        mapping[data.employee_id] = doc.id;
      });
      setEmployeeMap(mapping);
    } catch (err) {
      console.error('Error fetching employee IDs:', err);
      setError('Failed to load employee data. Please try again.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    setError(null);
    setSuccess(null);
    setPreview([]);

    try {
      let entries: TimeEntry[] = [];
      let errors: string[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        [entries, errors] = await parseCSV(text, employeeMap);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        [entries, errors] = await parseExcel(file, employeeMap);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      if (errors.length > 0) {
        throw new Error(`Validation errors:\n${errors.join('\n')}`);
      }

      if (entries.length === 0) {
        throw new Error('No valid entries found in the file.');
      }

      setPreview(entries);
    } catch (err: any) {
      setError('Error parsing file: ' + err.message);
      console.error('Parse error:', err);
    }
  };

  const handleUpload = async () => {
    if (!preview.length) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const timeEntriesRef = collection(db, 'time_entries');
      const batches = [];

      for (let i = 0; i < preview.length; i += BATCH_SIZE) {
        const batch = preview.slice(i, i + BATCH_SIZE).map(entry => {
          // Convert date string to Timestamp
          const entryDate = new Date(entry.entry_date);
          entryDate.setHours(0, 0, 0, 0); // Reset time to midnight

          return {
            employee_id: entry.employee_id,
            entry_date: Timestamp.fromDate(entryDate),
            clock_in: entry.clock_in,
            clock_out: entry.clock_out,
            total_hours: Number(entry.total_hours),
            break_time: Number(entry.break_time),
            overtime_hours: Number(entry.overtime_hours),
            status: entry.status,
            notes: entry.notes || '',
            created_at: Timestamp.now(),
            updated_at: Timestamp.now()
          };
        });
        batches.push(batch);
      }

      // Upload batches sequentially
      for (const batch of batches) {
        await Promise.all(
          batch.map(entry => addDoc(timeEntriesRef, entry))
        );
      }

      setSuccess(`Successfully uploaded ${preview.length} timesheet entries!`);
      setFile(null);
      setPreview([]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Upload failed: ' + (err.message || 'Please check the file format and try again'));
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Timesheet Upload</h1>
        <div className="flex space-x-4">
          {error && (
            <button
              onClick={handleRetry}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
          <button
            onClick={handleDownloadSample}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="btn btn-primary cursor-pointer inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Select Timesheet</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">CSV or Excel files</p>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-900">{file.name}</span>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !preview.length}
                  className="btn btn-primary btn-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm whitespace-pre-wrap">{error}</div>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                <Check className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {preview.length > 0 && <TimesheetPreview entries={preview} />}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Instructions</h2>
          <TimesheetInstructions />
        </div>
      </div>
    </div>
  );
}