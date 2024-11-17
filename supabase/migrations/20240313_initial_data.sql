-- Create initial company
INSERT INTO companies (
  id,
  name,
  tax_id
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Demo Company Ltd',
  'CVT123456789'
) ON CONFLICT (tax_id) DO NOTHING;

-- Insert initial admin user role for the test user
INSERT INTO user_roles (user_id, role)
SELECT 
  id as user_id,
  'admin' as role
FROM auth.users
WHERE email = 'test@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert payroll admin role for the test user
INSERT INTO user_roles (user_id, role)
SELECT 
  id as user_id,
  'payroll_admin' as role
FROM auth.users
WHERE email = 'test@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert initial payroll settings
INSERT INTO payroll_settings (
  company_id,
  tax_year,
  pay_period_type,
  pay_day,
  irps_enabled,
  social_security_enabled,
  social_security_rate,
  overtime_rate,
  weekend_rate,
  holiday_rate
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  2024,
  'monthly',
  25,
  true,
  true,
  8.50,
  1.50,
  2.00,
  2.00
) ON CONFLICT (company_id, tax_year) DO NOTHING;

-- Create a test payroll run
INSERT INTO payroll_runs (
  company_id,
  run_type,
  status,
  pay_period_start,
  pay_period_end,
  payment_date
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'regular',
  'draft',
  '2024-03-01',
  '2024-03-31',
  '2024-03-25'
) ON CONFLICT DO NOTHING;

-- Insert payroll entries for existing employees
WITH latest_run AS (
  SELECT id 
  FROM payroll_runs 
  WHERE company_id = '123e4567-e89b-12d3-a456-426614174000'
  ORDER BY created_at DESC 
  LIMIT 1
)
INSERT INTO payroll_run_entries (
  payroll_run_id,
  employee_id,
  base_salary,
  food_allowance,
  communication_allowance,
  attendance_bonus,
  assiduity_bonus,
  gross_salary,
  net_salary
)
SELECT 
  lr.id as payroll_run_id,
  e.id as employee_id,
  ec.base_salary,
  ec.food_allowance,
  ec.communication_allowance,
  ec.attendance_bonus,
  ec.assiduity_bonus,
  (ec.base_salary + ec.food_allowance + ec.communication_allowance + 
   ec.attendance_bonus + ec.assiduity_bonus) as gross_salary,
  (ec.base_salary + ec.food_allowance + ec.communication_allowance + 
   ec.attendance_bonus + ec.assiduity_bonus) * 0.915 as net_salary
FROM employees e
JOIN employee_compensation ec ON e.id = ec.employee_id
CROSS JOIN latest_run lr
ON CONFLICT (payroll_run_id, employee_id) DO NOTHING;

-- Update the payroll run totals
WITH latest_run AS (
  SELECT id 
  FROM payroll_runs 
  WHERE company_id = '123e4567-e89b-12d3-a456-426614174000'
  ORDER BY created_at DESC 
  LIMIT 1
)
UPDATE payroll_runs pr
SET 
  total_gross = subquery.total_gross,
  total_deductions = subquery.total_deductions,
  total_net = subquery.total_net
FROM (
  SELECT 
    pre.payroll_run_id,
    SUM(pre.gross_salary) as total_gross,
    SUM(pre.gross_salary * 0.085) as total_deductions,
    SUM(pre.net_salary) as total_net
  FROM payroll_run_entries pre
  JOIN latest_run lr ON pre.payroll_run_id = lr.id
  GROUP BY pre.payroll_run_id
) as subquery
WHERE pr.id = subquery.payroll_run_id;