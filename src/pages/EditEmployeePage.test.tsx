import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EditEmployeePage } from '@/pages/EditEmployeePage'
import * as employeesApi from '@/lib/api/employees'
import { createMockEmployee } from '@/__tests__/fixtures/employee-fixtures'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/employees')

beforeEach(() => jest.clearAllMocks())

describe('EditEmployeePage', () => {
  it('loads and displays employee data', async () => {
    const employee = createMockEmployee({ first_name: 'Jane', last_name: 'Doe' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(employee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByDisplayValue('Jane')
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('shows loading while fetching', () => {
    jest.mocked(employeesApi.getEmployee).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows read-only view for admin-role employees', async () => {
    const adminEmployee = createMockEmployee({ role: 'EmployeeAdmin', first_name: 'Boss' })
    jest.mocked(employeesApi.getEmployee).mockResolvedValue(adminEmployee)

    renderWithProviders(<EditEmployeePage />, {
      preloadedState: { auth: createMockAuthState() },
      route: '/employees/1',
      routePath: '/employees/:id',
    })

    await screen.findByText(/cannot edit administrators/i)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })
})
