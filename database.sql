-- Update time_entries table
ALTER TABLE public.time_entries 
ALTER COLUMN clock_in TYPE TEXT,
ALTER COLUMN clock_out TYPE TEXT;

-- Add check constraint to ensure proper Day Off handling
ALTER TABLE public.time_entries 
ADD CONSTRAINT check_dayoff_entries 
CHECK (
  (status = 'dayoff' AND clock_in = 'Day Off' AND clock_out = 'Day Off')
  OR
  (status = 'regular' AND clock_in IS NOT NULL AND clock_out IS NOT NULL)
);