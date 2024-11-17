import * as XLSX from 'xlsx';
import { TimeEntry } from '../types/timeEntry';

export const validateTimeEntry = (entry: TimeEntry): boolean => {
  if (!entry.employee_id || !entry.entry_date) return false;
  
  if (entry.status === 'regular') {
    if (!entry.clock_in || !entry.clock_out) return false;
    if (isNaN(entry.total_hours) || entry.total_hours < 0) return false;
  }
  
  return true;
};

export const parseCSV = async (
  text: string,
  employeeMap: Record<string, string>
): Promise<[TimeEntry[], string[]]> => {
  const rows = text.split('\n');
  const entries: TimeEntry[] = [];
  const errors: string[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!row) continue;
    
    const [
      emp_id,
      _name,
      date,
      clock_in,
      clock_out,
      total_hours,
      break_time,
      overtime_hours,
      status,
      notes
    ] = row.split(',').map(field => field.trim());

    if (!employeeMap[emp_id]) {
      errors.push(`Row ${i + 1}: Unknown employee ID: ${emp_id}`);
      continue;
    }

    const entry = {
      employee_id: employeeMap[emp_id],
      entry_date: date,
      clock_in: clock_in === 'Day Off' ? null : clock_in,
      clock_out: clock_out === 'Day Off' ? null : clock_out,
      total_hours: parseFloat(total_hours) || 0,
      break_time: parseFloat(break_time) || 0,
      overtime_hours: parseFloat(overtime_hours) || 0,
      status: status.toLowerCase() as 'regular' | 'dayoff',
      notes: notes || undefined
    };

    if (!validateTimeEntry(entry)) {
      errors.push(`Row ${i + 1}: Invalid entry data`);
      continue;
    }

    entries.push(entry);
  }

  return [entries, errors];
};

export const parseExcel = async (
  file: File,
  employeeMap: Record<string, string>
): Promise<[TimeEntry[], string[]]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const entries: TimeEntry[] = [];
        const errors: string[] = [];

        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (!row.length) continue;

          const [
            emp_id,
            _name,
            date,
            clock_in,
            clock_out,
            total_hours,
            break_time,
            overtime_hours,
            status,
            notes
          ] = row;

          if (!employeeMap[emp_id]) {
            errors.push(`Row ${i + 1}: Unknown employee ID: ${emp_id}`);
            continue;
          }

          const entry = {
            employee_id: employeeMap[emp_id],
            entry_date: date,
            clock_in: clock_in === 'Day Off' ? null : clock_in,
            clock_out: clock_out === 'Day Off' ? null : clock_out,
            total_hours: parseFloat(total_hours) || 0,
            break_time: parseFloat(break_time) || 0,
            overtime_hours: parseFloat(overtime_hours) || 0,
            status: status.toLowerCase() as 'regular' | 'dayoff',
            notes: notes || undefined
          };

          if (!validateTimeEntry(entry)) {
            errors.push(`Row ${i + 1}: Invalid entry data`);
            continue;
          }

          entries.push(entry);
        }

        resolve([entries, errors]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};