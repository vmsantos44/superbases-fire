-- First, let's create a backup of our current data
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
    
    -- Copy time_entries table if it exists
    CREATE TABLE IF NOT EXISTS backup_time_entries AS 
    SELECT * FROM time_entries;
END;
$$ LANGUAGE plpgsql;