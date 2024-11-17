-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create new policies that use the employee ID from the employees table
CREATE POLICY "Users can view their own time entries"
ON time_entries FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE email = auth.jwt()->>'email'
  )
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'payroll_admin')
  )
);

CREATE POLICY "Users can insert their own time entries"
ON time_entries FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Users can update their own time entries"
ON time_entries FOR UPDATE
USING (
  employee_id IN (
    SELECT id FROM employees WHERE email = auth.jwt()->>'email'
  )
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'payroll_admin')
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE email = auth.jwt()->>'email'
  )
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'payroll_admin')
  )
);

CREATE POLICY "Users can delete their own time entries"
ON time_entries FOR DELETE
USING (
  employee_id IN (
    SELECT id FROM employees WHERE email = auth.jwt()->>'email'
  )
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'payroll_admin')
  )
);