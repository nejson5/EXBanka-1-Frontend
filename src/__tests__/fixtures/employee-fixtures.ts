import type { Employee } from '@/types/employee'

export function createMockEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    first_name: 'Jane',
    last_name: 'Doe',
    date_of_birth: 946684800,
    gender: 'Female',
    email: 'jane.doe@example.com',
    phone: '+38161000000',
    address: '123 Main St',
    username: 'jane.doe',
    position: 'Teller',
    department: 'Retail',
    active: true,
    role: 'EmployeeBasic',
    permissions: ['accounts.read', 'transactions.create'],
    ...overrides,
  }
}
