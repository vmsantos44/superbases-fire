export interface TimeEntry {
  id?: string;
  employee_id: string;
  entry_date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number;
  break_time: number;
  overtime_hours: number;
  status: 'regular' | 'dayoff';
  notes?: string;
}