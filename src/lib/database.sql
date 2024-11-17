-- Add new employee data for the authenticated user
INSERT INTO public.employees (
  id,
  employee_id,
  name,
  email,
  tax_id,
  department,
  position,
  employment_type,
  start_date,
  work_location
) VALUES (
  uuid_generate_v4(),
  'EMP004',
  'Test User',
  'test@example.com', -- Replace with your actual email
  'CVT23456792',
  'IT',
  'System Administrator',
  'Full Time',
  '2024-01-01',
  'Praia'
) ON CONFLICT (email) DO NOTHING;

-- Get the employee id we just inserted
DO $$
DECLARE
  v_employee_id UUID;
BEGIN
  SELECT id INTO v_employee_id FROM public.employees WHERE email = 'test@example.com'; -- Replace with your actual email

  -- Insert compensation data
  INSERT INTO public.employee_compensation (
    employee_id,
    base_salary,
    food_allowance,
    communication_allowance,
    attendance_bonus,
    assiduity_bonus
  ) VALUES (
    v_employee_id,
    85000,
    6500,
    3500,
    5000,
    5000
  ) ON CONFLICT (employee_id) DO NOTHING;

  -- Insert banking data
  INSERT INTO public.employee_banking (
    employee_id,
    bank_name,
    account_number
  ) VALUES (
    v_employee_id,
    'Banco Comercial do Atlântico',
    '12345678901'
  ) ON CONFLICT (employee_id) DO NOTHING;

  -- Insert address data
  INSERT INTO public.employee_address (
    employee_id,
    street,
    city,
    country
  ) VALUES (
    v_employee_id,
    'Rua Principal 456',
    'Praia',
    'Cape Verde'
  ) ON CONFLICT (employee_id) DO NOTHING;
END $$;