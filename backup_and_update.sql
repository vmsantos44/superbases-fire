-- First, create backup tables
CREATE OR REPLACE FUNCTION backup_tables() 
RETURNS void AS $$
BEGIN
    -- Copy employees table
    CREATE TABLE IF NOT EXISTS backup_employees AS 
    SELECT * FROM employees;
    
    -- Copy employee_compensation table
    CREATE TABLE IF NOT EXISTS backup_employee_compensation AS 
    SELECT * FROM employee_compensation;
    
    -- Copy employee_banking table
    CREATE TABLE IF NOT EXISTS backup_employee_banking AS 
    SELECT * FROM employee_banking;
    
    -- Copy employee_address table
    CREATE TABLE IF NOT EXISTS backup_employee_address AS 
    SELECT * FROM employee_address;
END;
$$ LANGUAGE plpgsql;

-- Execute backup
SELECT backup_tables();

-- Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  clock_in VARCHAR(5),
  clock_out VARCHAR(5),
  total_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  break_time DECIMAL(5,2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('regular', 'dayoff')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON public.time_entries(employee_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view time entries"
  ON public.time_entries
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert time entries"
  ON public.time_entries
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update time entries"
  ON public.time_entries
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to time_entries
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();