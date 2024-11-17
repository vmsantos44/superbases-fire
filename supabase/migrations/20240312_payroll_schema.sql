-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_payroll_settings_updated_at ON payroll_settings;
DROP TRIGGER IF EXISTS update_payroll_runs_updated_at ON payroll_runs;
DROP TRIGGER IF EXISTS update_payroll_run_entries_updated_at ON payroll_run_entries;
DROP TRIGGER IF EXISTS update_payroll_adjustments_updated_at ON payroll_adjustments;

-- Create user roles table first
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'payroll_admin', 'manager', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON user_roles;

-- Create policy for user_roles
CREATE POLICY "Users can view roles"
  ON user_roles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify roles"
  ON user_roles FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Drop existing types if they exist
DROP TYPE IF EXISTS payroll_run_status CASCADE;
DROP TYPE IF EXISTS payroll_run_type CASCADE;

-- Payroll Run Status Enum
CREATE TYPE payroll_run_status AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'processing',
  'completed',
  'cancelled'
);

-- Payroll Run Types Enum
CREATE TYPE payroll_run_type AS ENUM (
  'regular',
  'bonus',
  'adjustment',
  'termination'
);

-- Create payroll_settings table
CREATE TABLE IF NOT EXISTS payroll_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  pay_period_type VARCHAR(20) NOT NULL,
  pay_day INTEGER NOT NULL,
  irps_enabled BOOLEAN DEFAULT true,
  social_security_enabled BOOLEAN DEFAULT true,
  social_security_rate DECIMAL(5,2) DEFAULT 8.50,
  overtime_rate DECIMAL(5,2) DEFAULT 1.50,
  weekend_rate DECIMAL(5,2) DEFAULT 2.00,
  holiday_rate DECIMAL(5,2) DEFAULT 2.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, tax_year)
);

-- Create payroll_runs table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  run_type payroll_run_type NOT NULL DEFAULT 'regular',
  status payroll_run_status NOT NULL DEFAULT 'draft',
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  total_gross DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  processed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payroll_run_entries table
CREATE TABLE IF NOT EXISTS payroll_run_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  base_salary DECIMAL(12,2) NOT NULL,
  food_allowance DECIMAL(12,2) DEFAULT 0,
  communication_allowance DECIMAL(12,2) DEFAULT 0,
  attendance_bonus DECIMAL(12,2) DEFAULT 0,
  assiduity_bonus DECIMAL(12,2) DEFAULT 0,
  overtime_hours DECIMAL(6,2) DEFAULT 0,
  overtime_amount DECIMAL(12,2) DEFAULT 0,
  gross_salary DECIMAL(12,2) NOT NULL,
  irps_amount DECIMAL(12,2) DEFAULT 0,
  social_security_amount DECIMAL(12,2) DEFAULT 0,
  other_deductions DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payroll_run_id, employee_id)
);

-- Create payroll_adjustments table
CREATE TABLE IF NOT EXISTS payroll_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  payroll_run_id UUID REFERENCES payroll_runs(id),
  adjustment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_dates ON payroll_runs(company_id, pay_period_start, pay_period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_run_entries_employee ON payroll_run_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_employee ON payroll_adjustments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_run ON payroll_adjustments(payroll_run_id);

-- Enable RLS
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_run_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_adjustments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view payroll settings" ON payroll_settings;
DROP POLICY IF EXISTS "Only admins can modify payroll settings" ON payroll_settings;
DROP POLICY IF EXISTS "Users can view payroll runs" ON payroll_runs;
DROP POLICY IF EXISTS "Only payroll admins can modify payroll runs" ON payroll_runs;
DROP POLICY IF EXISTS "Users can view their own payroll entries" ON payroll_run_entries;
DROP POLICY IF EXISTS "Only payroll admins can modify payroll entries" ON payroll_run_entries;
DROP POLICY IF EXISTS "Users can view their own adjustments" ON payroll_adjustments;
DROP POLICY IF EXISTS "Only payroll admins can modify adjustments" ON payroll_adjustments;

-- Create policies
CREATE POLICY "Users can view payroll settings"
  ON payroll_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify payroll settings"
  ON payroll_settings FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view payroll runs"
  ON payroll_runs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only payroll admins can modify payroll runs"
  ON payroll_runs FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'payroll_admin')
    )
  );

CREATE POLICY "Users can view their own payroll entries"
  ON payroll_run_entries FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (
      employee_id IN (
        SELECT id FROM employees WHERE email = auth.jwt()->>'email'
      ) 
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'payroll_admin')
      )
    )
  );

CREATE POLICY "Only payroll admins can modify payroll entries"
  ON payroll_run_entries FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'payroll_admin')
    )
  );

CREATE POLICY "Users can view their own adjustments"
  ON payroll_adjustments FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (
      employee_id IN (
        SELECT id FROM employees WHERE email = auth.jwt()->>'email'
      ) 
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'payroll_admin')
      )
    )
  );

CREATE POLICY "Only payroll admins can modify adjustments"
  ON payroll_adjustments FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'payroll_admin')
    )
  );

-- Create trigger functions for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_settings_updated_at
    BEFORE UPDATE ON payroll_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at
    BEFORE UPDATE ON payroll_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_run_entries_updated_at
    BEFORE UPDATE ON payroll_run_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_adjustments_updated_at
    BEFORE UPDATE ON payroll_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();