import { collection, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const employees = [
  {
    employee_id: 'EMP001',
    name: 'João Silva',
    email: 'joao.silva@company.cv',
    tax_id: 'CVT23456789',
    department: 'Engineering',
    position: 'Software Engineer',
    employment_type: 'Full Time',
    start_date: '2023-01-15',
    work_location: 'Praia',
    compensation: {
      base_salary: 85000,
      food_allowance: 6500,
      communication_allowance: 3500,
      attendance_bonus: 5000,
      assiduity_bonus: 5000
    },
    banking: {
      bank_name: 'Banco Comercial do Atlântico',
      account_number: '12345678900'
    },
    address: {
      street: 'Rua Principal 123',
      city: 'Praia',
      country: 'Cape Verde'
    }
  },
  {
    employee_id: 'EMP002',
    name: 'Maria Santos',
    email: 'maria.santos@company.cv',
    tax_id: 'CVT23456790',
    department: 'Product',
    position: 'Product Manager',
    employment_type: 'Full Time',
    start_date: '2023-02-01',
    work_location: 'Praia',
    compensation: {
      base_salary: 95000,
      food_allowance: 6500,
      communication_allowance: 3500,
      attendance_bonus: 5000,
      assiduity_bonus: 5000
    },
    banking: {
      bank_name: 'Caixa Económica',
      account_number: '98765432100'
    },
    address: {
      street: 'Avenida Central 456',
      city: 'Praia',
      country: 'Cape Verde'
    }
  },
  {
    employee_id: 'EMP003',
    name: 'António Ferreira',
    email: 'antonio.ferreira@company.cv',
    tax_id: 'CVT23456791',
    department: 'Design',
    position: 'UX Designer',
    employment_type: 'Full Time',
    start_date: '2023-03-15',
    work_location: 'Mindelo',
    compensation: {
      base_salary: 75000,
      food_allowance: 6500,
      communication_allowance: 3500,
      attendance_bonus: 5000,
      assiduity_bonus: 5000
    },
    banking: {
      bank_name: 'Banco Interatlântico',
      account_number: '45678912300'
    },
    address: {
      street: 'Rua do Sol 789',
      city: 'Mindelo',
      country: 'Cape Verde'
    }
  },
  {
    employee_id: 'EMP004',
    name: 'Sofia Monteiro',
    email: 'sofia.monteiro@company.cv',
    tax_id: 'CVT23456792',
    department: 'Marketing',
    position: 'Marketing Manager',
    employment_type: 'Full Time',
    start_date: '2023-04-01',
    work_location: 'Praia',
    compensation: {
      base_salary: 90000,
      food_allowance: 6500,
      communication_allowance: 3500,
      attendance_bonus: 5000,
      assiduity_bonus: 5000
    },
    banking: {
      bank_name: 'Banco Comercial do Atlântico',
      account_number: '23456789012'
    },
    address: {
      street: 'Avenida Cidade de Lisboa 234',
      city: 'Praia',
      country: 'Cape Verde'
    }
  },
  {
    employee_id: 'EMP005',
    name: 'Lucas Costa',
    email: 'lucas.costa@company.cv',
    tax_id: 'CVT23456793',
    department: 'Engineering',
    position: 'Frontend Developer',
    employment_type: 'Full Time',
    start_date: '2023-05-15',
    work_location: 'Praia',
    compensation: {
      base_salary: 78000,
      food_allowance: 6500,
      communication_allowance: 3500,
      attendance_bonus: 5000,
      assiduity_bonus: 5000
    },
    banking: {
      bank_name: 'Caixa Económica',
      account_number: '34567890123'
    },
    address: {
      street: 'Rua Serpa Pinto 567',
      city: 'Praia',
      country: 'Cape Verde'
    }
  }
];

const timeEntries = [
  {
    employee_id: 'EMP001',
    entry_date: '2024-03-01',
    clock_in: '09:00',
    clock_out: '18:00',
    total_hours: 9,
    break_time: 1,
    overtime_hours: 0,
    status: 'regular',
    notes: ''
  },
  {
    employee_id: 'EMP001',
    entry_date: '2024-03-02',
    clock_in: 'Day Off',
    clock_out: 'Day Off',
    total_hours: 0,
    break_time: 0,
    overtime_hours: 0,
    status: 'dayoff',
    notes: 'Weekend'
  },
  {
    employee_id: 'EMP002',
    entry_date: '2024-03-01',
    clock_in: '08:30',
    clock_out: '17:30',
    total_hours: 9,
    break_time: 1,
    overtime_hours: 0,
    status: 'regular',
    notes: ''
  },
  {
    employee_id: 'EMP003',
    entry_date: '2024-03-01',
    clock_in: '09:15',
    clock_out: '18:15',
    total_hours: 9,
    break_time: 1,
    overtime_hours: 0,
    status: 'regular',
    notes: ''
  },
  {
    employee_id: 'EMP004',
    entry_date: '2024-03-01',
    clock_in: '08:45',
    clock_out: '17:45',
    total_hours: 9,
    break_time: 1,
    overtime_hours: 0,
    status: 'regular',
    notes: ''
  },
  {
    employee_id: 'EMP005',
    entry_date: '2024-03-01',
    clock_in: '09:30',
    clock_out: '18:30',
    total_hours: 9,
    break_time: 1,
    overtime_hours: 0,
    status: 'regular',
    notes: ''
  }
];

export async function initializeFirebaseData() {
  try {
    // Check if data already exists
    const employeesRef = collection(db, 'employees');
    const existingEmployees = await getDocs(query(employeesRef));
    
    if (existingEmployees.empty) {
      console.log('Initializing Firebase with sample data...');
      
      // Add employees
      const batch = writeBatch(db);
      
      for (const employee of employees) {
        const employeeRef = collection(db, 'employees');
        await addDoc(employeeRef, {
          ...employee,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      // Add time entries
      for (const entry of timeEntries) {
        // Get the actual employee ID from Firebase
        const employeeQuery = query(
          employeesRef, 
          where('employee_id', '==', entry.employee_id)
        );
        const employeeDoc = await getDocs(employeeQuery);
        const employeeId = employeeDoc.docs[0]?.id;
        
        if (employeeId) {
          const timeEntryRef = collection(db, 'time_entries');
          await addDoc(timeEntryRef, {
            ...entry,
            employee_id: employeeId,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      await batch.commit();
      console.log('Sample data initialized successfully!');
    } else {
      console.log('Data already exists in Firebase');
    }
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    throw error;
  }
}