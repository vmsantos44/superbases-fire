export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  employmentType: 'Full Time' | 'Part Time' | 'Contract';
  startDate: string;
  taxId: string;
  workLocation: string;
  compensation: {
    baseSalary: number;
    allowances: {
      food: number;
      communication: number;
      attendance: number;
      assiduity: number;
    };
  };
  bankingInfo: {
    bankName: string;
    accountNumber: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

export const mockEmployees: Employee[] = [
  {
    id: 'EMP001',
    name: 'João Silva',
    email: 'joao.silva@company.cv',
    position: 'Software Engineer',
    department: 'Engineering',
    employmentType: 'Full Time',
    startDate: '2023-01-15',
    taxId: 'CVT23456789',
    workLocation: 'Praia',
    compensation: {
      baseSalary: 85000,
      allowances: {
        food: 6500,
        communication: 3500,
        attendance: 5000,
        assiduity: 5000
      }
    },
    bankingInfo: {
      bankName: 'Banco Comercial do Atlântico',
      accountNumber: '12345678900'
    },
    address: {
      street: 'Rua Principal 123',
      city: 'Praia',
      country: 'Cape Verde'
    }
  },
  {
    id: 'EMP002',
    name: 'Maria Santos',
    email: 'maria.santos@company.cv',
    position: 'Product Manager',
    department: 'Product',
    employmentType: 'Full Time',
    startDate: '2023-02-01',
    taxId: 'CVT23456790',
    workLocation: 'Praia',
    compensation: {
      baseSalary: 95000,
      allowances: {
        food: 6500,
        communication: 3500,
        attendance: 5000,
        assiduity: 5000
      }
    },
    bankingInfo: {
      bankName: 'Caixa Económica',
      accountNumber: '98765432100'
    },
    address: {
      street: 'Avenida Central 456',
      city: 'Praia',
      country: 'Cape Verde'
    }
  },
  {
    id: 'EMP003',
    name: 'António Ferreira',
    email: 'antonio.ferreira@company.cv',
    position: 'UX Designer',
    department: 'Design',
    employmentType: 'Full Time',
    startDate: '2023-03-15',
    taxId: 'CVT23456791',
    workLocation: 'Mindelo',
    compensation: {
      baseSalary: 75000,
      allowances: {
        food: 6500,
        communication: 3500,
        attendance: 5000,
        assiduity: 5000
      }
    },
    bankingInfo: {
      bankName: 'Banco Interatlântico',
      accountNumber: '45678912300'
    },
    address: {
      street: 'Rua do Sol 789',
      city: 'Mindelo',
      country: 'Cape Verde'
    }
  }
];