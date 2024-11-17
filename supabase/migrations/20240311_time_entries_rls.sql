-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own entries
CREATE POLICY "Users can view their own time entries"
ON time_entries
FOR SELECT
USING (auth.uid() = employee_id);

-- Create policy for users to insert their own entries
CREATE POLICY "Users can insert their own time entries"
ON time_entries
FOR INSERT
WITH CHECK (auth.uid() = employee_id);

-- Create policy for users to update their own entries
CREATE POLICY "Users can update their own time entries"
ON time_entries
FOR UPDATE
USING (auth.uid() = employee_id)
WITH CHECK (auth.uid() = employee_id);

-- Create policy for users to delete their own entries
CREATE POLICY "Users can delete their own time entries"
ON time_entries
FOR DELETE
USING (auth.uid() = employee_id);